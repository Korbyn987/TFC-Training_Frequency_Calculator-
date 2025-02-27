import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import CreateAccountStyles from "../styles/CreateAccount";
import { StyleSheet } from "react-native";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    //handle form submission
    console.log("Form Submitted:", formData);
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={CreateAccountStyles.container}
    >
      <Text style={CreateAccountStyles.title}>Create Account</Text>

      <View style={CreateAccountStyles.inputContainer}>
        <Text style={CreateAccountStyles.label}>Username:</Text>
        <TextInput
          style={CreateAccountStyles.input}
          placeholder="Username"
          value={formData.username}
          onChangeText={(value) => handleChange("username", value)}
          autoCapitalize="none"
        />
      </View>
      <View style={CreateAccountStyles.inputContainer}>
        <Text style={CreateAccountStyles.label}>Password:</Text>
        <TextInput
          style={CreateAccountStyles.input}
          placeholder="Password"
          value={formData.password}
          onChangeText={(value) => handleChange("password", value)}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={CreateAccountStyles.button}
        onPress={handleSubmit}
      >
        <Text style={CreateAccountStyles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};
