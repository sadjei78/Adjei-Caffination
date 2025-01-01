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
        const savedOrder = saveOrder(orderData);
        console.log('Order saved:', savedOrder);
        
        localStorage.setItem('customerName', orderData.customerName);
        setCustomerName(orderData.customerName);
        setSelectedDrink(null);
    };

    const router = createBrowserRouter([
        {
            path: "/",
            element: (
                <>
                    <Navigation />
                    <CurvedHeader />
                    <DrinkMenu drinks={drinks} onOrderClick={handleOrderClick} />
                    {selectedDrink && (
                        <OrderForm
                            drink={selectedDrink}
                            onClose={() => setSelectedDrink(null)}
                            onSubmit={handleOrderSubmit}
                        />
                    )}
                    <button 
                        onClick={() => setShowMyOrders(true)}
                        style={{ margin: '2rem auto', display: 'block' }}
                    >
                        My Orders
                    </button>
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