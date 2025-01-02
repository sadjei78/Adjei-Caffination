import React from 'react';
import styled from '@emotion/styled';
import { Link, useMatch } from 'react-router-dom';

interface NavLinkProps {
  $isActive: boolean;
}

const NavLink = styled(Link)<NavLinkProps>`
  text-decoration: none;
  color: ${props => props.$isActive ? '#007bff' : '#333'};
  font-weight: ${props => props.$isActive ? 'bold' : 'normal'};
  padding: 8px 16px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const Nav = styled.nav`
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Navigation: React.FC = () => {
  const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;
  const FORM_ID = import.meta.env.VITE_FORM_ID;

  // Check these are properly configured
  if (!SHEET_ID || !FORM_ID) {
    console.error('Environment variables VITE_GOOGLE_SHEET_ID and VITE_FORM_ID are not set up correctly.');
  }

  return (
    <Nav>
      <NavLink to="/" $isActive={useMatch("/") !== null}>
        Order
      </NavLink>
      <NavLink to="/barista" $isActive={useMatch("/barista") !== null}>
        Barista View
      </NavLink>
    </Nav>
  );
};

export default Navigation; 