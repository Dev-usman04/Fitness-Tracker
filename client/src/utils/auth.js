import axios from 'axios';

const API_URL =  'https://fitness-tracker-a64t.vercel.app/api/auth';

let authToken = localStorage.getItem('token') || null;
let currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    authToken = response.data.token;
    currentUser = response.data.user;
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Login failed');
  }
};

export const logout = () => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return currentUser;
};

export const isLoggedIn = () => {
  return !!authToken && !!currentUser;
};

export const getAuthToken = () => authToken;

export const saveUserEmail = async (email) => {
  if (!authToken || !currentUser) throw new Error('Not authenticated');
  try {
    // Assuming you have an endpoint to update user email
    const response = await axios.put(
      `${API_URL}/update-email`,
      { email },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    currentUser = { ...currentUser, email: response.data.email };
    localStorage.setItem('user', JSON.stringify(currentUser));
    return currentUser;
  } catch (error) {
    console.error('Failed to update email:', error);
    throw new Error('Failed to save email');
  }
};
