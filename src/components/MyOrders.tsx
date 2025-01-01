import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Order } from '../types/types';
import { getUserOrders, updateOrderStatus } from '../services/ordersService';

const Dialog = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const OrderItem = styled.div<{ $status: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: ${({ $status }) => {
    switch ($status.toLowerCase()) {
      case 'new': return '#e3f2fd';
      case 'brewing': return '#fff3e0';
      case 'on hold': return '#fce4ec';
      case 'delivered': return '#e8f5e9';
      case 'cancelled': return '#ffebee';
      default: return 'white';
    }
  }};
  margin-bottom: 0.5rem;

  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    color: ${({ $status }) => {
      switch ($status.toLowerCase()) {
        case 'new': return '#1976d2';
        case 'brewing': return '#f57c00';
        case 'on hold': return '#c2185b';
        case 'delivered': return '#388e3c';
        case 'cancelled': return '#d32f2f';
        default: return '#666';
      }
    }};
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: #f44336;
  color: white;

  &:disabled {
    background: #ddd;
    cursor: not-allowed;
  }
`;

interface MyOrdersProps {
  onClose: () => void;
  customerName: string;
}

const MyOrders: React.FC<MyOrdersProps> = ({ onClose, customerName }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (customerName) {
        setLoading(true);
        try {
          const userOrders = await getUserOrders(customerName);
          const sortedOrders = userOrders.sort((a, b) => {
            const statusPriority = {
              'New': 0,
              'On Hold': 1,
              'Brewing': 2,
              'Delivered': 3,
              'Cancelled': 4
            };
            
            const priorityDiff = statusPriority[a.orderStatus] - statusPriority[b.orderStatus];
            if (priorityDiff !== 0) return priorityDiff;
            
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          
          setOrders(sortedOrders);
        } catch (error) {
          console.error('Error loading orders:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadOrders();
  }, [customerName]);

  const handleCancel = async (orderId: string) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, 'Cancelled');
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <h2>My Orders</h2>
        <OrderList>
          {orders.map(order => (
            <OrderItem key={order.id} $status={order.orderStatus}>
              <div>
                <div>{order.drinkName}</div>
                <div className={`status ${order.orderStatus.toLowerCase()}`}>
                  {order.orderStatus}
                </div>
                <div>{new Date(order.timestamp).toLocaleString()}</div>
              </div>
              <Button
                onClick={() => handleCancel(order.id)}
                disabled={['Delivered', 'Cancelled'].includes(order.orderStatus)}
              >
                Cancel
              </Button>
            </OrderItem>
          ))}
          {orders.length === 0 && (
            <div>No orders found</div>
          )}
        </OrderList>
      </Dialog>
    </Overlay>
  );
};

export default MyOrders; 