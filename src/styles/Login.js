import React from "react";
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const loginAccountStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
