import axios from 'axios';
const API_BASE = 'http://localhost:4000/api/v1';

export const createCheckoutSession = async (cartItems) => {
  const res = await axios.post(`${API_BASE}/checkout/create-session`, { items: cartItems });
  return res.data; 
};
