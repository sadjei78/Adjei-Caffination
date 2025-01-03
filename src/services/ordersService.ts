import { Order, OrderStatus } from '../types/types';
import { v4 as uuidv4 } from 'uuid';

// Get orders from localStorage
export const getStoredOrders = (): Order[] => {
  const ordersJson = localStorage.getItem('orders');
  return ordersJson ? JSON.parse(ordersJson) : [];
};

// Save orders to localStorage
const saveOrdersToStorage = (orders: Order[]) => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

const FORM_ID = import.meta.env.VITE_FORM_ID;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=1437859386`;

// Add interface for sheet data
// interface SheetOrder {
//   id: string;
//   status: OrderStatus;
//   timestamp: string;
// }

const submitToGoogleForm = async (order: Order, status: OrderStatus) => {
  const params = new URLSearchParams();
  
  // Add all fields to ensure we're not missing any required ones
  params.append('entry.1820405638', order.id);
  params.append('entry.1193225583', order.customerId);
  params.append('entry.1811585605', order.customerName);
  params.append('entry.2057993662', order.drinkName);
  params.append('entry.1843383527', order.seatingLocation);
  if (order.toppings?.length) {
    order.toppings.forEach(topping => {
      params.append('entry.467545116', topping);
    });
  }
  params.append('entry.344098071', order.specialInstructions || '');
  params.append('entry.1278574187', status);  // Status update

  console.log('Submitting form with data:', {
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    drinkName: order.drinkName,
    toppings: order.toppings,
    specialInstructions: order.specialInstructions,
    status: status
  });

  try {
    const response = await fetch(
      `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      }
    );
    
    console.log('Form submission response:', response);
    
    // Add a small delay to allow the sheet to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return response;
  } catch (error) {
    console.error('Failed to submit to Google Form:', error);
    throw error;
  }
};

// Save order
export const saveOrder = async (orderData: Omit<Order, 'id' | 'orderStatus' | 'timestamp' | 'customerId'>): Promise<Order> => {
  const orders = getStoredOrders();
  const customerId = document.cookie
    .split('; ')
    .find(row => row.startsWith('customerUUID'))
    ?.split('=')[1];

  if (!customerId) {
    throw new Error('No customer ID found');
  }
  
  const newOrder: Order = {
    ...orderData,
    id: uuidv4(),
    customerId: customerId,
    orderStatus: 'New',
    timestamp: new Date().toISOString()
  };
  
  orders.push(newOrder);
  saveOrdersToStorage(orders);
  await submitToGoogleForm(newOrder, newOrder.orderStatus);
  return newOrder;
};

// Add sync function
const syncOrdersWithSheet = async () => {
  try {
    const response = await fetch(SHEET_URL, {
      cache: 'no-store',  // Force fresh request
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    const text = await response.text();
    const jsonText = text.replace('/*O_o*/', '')
                        .replace('google.visualization.Query.setResponse(', '')
                        .replace(');', '');
    const jsonData = JSON.parse(jsonText);
    
    console.log('Raw sheet data:', jsonData.table.rows);
    
    const sheetOrders = jsonData.table.rows
      .slice(1) // Skip header row
      .map((row: any) => {
        const order = {
          timestamp: row.c[0]?.v,        // Column A: Timestamp
          id: row.c[1]?.v,              // Column B: OrderID
          customerId: row.c[2]?.v,       // Column C: CustomerID
          customerName: row.c[3]?.v,     // Column D: Customer Name
          drinkName: row.c[4]?.v,        // Column E: Drink Name
          toppings: row.c[5]?.v ? row.c[5]?.v.split(',').map((t: string) => t.trim()) : [], // Column F: Toppings
          specialInstructions: row.c[6]?.v || '',  // Column G: Special Instructions
          orderStatus: row.c[7]?.v as OrderStatus, // Column H: Status
          rating: row.c[8]?.v,           // Column I: Rating
          feedbackComment: row.c[9]?.v,  // Column J: Feedback Comment
          feedbackTimestamp: row.c[10]?.v, // Column K: Feedback Timestamp
          seatingLocation: row.c[11]?.v || 'Not specified', // Column L: Seating Location
          current: row.c[12]?.v          // Column M: Current
        };
        return order;
      })
      .filter((order: Order) => {
        return order.id && 
               order.customerName && 
               order.drinkName && 
               order.current === 'Latest';
      });

    return sheetOrders;
  } catch (error) {
    console.error('Failed to sync with sheet:', error);
    return [];
  }
};

// Update getUserOrders to only show localStorage orders
export const getUserOrders = async (): Promise<Order[]> => {
  return getStoredOrders();
};

// Keep the original sync function for Barista view
export const getAllOrders = async (): Promise<Order[]> => {
  return syncOrdersWithSheet();
};

// Update order status
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<Order | null> => {
  try {
    const allOrders = await getAllOrders();
    const order = allOrders.find(o => o.id === orderId);
    
    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    await submitToGoogleForm({
      ...order,
      orderStatus: status
    }, status);

    return {
      ...order,
      orderStatus: status
    };
  } catch (error) {
    console.error('Failed to update order status:', error);
    throw error;
  }
};

interface OrderFeedback {
  orderId: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export const saveFeedback = async (feedback: OrderFeedback): Promise<void> => {
  // Get current order data first
  const allOrders = await getAllOrders();
  const order = allOrders.find(o => o.id === feedback.orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${feedback.orderId}`);
  }

  const params = new URLSearchParams();
  
  // Add all fields from the order
  params.append('entry.1820405638', order.id);
  params.append('entry.1193225583', order.customerId);
  params.append('entry.1811585605', order.customerName);
  params.append('entry.2057993662', order.drinkName);
  if (order.toppings?.length) {
    order.toppings.forEach(topping => {
      params.append('entry.467545116', topping);
    });
  }
  params.append('entry.344098071', order.specialInstructions || '');
  
  // Add feedback fields
  params.append('entry.236727573', feedback.rating.toString());
  params.append('entry.1060592436', feedback.comment || '');
  params.append('entry.479271785', feedback.timestamp);
  params.append('entry.1278574187', order.orderStatus); // Use current order status instead of 'Feedback'

  console.log('Submitting feedback with all fields:', {
    orderId: order.id,
    customerId: order.customerId,
    customerName: order.customerName,
    drinkName: order.drinkName,
    toppings: order.toppings,
    specialInstructions: order.specialInstructions,
    rating: feedback.rating,
    comment: feedback.comment,
    timestamp: feedback.timestamp,
    status: order.orderStatus
  });

  try {
    const response = await fetch(
      `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`,
      {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      }
    );

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Feedback submission response:', response);
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
}; 