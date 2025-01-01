import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Order, OrderStatus } from '../types/types';
import { getOrders, updateOrderStatus, getOrderStats } from '../services/ordersService';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const StatusSection = styled.div`
  margin-bottom: 2rem;

  h2 {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #eee;
  }
`;

const OrderCard = styled.div<{ $status: string }>`
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
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

  &:hover {
    transform: translateY(-2px);
  }

  h3 {
    margin: 0 0 0.5rem;
    color: #333;
  }

  p {
    margin: 0.25rem 0;
    color: #666;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $type: 'new' | 'brewing' | 'completed' | 'total' }>`
  padding: 1.5rem;
  border-radius: 8px;
  background: ${({ $type }) => {
    switch ($type) {
      case 'new': return '#e3f2fd';
      case 'brewing': return '#fff3e0';
      case 'completed': return '#e8f5e9';
      case 'total': return '#f3e5f5';
    }
  }};
  order: ${({ $type }) => $type === 'total' ? '4' : 'initial'};

  h3 {
    margin: 0;
    color: #333;
  }

  p {
    margin: 0.5rem 0 0;
    font-size: 2rem;
    font-weight: bold;
    color: ${({ $type }) => {
      switch ($type) {
        case 'new': return '#1976d2';
        case 'brewing': return '#f57c00';
        case 'completed': return '#388e3c';
        case 'total': return '#7b1fa2';
      }
    }};
  }
`;

const OrderDialog = styled.div`
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

const StatusButton = styled.button<{ $status: string }>`
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background: ${props => {
    switch (props.$status) {
      case 'Brewing': return '#fff3e0';
      case 'Delivered': return '#e8f5e9';
      case 'On Hold': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  
  &:hover {
    opacity: 0.8;
  }
`;

const BaristaView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    brewing: 0,
    completed: 0,
    cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedOrders, orderStats] = await Promise.all([
        getOrders(),
        getOrderStats()
      ]);
      setOrders(fetchedOrders);
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading barista data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, newStatus);
      if (updatedOrder) {
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ));
        setSelectedOrder(updatedOrder);
        await loadData(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.orderStatus;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<OrderStatus, Order[]>);

  return (
    <Container>
      <h1>Barista Dashboard</h1>
      
      <StatsContainer>
        <StatCard $type="total">
          <h3>Total Orders</h3>
          <p>{stats.total}</p>
        </StatCard>
        <StatCard $type="new">
          <h3>New Orders</h3>
          <p>{stats.new}</p>
        </StatCard>
        <StatCard $type="brewing">
          <h3>Brewing</h3>
          <p>{stats.brewing}</p>
        </StatCard>
        <StatCard $type="completed">
          <h3>Completed</h3>
          <p>{stats.completed}</p>
        </StatCard>
      </StatsContainer>

      {['New', 'Brewing', 'On Hold', 'Delivered'].map(status => (
        <StatusSection key={status}>
          <h2>{status}</h2>
          <OrdersGrid>
            {groupedOrders[status as OrderStatus]?.map(order => (
              <OrderCard key={order.id} onClick={() => setSelectedOrder(order)} $status={order.orderStatus}>
                <h3>{order.drinkName}</h3>
                <p>Customer: {order.customerName}</p>
                <p>Location: {order.seatingLocation}</p>
                <p>Time: {new Date(order.timestamp).toLocaleTimeString()}</p>
              </OrderCard>
            ))}
          </OrdersGrid>
        </StatusSection>
      ))}

      {selectedOrder && (
        <Overlay onClick={() => setSelectedOrder(null)}>
          <OrderDialog onClick={e => e.stopPropagation()}>
            <h2>Order Details</h2>
            <p><strong>Drink:</strong> {selectedOrder.drinkName}</p>
            <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
            <p><strong>Location:</strong> {selectedOrder.seatingLocation}</p>
            {selectedOrder.specialInstructions && (
              <p><strong>Special Instructions:</strong> {selectedOrder.specialInstructions}</p>
            )}
            {selectedOrder.toppings && selectedOrder.toppings.length > 0 && (
              <p><strong>Toppings:</strong> {selectedOrder.toppings.join(', ')}</p>
            )}
            <div style={{ marginTop: '1rem' }}>
              <strong>Update Status:</strong>
              {['Brewing', 'On Hold', 'Delivered'].map(status => (
                <StatusButton
                  key={status}
                  $status={status}
                  onClick={() => handleStatusUpdate(selectedOrder.id, status as OrderStatus)}
                >
                  {status}
                </StatusButton>
              ))}
            </div>
          </OrderDialog>
        </Overlay>
      )}
    </Container>
  );
};

export default BaristaView; 