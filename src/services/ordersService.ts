import { Order, OrderStatus } from '../types/types';

// Get orders from localStorage
const getStoredOrders = (): Order[] => {
  const orders = localStorage.getItem('orders');
  return orders ? JSON.parse(orders) : [];
};

// Save orders to localStorage
const saveOrdersToStorage = (orders: Order[]) => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

const FORM_ID = import.meta.env.VITE_FORM_ID;
const FORM_URL = `https://docs.google.com/forms/d/e/${FORM_ID}/formResponse`;

const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=1437859386`;

// Add interface for sheet data
// interface SheetOrder {
//   id: string;
//   status: OrderStatus;
//   timestamp: string;
// }

const submitToGoogleForm = async (order: Order, status: OrderStatus) => {
//   const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScYYr5GBM3rJusGkhY11lEvh8pR9TGm74iytQsQFNbUeMXZdQ/formResponse';
  
  const params = new URLSearchParams({
    'entry.1820405638': order.id,
    'entry.1193225583': order.id,
    'entry.1811585605': order.customerName,
    'entry.2057993662': order.drinkName,
    'entry.344098071': order.specialInstructions || '',
    'entry.1278574187': status
  });

  if (order.toppings && order.toppings.length > 0) {
    order.toppings.forEach(topping => {
      params.append('entry.467545116', topping);
    });
  }

  try {
    await fetch(FORM_URL + '?' + params.toString(), {
      method: 'GET',
      mode: 'no-cors',
      credentials: 'omit'
    });
    console.log('Form submission attempted');
    return true;
  } catch (error) {
    console.error('Form submission error:', error);
    return false;
  }
};

// Save order
export const saveOrder = async (orderData: Omit<Order, 'id' | 'orderStatus' | 'timestamp'>): Promise<Order> => {
  const orders = getStoredOrders();
  const newOrder: Order = {
    ...orderData,
    id: Math.random().toString(36).substr(2, 9),
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
        // Log raw row data to see column positions
        console.log('Raw row:', row.c.map((col: any) => col?.v));
        
        const order = {
          timestamp: row.c[0]?.v,        // Column A: Timestamp
          id: row.c[1]?.v,              // Column B: OrderID
          // CustomerID is at row.c[2]   // Column C: CustomerID (skipped)
          customerName: row.c[3]?.v,     // Column D: CustomerName
          drinkName: row.c[4]?.v,        // Column E: DrinkName
          toppings: row.c[5]?.v ? row.c[5]?.v.split(',').map((t: string) => t.trim()) : [], // Column F: Toppings
          specialInstructions: '',        // Not in sheet anymore
          orderStatus: row.c[7]?.v as OrderStatus, // Column H: Status
          seatingLocation: row.c[6]?.v || '',     // Column G: Seating Location
          current: row.c[8]?.v                    // Column I: Current
        };
        console.log('Mapped order:', order);
        return order;
      })
      .filter((order: Order) => {
        console.log('Checking order:', order.id, {
          hasId: !!order.id,
          hasCustomer: !!order.customerName,
          hasDrink: !!order.drinkName,
          hasCurrent: !!order.current,
          currentValue: order.current
        });
        return order.id && 
               order.customerName && 
               order.drinkName && 
               order.current;
      });

    console.log('Filtered orders:', sheetOrders);
    
    saveOrdersToStorage(sheetOrders);
    return sheetOrders;
  } catch (error) {
    console.error('Failed to sync with sheet:', error);
    return getStoredOrders();
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
  const orders = getStoredOrders();
  const orderIndex = orders.findIndex(order => order.id === orderId);
  
  if (orderIndex === -1) return null;
  
  orders[orderIndex].orderStatus = status;
  saveOrdersToStorage(orders);
  
  // Submit status update to Google Form
  await submitToGoogleForm(orders[orderIndex], status);
  
  return orders[orderIndex];
}; 