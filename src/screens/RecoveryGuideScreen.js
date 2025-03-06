import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const MuscleRecoveryMeter = ({ value }) => {
  //value should be between 0 and 100
  let color;
  if (value <= 33) {
    color = "red";
  } else if (value <= 66) color = "yellow";
  else {
    color = "green";
  }
};

const RecoveryGuideScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calculator Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});

export default CalculatorScreen;
