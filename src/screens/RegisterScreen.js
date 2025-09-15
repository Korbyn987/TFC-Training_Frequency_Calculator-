import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = async () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else {
      const { checkUsernameExists } = await import("../services/supabaseAuth");
      if (await checkUsernameExists(formData.username)) {
        newErrors.username = "Username already exists";
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    } else {
      const { checkEmailExists } = await import("../services/supabaseAuth");
      if (await checkEmailExists(formData.email)) {
        newErrors.email = "Email already registered";
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    setLoading(true);

    try {
      const isValid = await validateForm();
      if (!isValid) {
        setLoading(false);
        return;
      }

      const { registerUser } = await import("../services/supabaseAuth");
      const result = await registerUser(
        formData.username.trim(),
        formData.email.trim().toLowerCase(),
        formData.password
      );

      if (result.success) {
        Alert.alert("Success!", result.message, [
          {
            text: "Login Now",
            onPress: () => navigation.navigate("Login")
          }
        ]);
      }
    } catch (error) {
      Alert.alert("Registration Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join TFC Training Frequency Calculator
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              value={formData.username}
              onChangeText={(value) => updateFormData("username", value)}
              placeholder="Enter username"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={formData.email}
              onChangeText={(value) => updateFormData("email", value)}
              placeholder="Enter email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={formData.password}
              onChangeText={(value) => updateFormData("password", value)}
              placeholder="Enter password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError
              ]}
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData("confirmPassword", value)}
              placeholder="Confirm password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
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
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={styles.linkTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1c2e"
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 40
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
    fontWeight: "500"
  },
  input: {
    backgroundColor: "#2d3748",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#4a5568"
  },
  inputError: {
    borderColor: "#e53e3e"
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
    marginTop: 5
  },
  registerButton: {
    backgroundColor: "#6b46c1",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center"
  },
  loginLink: {
    alignItems: "center"
  },
  linkText: {
    color: "#9ca3af",
    fontSize: 16
  },
  linkTextBold: {
    color: "#6b46c1",
    fontWeight: "bold"
  }
});
