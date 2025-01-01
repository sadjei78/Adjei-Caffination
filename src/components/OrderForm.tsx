import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { DrinkItem, Topping } from '../types/types';
import { fetchToppings } from '../services/googleSheets';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: bold;
  }

  input, textarea, select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`;

const ToppingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
`;

const ToppingCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background: #f5f5f5;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &.primary {
    background: #4a90e2;
    color: white;
  }

  &.secondary {
    background: #ddd;
  }
`;

interface OrderFormProps {
  drink: DrinkItem;
  onClose: () => void;
  onSubmit: (orderData: any) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ drink, onClose, onSubmit }) => {
  const [customerName, setCustomerName] = useState(localStorage.getItem('customerName') || '');
  const [seatingLocation, setSeatingLocation] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);

  useEffect(() => {
    const loadToppings = async () => {
      const toppingsList = await fetchToppings();
      setToppings(toppingsList);
    };
    loadToppings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      drinkName: drink.name,
      temperature: drink.temperature,
      customerName,
      seatingLocation,
      specialInstructions,
      toppings: selectedToppings,
      orderStatus: 'New' as const,
      timestamp: new Date().toISOString()
    };

    onSubmit(orderData);
  };

  return (
    <Overlay onClick={onClose}>
      <Dialog onClick={e => e.stopPropagation()}>
        <h2>Order: {drink.name}</h2>
        <Form onSubmit={handleSubmit}>
          <Field>
            <label>Name</label>
            <input
              type="text"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              required
            />
          </Field>

          <Field>
            <label>Seating Location</label>
            <input
              type="text"
              value={seatingLocation}
              onChange={e => setSeatingLocation(e.target.value)}
              placeholder="e.g., Table 5, Window Seat"
              required
            />
          </Field>

          {toppings.length > 0 && (
            <Field>
              <label>Toppings</label>
              <ToppingsGrid>
                {toppings.map(topping => (
                  <ToppingCheckbox key={topping.id}>
                    <input
                      type="checkbox"
                      checked={selectedToppings.includes(topping.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedToppings([...selectedToppings, topping.name]);
                        } else {
                          setSelectedToppings(selectedToppings.filter(t => t !== topping.name));
                        }
                      }}
                    />
                    {topping.name} (${topping.price.toFixed(2)})
                  </ToppingCheckbox>
                ))}
              </ToppingsGrid>
            </Field>
          )}

          <Field>
            <label>Special Instructions</label>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests?"
              rows={3}
            />
          </Field>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="primary">
              Place Order
            </Button>
          </ButtonGroup>
        </Form>
      </Dialog>
    </Overlay>
  );
};

export default OrderForm; 