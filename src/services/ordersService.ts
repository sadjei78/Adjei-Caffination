import axios from 'axios';
import { Order, OrderStatus } from '../types/types';
import { google } from 'googleapis';

const sheets = google.sheets('v4');

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    throw new Error('API URL not configured in environment variables');
}

// Generate or retrieve customer ID
const getCustomerId = (): string => {
    let customerId = localStorage.getItem('customerId');
    if (!customerId) {
        customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('customerId', customerId);
    }
    return customerId;
};

// Save a new order
export const saveOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    try {
        const response = await axios.post(`${API_URL}/orders`, {
            ...orderData,
            customerId: getCustomerId()
        });
        await saveOrderToSheet(response.data);
        return response.data;
    } catch (error: any) {
        console.error('Error saving order:', error.response?.data || error.message);
        throw error;
    }
};

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
    try {
        const response = await axios.get(`${API_URL}/orders`);
        return response.data;
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

// Get orders for a specific customer
export const getUserOrders = async (customerName: string): Promise<Order[]> => {
    try {
        const customerId = getCustomerId();
        const response = await axios.get(`${API_URL}/orders/${customerId}`);
        console.log('Response Data:', response.data);
        const orders = Array.isArray(response.data) ? response.data : [];
        return orders.filter((order: Order) => 
            order.customerName.toLowerCase() === customerName.toLowerCase()
        );
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

// Update order status
export const updateOrderStatus = async (orderId: string, newStatus: OrderStatus): Promise<Order | null> => {
    try {
        const response = await axios.patch(`${API_URL}/orders/${orderId}`, {
            orderStatus: newStatus
        });
        return response.data;
    } catch (error) {
        console.error('Error updating order status:', error);
        return null;
    }
};

// Get order statistics
export const getOrderStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching order stats:', error);
        return {
            total: 0,
            new: 0,
            brewing: 0,
            completed: 0,
            cancelled: 0
        };
    }
};

export const saveOrderToSheet = async (orderData: Order) => {
    const auth = new google.auth.GoogleAuth({
        keyFile: import.meta.env.SERVICE_ACCOUNT_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    try {
        const client = await auth.getClient();
        const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;

        if (!spreadsheetId) {
            throw new Error('Google Sheet ID not configured in environment variables');
        }

        // Get the current values in the sheet to find the next empty row
        const getRowsResponse = await sheets.spreadsheets.values.get({
            auth: client as any,
            spreadsheetId,
            range: 'Orders!A:A',
        });

        const rows = getRowsResponse.data.values || [];
        const nextRow = rows.length + 1;

        const range = `Orders!A${nextRow}`;

        const values = [
            [
                orderData.timestamp,
                orderData.id,
                orderData.drinkName,
                orderData.customerName,
                orderData.seatingLocation,
                orderData.toppings.join(', '),
                orderData.specialInstructions || '',
            ],
        ];

        const resource = {
            values,
        };

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource,
            auth: client,
        } as any);
        console.log('Order saved to Google Sheets successfully');
    } catch (error: any) {
        console.error('Error saving order to Google Sheets:', error.response?.data || error.message);
    }
}; 