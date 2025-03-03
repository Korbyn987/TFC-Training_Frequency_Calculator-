import React from "react";
import { View, Text, Button, TouchableOpacity } from "react-native";
import HomeStyles from "../styles/HomeStyles"; //importing styles
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import AboutScreen from "./AboutScreen";

const Tab = createBottomTabNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View style={HomeStyles.container}>
      {/* You will have to add more text tags such as the one below */}
      <Text style={HomeStyles.title}>
        Welcome to TFC your Training Frequency Calculator
      </Text>

      <View style={HomeStyles.buttonContainer}>
        <TouchableOpacity
          style={Button.button}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={Button.text}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[Button.button, Button.secondaryButton]}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={Button.text}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[Button.button, Button.outlineButton]}
          onPress={() => navigation.navigate("About")}
        >
          <Text style={[ButtonStyles.text, ButtonStyles.outlineText]}>
            Learn More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;
//this is the home screen
