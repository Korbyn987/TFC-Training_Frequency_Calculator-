import React from "react";
import { View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PurpleBackgroundIcon = ({ name, size = 24, color = "#fff", style }) => {
  return (
    <View style={[styles.iconContainer, style]}>
      <MaterialIcons name={name} size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: "#7c3aed",
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default PurpleBackgroundIcon;
