import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authService } from '../services/authService';
import ButtonStyles from '../styles/Button';

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();

  // Get token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const handleSubmit = async () => {
    try {
      setError('');

      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      // Validate inputs
      if (!newPassword || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!token) {
        setError('Invalid reset link. Please request a new password reset.');
        return;
      }

      // Call API to reset password
      await authService.resetPassword(token, newPassword);

      // Show success message and clear form
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');

      // Navigate to login after 2 seconds
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);
      setError(error.response?.data?.error || 'Failed to reset password. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Your Password</Text>
      
      {!success ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={ButtonStyles.primaryButton}
            onPress={handleSubmit}
          >
            <Text style={ButtonStyles.buttonText}>Reset Password</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.success}>
            Password reset successful! Redirecting to login...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#6b46c1',
  },
  input: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  error: {
    color: '#e53e3e',
    marginBottom: 15,
    textAlign: 'center',
    maxWidth: 400,
  },
  successContainer: {
    alignItems: 'center',
    maxWidth: 400,
  },
  success: {
    color: '#38a169',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default ResetPasswordScreen;
