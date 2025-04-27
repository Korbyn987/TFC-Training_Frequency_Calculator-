import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { authService } from '../services/authService';
import ButtonStyles from '../styles/Button';

const RecoveryScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('password'); // 'password' or 'username'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dispatch = useDispatch();
  const { recoveryStatus, recoveryError } = useSelector((state) => state.auth);

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');

      if (!email) {
        setError('Please enter your email address');
        return;
      }

      if (mode === 'password') {
        await authService.forgotPassword(email);
        setSuccess('Password reset instructions sent to your email');
      } else {
        await authService.recoverUsername(email);
        setSuccess('Username sent to your email');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Recovery request failed');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'password' ? 'username' : 'password');
    setError('');
    setSuccess('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account Recovery</Text>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[ButtonStyles.button, mode === 'password' && styles.activeToggle]}
          onPress={() => setMode('password')}
        >
          <Text style={ButtonStyles.text}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ButtonStyles.button, mode === 'username' && styles.activeToggle]}
          onPress={() => setMode('username')}
        >
          <Text style={ButtonStyles.text}>Recover Username</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {recoveryStatus && <Text style={styles.successText}>{recoveryStatus}</Text>}
      {recoveryError && <Text style={styles.errorText}>{recoveryError}</Text>}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TouchableOpacity
        style={ButtonStyles.button}
        onPress={handleSubmit}
      >
        <Text style={ButtonStyles.text}>
          {mode === 'password' ? 'Reset Password' : 'Recover Username'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[ButtonStyles.outlineButton, styles.backButton]}
        onPress={() => navigation.goBack()}
      >
        <Text style={ButtonStyles.outlineText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  activeToggle: {
    backgroundColor: '#4a90e2',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  successText: {
    color: 'green',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  error: {
    color: '#e53e3e',
    marginBottom: 15,
    textAlign: 'center',
  },
  success: {
    color: '#38a169',
    marginBottom: 15,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#6c757d',
  },
});

export default RecoveryScreen;
