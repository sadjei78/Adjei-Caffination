import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DrinkItem } from './types/types';
import { fetchDrinkMenu } from './services/googleSheets';
import { saveOrder } from './services/ordersService';
import CurvedHeader from './components/CurvedHeader';
import DrinkMenu from './components/DrinkMenu';
import OrderForm from './components/OrderForm';
import MyOrders from './components/MyOrders';
import BaristaView from './components/BaristaView';
import Navigation from './components/Navigation';
import { Toaster } from 'react-hot-toast';

interface OrderData {
  drinkName: string;
  temperature: 'warm' | 'iced';
  customerName: string;
  seatingLocation: string;
  specialInstructions?: string;
  toppings: string[];
  orderStatus: 'New';
  timestamp: string;
}

const App: React.FC = () => {
    const [drinks, setDrinks] = useState<DrinkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
    const [showMyOrders, setShowMyOrders] = useState(false);
    const [customerName, setCustomerName] = useState<string>(
        localStorage.getItem('customerName') || ''
    );

    useEffect(() => {
        const loadDrinks = async () => {
            const menu = await fetchDrinkMenu();
            setDrinks(menu);
            setLoading(false);
        };
        loadDrinks();
    }, []);

    const handleOrderClick = (drink: DrinkItem) => {
        setSelectedDrink(drink);
    };

    const handleOrderSubmit = (orderData: OrderData) => {
        saveOrder(orderData);
        localStorage.setItem('customerName', orderData.customerName);
        setCustomerName(orderData.customerName);
        setSelectedDrink(null);
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <>
                    <Toaster position="bottom-right" />
                    <Navigation />
                    <CurvedHeader />
                    <DrinkMenu 
                        drinks={drinks} 
                        onOrderClick={handleOrderClick} 
                        onMyOrdersClick={() => setShowMyOrders(true)}
                    />
                    {selectedDrink && (
                        <OrderForm
                            drink={selectedDrink}
                            onClose={() => setSelectedDrink(null)}
                            onSubmit={handleOrderSubmit}
                        />
                    )}
                    {showMyOrders && (
                        <MyOrders 
                            onClose={() => setShowMyOrders(false)}
                            customerName={customerName}
                        />
                    )}
                </>
            ),
        },
        {
            path: "/barista",
            element: (
                <>
                    <Navigation />
                    <BaristaView />
                </>
            ),
        },
    ]);

    if (loading) return <div>Loading menu...</div>;

    return <RouterProvider router={router} />;
};

export default App; 