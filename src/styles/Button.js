import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  button: {},
  secondaryButton: {},
  outlineButton: {},
  text: {},
  outlineText: {},
  //Navigation tab bar specific styles
  tabBarButton: {},
  tabBarText: {},
  tabBarActive: {},
  tabBarInactive: {},
  //button container for groups of buttons
  buttonContainer: {},
  //disabled state
  disabledButton: {},
  disabledText: {},
});
