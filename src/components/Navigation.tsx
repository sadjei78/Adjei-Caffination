import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from '@emotion/styled';

const Nav = styled.div`
  padding: 1rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  text-decoration: none;
  color: ${props => props.$active ? '#4a90e2' : '#333'};
  font-weight: ${props => props.$active ? 'bold' : 'normal'};
  padding: 0.5rem 1rem;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const showNav = searchParams.get('admin') === 'true';

  if (!showNav) return null;

  return (
    <Nav>
      <NavContainer>
        <NavLink to="/" $active={location.pathname === '/'}>
          Coffee Menu
        </NavLink>
        <NavLink to="/barista" $active={location.pathname === '/barista'}>
          Barista View
        </NavLink>
      </NavContainer>
    </Nav>
  );
};

export default Navigation; 