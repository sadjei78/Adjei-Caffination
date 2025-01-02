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
    customerName: string;
    drinkName: string;
    toppings?: string[];
    specialInstructions?: string;
    orderStatus: OrderStatus;
    timestamp: string;
    seatingLocation?: string;
    current?: string;
}

export interface OrderFormData {
    customerName: string;
    seatingLocation: string;
    specialInstructions: string;
} 