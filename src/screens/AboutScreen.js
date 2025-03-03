import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tab = createBottomTabNavigator();

// this is meant to serve as basic screens for navigation

const AboutScreen = () => {
  return (
    <View>
      <Text>About Screen</Text>
    </View>
  );
};

export default AboutScreen;
