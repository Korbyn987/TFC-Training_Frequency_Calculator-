import React from "react";
import { View, Text, Button } from "react-native";
import HomeStyles from "../styles/HomeStyles"; //importing styles

const HomeScreen = ({ navigation }) => {
  return (
    <View style={HomeStyles.container}>
      <Text style={HomeStyles.header}>
        Welcome to TFC your Training Fitness Calculator
      </Text>
      <Button
        title="Go to Details"
        onPress={() => navigation.navigate("Details")}
      />
    </View>
  );
};

export default HomeScreen;
