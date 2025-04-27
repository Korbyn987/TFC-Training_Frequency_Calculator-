import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles/aboutStyles";

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About Screen</Text>
      <Text style={styles.subtitle}>
        Why work harder when you could work smarter
      </Text>
    </View>
  );
};

export default AboutScreen;
