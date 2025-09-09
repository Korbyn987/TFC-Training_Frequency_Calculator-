import axios from 'axios';

// Use different URLs based on platform
const API_URL = 'http://localhost:5001/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const login = async (identifier, password) => {
  try {
    console.log('Attempting login with:', { identifier, password });
    const response = await axios.post(`${API_URL}/login`, 
      { identifier, password },
      {
        headers: {
          'Accept': 'application/json',
        },
        withCredentials: true
      }
    );
    console.log('Login response:', response.data);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
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
    const response = await axios.post(`${API_URL}/auth/reset-password`, { 
      token, 
      newPassword // Match the backend's expected parameter name
    });
    return { success: true, ...response.data };
  } catch (error) {
    console.error('Reset password error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to reset password' 
    };
  }
};

const recoverUsername = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/recover-username`, {
      email
    });
    return response.data;
  } catch (error) {
    console.error(
      "Recover username error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const authService = {
  login,
  logout,
  createAccount,
  forgotPassword,
  resetPassword,
  recoverUsername
};
