import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import ButtonStyles from "../styles/Button";

const ResetPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();

  // Get token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      setTimeout(() => {
        navigation.navigate("Login");
      }, 3000);
    }
  }, [navigation]);

  const handleSubmit = async () => {
    try {
      setError("");

      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        setError("Invalid reset link. Please request a new password reset.");
        return;
      }

      // Validate inputs
      if (!newPassword || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }

      if (newPassword !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (newPassword.length < 8) {
        setError("Password must be at least 8 characters long");
        return;
      }

      // Call API to reset password
      const { authService } = await import("../services/authService");
      const response = await authService.resetPassword(token, newPassword);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigation.navigate("Login");
        }, 2000);
      } else {
        setError(response.error || "Failed to reset password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? (
        <Text style={styles.success}>
          Password reset successful! Redirecting to login...
        </Text>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="New Password"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        style={[ButtonStyles.button, success ? styles.disabledButton : null]}
        onPress={handleSubmit}
        disabled={success}
      >
        <Text style={ButtonStyles.buttonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#171923",
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff"
  },
  input: {
    width: "100%",
    maxWidth: 300,
    height: 40,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10
  },
  error: {
    color: "#fc8181",
    marginBottom: 10,
    textAlign: "center"
  },
  success: {
    color: "#68d391",
    marginBottom: 10,
    textAlign: "center"
  },
  disabledButton: {
    opacity: 0.5
  }
});

export default ResetPasswordScreen;
