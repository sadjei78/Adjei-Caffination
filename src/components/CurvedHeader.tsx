import React from 'react';
import styled from '@emotion/styled';

const HeaderContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const CurvedText = styled.div`
  position: relative;
  width: 600px;
  height: 250px;
  
  @font-face {
    font-family: 'Kundiman';
    src: url('/assets/fonts/Kundiman.otf') format('opentype');
  }

  path {
    fill: transparent;
  }

  text {
    font-family: 'Kundiman', sans-serif;
    font-size: 86px;
    fill: #B68D40;
    text-shadow: 2px 2px 4px rgba(255, 255, 255, 0.8);
  }
`;

const Logo = styled.img`
  position: absolute;
  top: 100px;
  width: 150px;
  opacity: 0.7;
`;

const CurvedHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <CurvedText>
        <svg viewBox="0 0 600 250">
          <path
            id="curve"
            d="M 100 200 Q 300 50 500 200"
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