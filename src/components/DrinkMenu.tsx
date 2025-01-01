import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { DrinkItem } from '../types/types';

const MenuContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 2rem;
`;

const MenuColumn = styled.div`
  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 2.5rem;
    color: #B68D40;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
  }
`;

const DrinkItemContainer = styled.div`
  padding: 1rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.85);
  border-radius: 8px;
  
  .drink-name {
    font-size: 1.25rem;
    font-weight: 500;
    color: #333;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.95);
    .drink-actions {
      opacity: 1;
    }
  }

  .drink-actions {
    opacity: 0.9;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;

    .price {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c5282;
    }

    button {
      background-color: #4a5568;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
      
      &:hover {
        background-color: #2d3748;
      }
    }
  }
`;

const DrinkName = styled.span`
  cursor: help;
  border-bottom: 1px dashed #666;
  position: relative;
`;

const MobileTooltip = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  background: rgba(51, 51, 51, 0.95);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  max-width: 90%;
  text-align: center;
  z-index: 1000;
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const MyOrdersButton = styled.button`
  background-color: #B68D40;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
  display: block;
  margin-top: -1rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: #9a7535;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const CafeName = styled.div`
  font-variant: small-caps;
  text-align: center;
  color: #B68D40;
  font-size: 3rem;
  margin-top: -1.5rem;
  margin-bottom: 2rem;
  letter-spacing: 1px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

interface DrinkMenuProps {
  drinks: DrinkItem[];
  onOrderClick: (drink: DrinkItem) => void;
  onMyOrdersClick: () => void;
}

const DrinkMenu: React.FC<DrinkMenuProps> = ({ drinks, onOrderClick, onMyOrdersClick }) => {
  const [activeDescription, setActiveDescription] = useState<string | null>(null);
  const hotDrinks = drinks.filter(drink => drink.temperature === 'warm');
  const coldDrinks = drinks.filter(drink => drink.temperature === 'iced');

  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.classList.add('menu-page');
    }
    
    return () => {
      const root = document.getElementById('root');
      if (root) {
        root.classList.remove('menu-page');
      }
    };
  }, []);

  // Hide description after 3 seconds
  useEffect(() => {
    if (activeDescription) {
      const timer = setTimeout(() => {
        setActiveDescription(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeDescription]);

  const handleDrinkClick = (description: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click handlers
    setActiveDescription(description);
  };

  return (
    <MenuContainer>
      <MyOrdersButton onClick={onMyOrdersClick}>
        My Orders
      </MyOrdersButton>
      <CafeName>Adjei Caffi-Nation</CafeName>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '2rem', 
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <MenuColumn>
          <h2>Hot Drinks</h2>
          {hotDrinks.map(drink => (
            <DrinkItemContainer key={drink.id}>
              <DrinkName 
                title={drink.description}
                onClick={(e) => handleDrinkClick(drink.description, e)}
              >
                {drink.name}
              </DrinkName>
              <div className="drink-actions">
                <span className="price">${drink.price.toFixed(2)}</span>
                <button onClick={() => onOrderClick(drink)}>Order</button>
              </div>
            </DrinkItemContainer>
          ))}
        </MenuColumn>
        
        <MenuColumn>
          <h2>Cold Drinks</h2>
          {coldDrinks.map(drink => (
            <DrinkItemContainer key={drink.id}>
              <DrinkName 
                title={drink.description}
                onClick={(e) => handleDrinkClick(drink.description, e)}
              >
                {drink.name}
              </DrinkName>
              <div className="drink-actions">
                <span className="price">${drink.price.toFixed(2)}</span>
                <button onClick={() => onOrderClick(drink)}>Order</button>
              </div>
            </DrinkItemContainer>
          ))}
        </MenuColumn>
      </div>
      <MobileTooltip $isVisible={!!activeDescription}>
        {activeDescription}
      </MobileTooltip>
    </MenuContainer>
  );
};

export default DrinkMenu; 