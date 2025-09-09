import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { loginUser, resendConfirmationEmail } from "../services/supabaseAuth";

export default function LoginScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email.trim() || !formData.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);

    try {
      console.log("Login: Starting login process for:", formData.email.trim());

      const result = await loginUser(formData.email.trim(), formData.password);

      console.log("Login: Supabase result:", result);

      if (result.success) {
        console.log("Login: Navigation to Tabs starting...");
        navigation.navigate("Tabs");
        console.log("Login: Navigation to Tabs completed");
      } else {
        console.log("Login: Login failed - result.success is false");

        // Check if it's an email confirmation issue
        if (result.message && result.message.includes("confirmation link")) {
          Alert.alert("Email Not Confirmed", result.message, [
            {
              text: "Resend Email",
              onPress: () => handleResendConfirmation()
            },
            {
              text: "OK",
              style: "cancel"
            }
          ]);
        } else {
          Alert.alert("Login Failed", result.message || "Invalid credentials");
        }
      }
    } catch (error) {
      console.error("Login: Login error:", error);

      // Check if it's an email confirmation issue
      if (error.message && error.message.includes("confirmation link")) {
        Alert.alert("Email Not Confirmed", error.message, [
          {
            text: "Resend Email",
            onPress: () => handleResendConfirmation()
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]);
      } else {
        Alert.alert("Login Failed", error.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const result = await resendConfirmationEmail(formData.email.trim());

      if (result.success) {
        Alert.alert("Email Sent", result.message);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to resend confirmation email"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    // Store guest user data for consistency
    // await AsyncStorage.setItem(
    //   "user",
    //   JSON.stringify({
    //     id: "guest",
    //     username: "Guest User",
    //     email: "guest@tfc.app",
    //     name: "Guest User",
    //     isGuest: true
    //   })
    // );

    navigation.navigate("Tabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TFC Training Frequency Calculator</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          placeholder="Enter email"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={formData.password}
          onChangeText={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          placeholder="Enter password"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.guestButton} onPress={handleGuestLogin}>
        <Text style={styles.guestButtonText}>Continue as Guest</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.registerLink}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={styles.linkText}>
          Don't have an account?{" "}
          <Text style={styles.linkTextBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1c2e",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: "#9ca3af",
    marginBottom: 40
  },
  inputContainer: {
    width: "100%",
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
    borderColor: "#4a5568",
    width: "100%"
  },
  loginButton: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    marginBottom: 15
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#6b46c1",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    width: "100%",
    marginBottom: 20
  },
  guestButtonText: {
    color: "#6b46c1",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center"
  },
  registerLink: {
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
