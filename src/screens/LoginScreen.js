import { Ionicons } from "@expo/vector-icons";
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

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async () => {
    const loginStartTime = Date.now();
    console.log("🔐 LoginScreen: Starting login process...");

    if (!formData.email.trim() || !formData.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    console.log(
      "⏱️ LoginScreen: Login attempt started at",
      new Date().toISOString()
    );

    try {
      const authStartTime = Date.now();
      const { loginUser } = await import("../services/supabaseAuth");
      const result = await loginUser(formData.email.trim(), formData.password);
      const authEndTime = Date.now();

      console.log(
        `⚡ LoginScreen: loginUser() took ${authEndTime - authStartTime}ms`
      );

      if (result.success) {
        console.log("✅ LoginScreen: Login successful, navigating to Tabs");
        const navigationStartTime = Date.now();

        navigation.navigate("Tabs");

        const navigationEndTime = Date.now();
        console.log(
          `🧭 LoginScreen: Navigation to Tabs took ${
            navigationEndTime - navigationStartTime
          }ms`
        );

        const totalLoginTime = Date.now() - loginStartTime;
        console.log(
          `🏁 LoginScreen: Total login process completed in ${totalLoginTime}ms`
        );
      } else {
        console.log("❌ LoginScreen: Login failed:", result.error);
        if (result.error?.message?.includes("Email not confirmed")) {
          Alert.alert(
            "Email Not Confirmed",
            "Please check your email and click the confirmation link. Would you like us to resend the confirmation email?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Resend Email",
                onPress: async () => {
                  try {
                    const { resendConfirmationEmail } = await import(
                      "../services/supabaseAuth"
                    );
                    const resendResult = await resendConfirmationEmail(
                      formData.email.trim()
                    );
                    if (resendResult.success) {
                      Alert.alert(
                        "Success",
                        "Confirmation email sent! Please check your inbox."
                      );
                    } else {
                      Alert.alert(
                        "Error",
                        resendResult.error?.message ||
                          "Failed to resend confirmation email"
                      );
                    }
                  } catch (error) {
                    console.error("Error resending confirmation:", error);
                    Alert.alert("Error", "Failed to resend confirmation email");
                  }
                }
              }
            ]
          );
        } else {
          Alert.alert(
            "Login Failed",
            result.error?.message || "Invalid email or password"
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate("Register");
  };

  const handleForgotPassword = () => {
    navigation.navigate("ResetPassword");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your fitness journey
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#888"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#888"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account?{" "}
              <Text style={styles.registerLink}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
  header: {
    alignItems: "center",
    marginBottom: 40
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center"
  },
  form: {
    width: "100%"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#23263a",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56
  },
  inputIcon: {
    marginRight: 12
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16
  },
  eyeIcon: {
    padding: 4
  },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginBottom: 24
  },
  forgotPasswordText: {
    color: "#4CAF50",
    fontSize: 14
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24
  },
  loginButtonDisabled: {
    opacity: 0.6
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold"
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333"
  },
  dividerText: {
    color: "#888",
    marginHorizontal: 16,
    fontSize: 14
  },
  registerButton: {
    alignItems: "center"
  },
  registerButtonText: {
    color: "#888",
    fontSize: 16
  },
  registerLink: {
    color: "#4CAF50",
    fontWeight: "bold"
  }
});

export default LoginScreen;
