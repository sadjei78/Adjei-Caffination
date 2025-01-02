import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Order, OrderStatus } from '../types/types';
import { updateOrderStatus, getAllOrders } from '../services/ordersService';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Dashboard = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 0 1rem;
`;

interface DashboardCardProps {
  $bgColor: string;
}

const DashboardCard = styled.div<DashboardCardProps>`
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => props.$bgColor};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const StatusSection = styled.div`
  margin-bottom: 30px;
`;

const StatusTitle = styled.h2`
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const OrderList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const OrderCard = styled.div<{ status: string }>`
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'new': return '#e3f2fd';
      case 'brewing': return '#fff3e0';
      case 'on hold': return '#ffebee';
      case 'delivered': return '#e8f5e9';
      default: return '#ffffff';
    }
  }};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FeedbackSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const Rating = styled.div`
  font-weight: bold;
  color: #f4b400;
`;

const Comment = styled.div`
  font-style: italic;
  color: #666;
  margin-top: 0.5rem;
`;

const DrinkName = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
`;

const CustomerInfo = styled.div`
  font-size: 1em;
  color: #666;
`;

const Toppings = styled.div`
  color: #666;
  margin: 8px 0;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 4px;
  
  strong {
    color: #333;
  }
`;

const SpecialInstructions = styled.div`
  font-style: italic;
  color: #666;
  margin: 8px 0;
  padding: 8px;
  background-color: #fff3cd;
  border-radius: 4px;
  border-left: 3px solid #ffc107;
  
  strong {
    color: #333;
  }
`;

const Timestamp = styled.div`
  font-size: 0.9em;
  color: #999;
`;

const StatusButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button<{ $status?: string }>`
  flex: 1;
  padding: 8px 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  white-space: nowrap;
  background-color: ${props => {
    const status = props.$status || 'default';
    switch (status.toLowerCase()) {
      case 'new': return '#2196f3';
      case 'brewing': return '#ff9800';
      case 'on hold': return '#f44336';
      case 'delivered': return '#4caf50';
      default: return '#e0e0e0';
    }
  }};
  color: white;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NoOrders = styled.div`
  text-align: center;
  color: #666;
  padding: 40px;
  grid-column: 1 / -1;
  font-size: 1.2em;
`;

const OrderItem: React.FC<{ order: Order; onStatusUpdate: (id: string, status: OrderStatus) => void }> = ({
  order,
  onStatusUpdate,
}) => {
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
    <OrderCard status={order.orderStatus}>
      <DrinkName>{order.drinkName}</DrinkName>
      <CustomerInfo>Customer: {order.customerName}</CustomerInfo>
      
      {/* Toppings Section */}
      {order.toppings && order.toppings.length > 0 && (
        <Toppings>
          <strong>Toppings:</strong> {order.toppings.join(', ')}
        </Toppings>
      )}
      
      {/* Special Instructions Section */}
      {order.specialInstructions && (
        <SpecialInstructions>
          <strong>Special Instructions:</strong> {order.specialInstructions}
        </SpecialInstructions>
      )}
      
      <CustomerInfo>Status: {order.orderStatus}</CustomerInfo>
      <CustomerInfo>Location: {order.seatingLocation || 'Not specified'}</CustomerInfo>
      <Timestamp>Last updated: {formattedDate}</Timestamp>
      
      {/* Feedback Section */}
      {order.rating && (
        <FeedbackSection>
          <h4>Customer Feedback</h4>
          <Rating>Rating: {'⭐'.repeat(order.rating)}</Rating>
          {order.feedbackComment && (
            <Comment>"{order.feedbackComment}"</Comment>
          )}
        </FeedbackSection>
      )}

      <StatusButtons>
        {['New', 'Brewing', 'Delivered', 'On Hold'].map(status => (
          <Button
            key={status}
            onClick={() => onStatusUpdate(order.id, status as OrderStatus)}
            disabled={order.orderStatus === status}
            $status={status.toLowerCase()}
          >
            {status}
          </Button>
        ))}
      </StatusButtons>
    </OrderCard>
  );
};

const BaristaView: React.FC = () => {
  const showView = window.location.search.includes('admin=true');
  
  if (!showView) {
    return <div>Access Denied</div>;
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const allOrders = await getAllOrders();
        const latestOrders = allOrders.reduce((latest: Order[], order) => {
          const existingIndex = latest.findIndex(o => o.id === order.id);
          if (existingIndex === -1) {
            latest.push(order);
          } else if (new Date(order.timestamp) > new Date(latest[existingIndex].timestamp)) {
            latest[existingIndex] = order;
          }
          return latest;
        }, []);

        setOrders(latestOrders);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('Failed to fetch orders');
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      
      if (!updatedOrder) {
        throw new Error(`Order not found: ${orderId}`);
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );

    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const renderOrderList = (orders: Order[], title: string) => (
    <StatusSection>
      <StatusTitle>{title}</StatusTitle>
      <OrderList>
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderItem
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        ) : (
          <NoOrders>No {title.toLowerCase()} orders</NoOrders>
        )}
      </OrderList>
    </StatusSection>
  );

  return (
    <Container>
      <PageTitle>Barista Dashboard</PageTitle>
      <Dashboard>
        <DashboardCard $bgColor="#e3f2fd">
          <h3>New Orders</h3>
          <div>{orders.filter(o => o.orderStatus === 'New').length}</div>
        </DashboardCard>
        <DashboardCard $bgColor="#fff3e0">
          <h3>Brewing</h3>
          <div>{orders.filter(o => o.orderStatus === 'Brewing').length}</div>
        </DashboardCard>
        <DashboardCard $bgColor="#ffebee">
          <h3>On Hold</h3>
          <div>{orders.filter(o => o.orderStatus === 'On Hold').length}</div>
        </DashboardCard>
        <DashboardCard $bgColor="#e8f5e9">
          <h3>Completed</h3>
          <div>{orders.filter(o => o.orderStatus === 'Delivered').length}</div>
        </DashboardCard>
        <DashboardCard $bgColor="#f3e5f5">
          <h3>Total Orders</h3>
          <div>{orders.filter(o => o.orderStatus !== 'Cancelled').length}</div>
        </DashboardCard>
      </Dashboard>

      {renderOrderList(orders.filter(o => o.orderStatus === 'New'), 'New Orders')}
      {renderOrderList(orders.filter(o => o.orderStatus === 'Brewing'), 'Currently Brewing')}
      {renderOrderList(orders.filter(o => o.orderStatus === 'On Hold'), 'On Hold')}
      {renderOrderList(orders.filter(o => o.orderStatus === 'Delivered'), 'Completed Orders')}
    </Container>
  );
};

export default BaristaView; 