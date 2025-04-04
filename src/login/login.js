import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/authSlice";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../styles/loginStyles";

// Use different URLs based on platform
const API_URL = Platform.select({
  ios: "http://localhost:5001", // iOS simulator
  android: "http://10.0.2.2:5001", // Android emulator
  default: "http://localhost:5001", // Web
});

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Invalid username/email or password");
        } else if (response.status === 400) {
          throw new Error("Please enter your username/email and password");
        } else {
          throw new Error(data.error || "Login failed");
        }
      }

      // Dispatch login action with user data
      dispatch(login({ username: data.user.username }));

      // Navigate to Tabs immediately after successful login
      navigation.replace("Tabs");

      // Show success message after navigation
      Alert.alert("Success", "Welcome back, " + data.user.username + "!");
    } catch (error) {
      console.error("Login error: " + error);
      Alert.alert("Error", error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username or Email</Text>
          <TextInput
            style={styles.input}
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="Enter username or email"
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            autoCapitalize="none"
            autoComplete="username"
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
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              secureTextEntry={!showPassword}
              autoComplete="current-password"
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={24}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkContainer}
          onPress={() => navigation.navigate("CreateAccount")}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>Don't have an account? Create one</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
