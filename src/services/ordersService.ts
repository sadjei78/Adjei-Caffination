import axios from 'axios';
import { Order, OrderStatus } from '../types/types';

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
        return response.data;
    } catch (error) {
        console.error('Error saving order:', error);
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