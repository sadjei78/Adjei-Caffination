export interface DrinkItem {
    id: string;
    name: string;
    price: number;
    description: string;
    temperature: 'warm' | 'iced';
}

export interface Topping {
    id: string;
    name: string;
    price: number;
}

export type OrderStatus = 'New' | 'Brewing' | 'On Hold' | 'Delivered' | 'Cancelled';

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    drinkName: string;
    seatingLocation: string;
    toppings?: string[];
    specialInstructions?: string;
    orderStatus: OrderStatus;
    timestamp: string;
    rating?: number;
    feedbackComment?: string;
    feedbackTimestamp?: string;
    current?: string;
}

export interface OrderFormData {
    customerName: string;
    seatingLocation: string;
    specialInstructions: string;
}

export interface OrderFeedback {
    orderId: string;
    rating: number;
    comment: string;
    timestamp: string;
} 