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
    drinkName: string;
    temperature: 'warm' | 'iced';
    customerName: string;
    seatingLocation: string;
    specialInstructions?: string;
    toppings: string[];
    orderStatus: OrderStatus;
    timestamp: string;
}

export interface OrderFormData {
    customerName: string;
    seatingLocation: string;
    specialInstructions: string;
} 