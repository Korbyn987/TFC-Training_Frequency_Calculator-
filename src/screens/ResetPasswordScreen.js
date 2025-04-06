import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../services/authService';
import { setRecoveryStatus, setRecoveryError } from '../redux/authSlice';
import ButtonStyles from '../styles/Button';

const ResetPasswordScreen = ({ route, navigation }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const dispatch = useDispatch();
  const { token } = route.params || {};

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    try {
      await resetPassword(token, newPassword);
      dispatch(setRecoveryStatus('Password successfully reset'));
      navigation.replace('Login');
    } catch (error) {
      dispatch(setRecoveryError(error.toString()));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
          style={styles.input}
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={ButtonStyles.button}
          onPress={handleResetPassword}
        >
          <Text style={ButtonStyles.text}>Reset Password</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ButtonStyles.outlineButton, styles.backButton]}
          onPress={() => navigation.replace('Login')}
        >
          <Text style={ButtonStyles.outlineText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  backButton: {
    marginTop: 10,
  },
});

export default ResetPasswordScreen;
