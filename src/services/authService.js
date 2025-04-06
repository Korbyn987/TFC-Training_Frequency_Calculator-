import { Platform } from 'react-native';

// Use different URLs based on platform
const API_URL = Platform.select({
  ios: "http://localhost:5001", // iOS simulator
  android: "http://10.0.2.2:5001", // Android emulator
  default: "http://localhost:5001", // Web
});

export const forgotPassword = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send password reset email');
    }
    return data;
  } catch (error) {
    throw error.message || error;
  }
};

export const resetPassword = async (token, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to reset password');
    }
    return data;
  } catch (error) {
    throw error.message || error;
  }
};

export const recoverUsername = async (email) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/recover-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to recover username');
    }
    return data;
  } catch (error) {
    throw error.message || error;
  }
};
