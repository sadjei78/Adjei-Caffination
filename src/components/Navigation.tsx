import React from 'react';
import styled from '@emotion/styled';
import { Link, useMatch } from 'react-router-dom';

const NavLink = styled(Link)`
  text-decoration: none;
  color: #333;
  font-weight: normal;
  padding: 8px 16px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f8f9fa;
  }

  &.active {
    color: #007bff;
    font-weight: bold;
  }
`;

const Nav = styled.nav`
  padding: 1rem;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Navigation: React.FC = () => {
  const showNav = window.location.search.includes('admin=true');
  
  if (!showNav) return null;

  return (
    <Nav>
      <NavLink to="/?admin=true" className={useMatch("/") ? "active" : ""}>
        Order
      </NavLink>
      <NavLink to="/barista?admin=true" className={useMatch("/barista") ? "active" : ""}>
        Barista View
      </NavLink>
    </Nav>
  );
};

export default Navigation; 