import { v4 as uuidv4 } from 'uuid';

const CUSTOMER_ID_COOKIE = 'customerUUID';

export const getCustomerId = (): string => {
  // Try to get existing ID from cookie
  let customerId = document.cookie
    .split('; ')
    .find(row => row.startsWith(CUSTOMER_ID_COOKIE))
    ?.split('=')[1];

  // If no existing ID, generate new one and set cookie
  if (!customerId) {
    customerId = uuidv4();
    
    // Set cookie with appropriate attributes for both environments
    const cookieString = [
      `${CUSTOMER_ID_COOKIE}=${customerId}`,
      'path=/',
      'max-age=31536000',  // 1 year
      window.location.protocol === 'https:' ? 'Secure' : '',
      'SameSite=Lax'
    ].filter(Boolean).join('; ');

    document.cookie = cookieString;
  }

  return customerId;
}; 