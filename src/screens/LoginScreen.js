import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen({ navigation }) {
  const handleLogin = () => {
    navigation.navigate("Tabs");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TFC Training Frequency Calculator</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continue to App</Text>
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
  loginButton: {
    backgroundColor: "#6b46c1",
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
