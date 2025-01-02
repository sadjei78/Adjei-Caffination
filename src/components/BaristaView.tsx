import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Order, OrderStatus } from '../types/types';
import { getUserOrders, updateOrderStatus } from '../services/ordersService';

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
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
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

interface OrderItemProps {
  $status?: OrderStatus;
}

const OrderItem = styled.div<OrderItemProps>`
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  background-color: ${props => {
    switch (props.$status?.toLowerCase()) {
      case 'new': return '#f3f3f3';
      case 'brewing': return '#fff3e0';
      case 'on hold': return '#ffebee';
      case 'delivered': return '#e8f5e9';
      default: return '#ffffff';
    }
  }};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const OrderDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
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
`;

const SpecialInstructions = styled.div`
  font-style: italic;
  color: #666;
  background-color: rgba(0,0,0,0.05);
  padding: 8px;
  border-radius: 4px;
`;

const Timestamp = styled.div`
  font-size: 0.9em;
  color: #999;
`;

const StatusButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Button = styled.button<{ $status?: string }>`
  padding: 8px 16px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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

const BaristaView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await getUserOrders();
      const sortedOrders = fetchedOrders.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (!updatedOrder) {
        throw new Error('Failed to update order');
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) return <Container><PageTitle>Loading orders...</PageTitle></Container>;
  if (error) return <Container><PageTitle>Error: {error}</PageTitle></Container>;

  const renderOrderList = (orders: Order[], title: string) => (
    <StatusSection>
      <StatusTitle>{title}</StatusTitle>
      <OrderList>
        {orders.length > 0 ? (
          orders.map(order => (
            <OrderItem key={order.id} $status={order.orderStatus}>
              <OrderDetails>
                <DrinkName>{order.drinkName}</DrinkName>
                <CustomerInfo>Customer: {order.customerName}</CustomerInfo>
                <CustomerInfo>Location: {order.seatingLocation}</CustomerInfo>
                <CustomerInfo>Status: {order.orderStatus}</CustomerInfo>
                <Timestamp>Last Updated: {formatTimestamp(order.timestamp)}</Timestamp>
                {(order.toppings ?? []).length > 0 && (
                  <Toppings>Toppings: {order.toppings!.join(', ')}</Toppings>
                )}
                {order.specialInstructions && (
                  <SpecialInstructions>
                    Special Instructions: {order.specialInstructions}
                  </SpecialInstructions>
                )}
              </OrderDetails>
              <StatusButtons>
                {['New', 'On Hold', 'Brewing', 'Delivered'].map(status => (
                  <Button
                    key={status}
                    onClick={() => handleStatusUpdate(order.id, status as OrderStatus)}
                    disabled={order.orderStatus === status}
                    $status={status.toLowerCase()}
                  >
                    {status}
                  </Button>
                ))}
              </StatusButtons>
            </OrderItem>
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
        <DashboardCard $bgColor="#e8f5e9">
          <h3>Completed</h3>
          <div>{orders.filter(o => o.orderStatus === 'Delivered').length}</div>
        </DashboardCard>
        <DashboardCard $bgColor="#f3e5f5">
          <h3>Total Orders</h3>
          <div>{orders.length}</div>
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