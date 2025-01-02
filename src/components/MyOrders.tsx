import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Order, OrderFeedback } from '../types/types';
import { updateOrderStatus, getAllOrders, saveFeedback } from '../services/ordersService';
import FeedbackForm from './FeedbackForm';
import { toast } from 'react-hot-toast';

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
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const customerId = document.cookie
        .split('; ')
        .find(row => row.startsWith('customerUUID'))
        ?.split('=')[1];

      if (!customerId) {
        setOrders([]);
        toast.error('Please refresh the page and try again');
        return;
      }

      const allOrders = await getAllOrders();
      const customerOrders = allOrders
        .filter(order => order.customerId === customerId)
        .sort((a, b) => {
          const isCompletedA = ['Delivered', 'Cancelled'].includes(a.orderStatus);
          const isCompletedB = ['Delivered', 'Cancelled'].includes(b.orderStatus);
          
          if (isCompletedA !== isCompletedB) {
            return isCompletedA ? 1 : -1;
          }
          
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        });
      
      setOrders(customerOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Unable to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Refresh orders every 30 seconds
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
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

  const handleFeedbackSubmit = async (feedback: OrderFeedback) => {
    try {
      await saveFeedback(feedback);
      setShowFeedback(null);
      // Show success toast
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Show error toast
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  const renderOrderCard = (order: Order) => {
    // Parse Google Sheets date format and format relative dates
    const formattedDate = order.timestamp ? (() => {
      try {
        const matches = order.timestamp.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\)/);
        if (matches) {
          const [_, year, month, day, hour, minute, second] = matches;
          const orderDate = new Date(
            parseInt(year),
            parseInt(month),
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
          );
          
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Format time
          const timeStr = orderDate.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });

          // Check if date is today/yesterday or needs full date
          if (
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
          ) {
            return `Today at ${timeStr}`;
          } else if (
            orderDate.getDate() === yesterday.getDate() &&
            orderDate.getMonth() === yesterday.getMonth() &&
            orderDate.getFullYear() === yesterday.getFullYear()
          ) {
            return `Yesterday at ${timeStr}`;
          } else {
            // Show year only if different from current year
            const showYear = orderDate.getFullYear() !== today.getFullYear();
            return orderDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: showYear ? 'numeric' : undefined,
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
          }
        }
        return 'Invalid date';
      } catch (e) {
        console.error('Error parsing date:', order.timestamp);
        return 'Invalid date';
      }
    })() : 'No date';

    return (
      <OrderItem key={order.id} $status={order.orderStatus}>
        <div>
          <div>{order.drinkName}</div>
          <div className={`status ${order.orderStatus.toLowerCase()}`}>
            {order.orderStatus}
          </div>
          <div>{formattedDate}</div>
        </div>
        {order.orderStatus === 'Delivered' && !order.rating && (
          <FeedbackButton onClick={() => setShowFeedback(order.id)}>
            Leave Feedback
          </FeedbackButton>
        )}
        <Button
          onClick={() => handleCancel(order.id)}
          disabled={['Delivered', 'Cancelled'].includes(order.orderStatus)}
        >
          Cancel
        </Button>
      </OrderItem>
    );
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <h2>My Orders</h2>
        <OrderList>
          {orders.map(renderOrderCard)}
          {orders.length === 0 && (
            <div>No orders found</div>
          )}
        </OrderList>
        {showFeedback && (
          <FeedbackForm
            orderId={showFeedback}
            onSubmit={handleFeedbackSubmit}
            onClose={() => setShowFeedback(null)}
          />
        )}
      </Dialog>
    </Overlay>
  );
};

const FeedbackButton = styled.button`
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
  }
`;

export default MyOrders; 