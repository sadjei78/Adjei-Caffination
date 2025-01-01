import React from 'react';
import styled from '@emotion/styled';
import { DrinkItem } from '../types/types';

const MenuContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const MenuColumn = styled.div`
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }
`;

const DrinkItemContainer = styled.div`
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background-color: #f5f5f5;
    .drink-actions {
      opacity: 1;
    }
  }

  .drink-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
`;

interface DrinkMenuProps {
  drinks: DrinkItem[];
  onOrderClick: (drink: DrinkItem) => void;
}

const DrinkMenu: React.FC<DrinkMenuProps> = ({ drinks, onOrderClick }) => {
  console.log('DrinkMenu rendered with drinks:', drinks); // Debug log

  const hotDrinks = drinks.filter(drink => drink.temperature === 'warm');
  const coldDrinks = drinks.filter(drink => drink.temperature === 'iced');

  return (
    <MenuContainer>
      <MenuColumn>
        <h2>Hot Drinks</h2>
        {hotDrinks.map(drink => (
          <DrinkItemContainer key={drink.id}>
            <span>{drink.name}</span>
            <div className="drink-actions">
              <span>${drink.price.toFixed(2)}</span>
              <button onClick={() => onOrderClick(drink)}>Order</button>
            </div>
          </DrinkItemContainer>
        ))}
      </MenuColumn>
      
      <MenuColumn>
        <h2>Cold Drinks</h2>
        {coldDrinks.map(drink => (
          <DrinkItemContainer key={drink.id}>
            <span>{drink.name}</span>
            <div className="drink-actions">
              <span>${drink.price.toFixed(2)}</span>
              <button onClick={() => onOrderClick(drink)}>Order</button>
            </div>
          </DrinkItemContainer>
        ))}
      </MenuColumn>
    </MenuContainer>
  );
};

export default DrinkMenu; 