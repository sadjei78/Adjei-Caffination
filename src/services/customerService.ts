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
    // Set cookie to expire in 1 year
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    const expires = new Date(Date.now() + oneYear).toUTCString();
    document.cookie = `${CUSTOMER_ID_COOKIE}=${customerId}; expires=${expires}; path=/`;
  }

  return customerId;
}; 