import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { authService } from '../services/authService';
import { setUser } from '../redux/userSlice';
import ButtonStyles from '../styles/Button';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/loginStyles';

const LoginScreen = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleForgotPassword = () => {
    navigation.navigate('Recovery');
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateAccount');
  };

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      const response = await authService.login(identifier, password);

      // Dispatch login action with user data
      dispatch(setUser(response.user));

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

      // Show success message after navigation
      showAlert("Success", "Welcome back, " + response.user.username + "!");
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
      showAlert("Error", error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Welcome Back</Text>
        
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Enter username or email"
            placeholderTextColor="#666"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor="#666"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={24}
                color="rgba(255, 255, 255, 0.7)"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[ButtonStyles.button, isLoading && ButtonStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={ButtonStyles.text}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ButtonStyles.outlineButton, styles.forgotButton]}
          onPress={handleForgotPassword}
          disabled={isLoading}
        >
          <Text style={ButtonStyles.outlineText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[ButtonStyles.outlineButton]}
          onPress={handleCreateAccount}
          disabled={isLoading}
        >
          <Text style={ButtonStyles.outlineText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
