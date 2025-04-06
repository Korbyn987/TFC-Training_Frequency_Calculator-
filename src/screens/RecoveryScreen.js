import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, recoverUsername } from '../services/authService';
import { setRecoveryStatus, setRecoveryError, clearRecoveryState } from '../redux/authSlice';
import ButtonStyles from '../styles/Button';

const RecoveryScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('password'); // 'password' or 'username'
  const dispatch = useDispatch();
  const { recoveryStatus, recoveryError } = useSelector((state) => state.auth);

  const handleRecovery = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      dispatch(clearRecoveryState());
      
      if (mode === 'password') {
        await forgotPassword(email);
        dispatch(setRecoveryStatus('Password reset instructions sent to your email'));
      } else {
        await recoverUsername(email);
        dispatch(setRecoveryStatus('Username sent to your email'));
      }
    } catch (error) {
      dispatch(setRecoveryError(error.toString()));
    }
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

      <TouchableOpacity
        style={ButtonStyles.button}
        onPress={handleRecovery}
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
  backButton: {
    marginTop: 20,
    backgroundColor: '#6c757d',
  },
});

export default RecoveryScreen;
