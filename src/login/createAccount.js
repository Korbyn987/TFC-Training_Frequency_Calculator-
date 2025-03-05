import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

const CreateAccount = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = () => {
    // Basic validation
    if (!formData.username || !formData.password || !formData.email || !formData.confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // TODO: Add actual account creation logic here
    console.log("Creating account with:", formData);
    
    // Navigate to login screen after successful account creation
    Alert.alert(
      "Success",
      "Account created successfully!",
      [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login")
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F5FCFF',
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 30,
          textAlign: 'center',
        }}
      >
        Create Account
      </Text>

      <View
        style={{
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            marginBottom: 5,
            color: '#333',
          }}
        >
          Username:
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
          }}
          placeholder="Enter username"
          value={formData.username}
          onChangeText={(value) => handleChange("username", value)}
          autoCapitalize="none"
        />
      </View>

      <View
        style={{
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            marginBottom: 5,
            color: '#333',
          }}
        >
          Email:
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
          }}
          placeholder="Enter email"
          value={formData.email}
          onChangeText={(value) => handleChange("email", value)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View
        style={{
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            marginBottom: 5,
            color: '#333',
          }}
        >
          Password:
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
          }}
          placeholder="Enter password"
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          secureTextEntry
        />
      </View>

      <View
        style={{
          marginBottom: 15,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            marginBottom: 5,
            color: '#333',
          }}
        >
          Confirm Password:
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#ddd',
            padding: 12,
            borderRadius: 8,
            fontSize: 16,
            backgroundColor: '#fff',
          }}
          placeholder="Confirm password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange("confirmPassword", value)}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20,
        }}
        onPress={handleSubmit}
      >
        <Text
          style={{
            color: '#fff',
            fontSize: 16,
            fontWeight: '600',
          }}
        >
          Create Account
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.linkText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  linkContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

export default CreateAccount;
