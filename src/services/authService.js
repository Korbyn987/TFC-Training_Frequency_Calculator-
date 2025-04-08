import axios from 'axios';

// Use different URLs based on platform
const API_URL = 'http://localhost:5001/api';

const login = async (identifier, password) => {
  try {
    console.log('Attempting login with:', { identifier, password });
    const response = await axios.post(`${API_URL}/login`, { identifier, password });
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
};

const logout = () => {
  // Clear any auth tokens or user data from local storage if needed
  localStorage.removeItem('user');
  return Promise.resolve();
};

const createAccount = async (username, password, email) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, password, email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (token, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { token, newPassword });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login,
  logout,
  createAccount,
  forgotPassword,
  resetPassword,
};
