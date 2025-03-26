import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/createAccountStyles";

// Use different URLs based on platform
const API_URL = "http://127.0.0.1:5001"; // Use localhost IP address for better compatibility

const CreateAccount = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    console.log("CreateAccount component mounted");
  }, []);

  const handleChange = (field, value) => {
    console.log(`Field ${field} changed to:`, value);
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    console.log("Validating form...");
    console.log("Current form data:", formData);

    if (
      !formData.username ||
      !formData.password ||
      !formData.email ||
      !formData.confirmPassword ||
      !formData.name ||
      !formData.age ||
      !formData.gender ||
      !formData.weight ||
      !formData.height
    ) {
      console.log("Form validation failed: missing fields");
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log("Form validation failed: passwords don't match");
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    if (formData.password.length < 6) {
      console.log("Form validation failed: password too short");
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log("Form validation failed: invalid email");
      Alert.alert("Error", "Please enter a valid email address");
      return false;
    }

    console.log("Form validation passed");
    return true;
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log("Submitting form data...");
    console.log("API URL:", API_URL);

    try {
      console.log("Making fetch request to:", `${API_URL}/api/register`);
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
      };
      console.log("Request body:", JSON.stringify(requestBody));

      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        Alert.alert(
          "Success",
          "Account created successfully! Please log in.",
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Navigating to Login screen");
                navigation.navigate("Login");
              },
            },
          ]
        );
      } else {
        const errorMessage = data.error || "Registration failed";
        console.error("Registration failed:", errorMessage);
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert(
        "Error",
        "Failed to create account. Please check your internet connection and try again. Error: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(text) => handleChange("username", text)}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChangeText={(text) => handleChange("confirmPassword", text)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={(text) => handleChange("name", text)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              value={formData.age}
              onChangeText={(text) => handleChange("age", text)}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gender</Text>
            <TextInput
              style={styles.input}
              placeholder="Male/Female/Other"
              value={formData.gender}
              onChangeText={(text) => handleChange("gender", text)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your weight"
              value={formData.weight}
              onChangeText={(text) => handleChange("weight", text)}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Height</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5'11&quot;"
              value={formData.height}
              onChangeText={(text) => handleChange("height", text)}
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => {
              console.log("Button pressed");
              handleSubmit();
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate("Login")}
            disabled={loading}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? Login here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateAccount;
