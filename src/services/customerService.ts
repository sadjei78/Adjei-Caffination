import { v4 as uuidv4 } from 'uuid';

const CUSTOMER_ID_COOKIE = 'customerUUID';

export const getCustomerId = (): string => {
  // Debug: Log all cookies
  console.log('Current cookies:', document.cookie);

  // Try to get existing ID from cookie
  let customerId = document.cookie
    .split('; ')
    .find(row => row.startsWith(CUSTOMER_ID_COOKIE))
    ?.split('=')[1];

  // If no existing ID, generate new one and set cookie
  if (!customerId) {
    customerId = uuidv4();
    const isProduction = window.location.protocol === 'https:';
    
    // Build cookie string with proper attributes
    const cookieOptions = [
      `${CUSTOMER_ID_COOKIE}=${customerId}`,
      'path=/',
      'max-age=31536000',  // 1 year in seconds
      'SameSite=Strict',
      isProduction ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    console.log('Setting new cookie:', cookieOptions);
    document.cookie = cookieOptions;
  }

  return customerId;
}; 