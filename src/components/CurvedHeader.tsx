import React from 'react';
import styled from '@emotion/styled';

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CurvedText = styled.div`
  position: relative;
  width: 400px;
  height: 200px;
  
  @font-face {
    font-family: 'Kundiman';
    src: url('/assets/fonts/Kundiman.otf') format('opentype');
  }

  path {
    fill: transparent;
  }

  text {
    font-family: 'Kundiman', sans-serif;
    font-size: 48px;
    fill: #333;
  }
`;

const Logo = styled.img`
  position: absolute;
  top: 100px;
  width: 200px;
  opacity: 0.7;
`;

const CurvedHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <CurvedText>
        <svg viewBox="0 0 400 200">
          <path
            id="curve"
            d="M 50 150 Q 200 50 350 150"
          />
          <text>
            <textPath href="#curve" textAnchor="middle" startOffset="50%">
              Coffee Menu
            </textPath>
          </text>
        </svg>
      </CurvedText>
      <Logo src="/assets/CoffeeLogo.png" alt="Coffee Logo" />
    </HeaderContainer>
  );
};

export default CurvedHeader; 