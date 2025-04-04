import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  button: {
    backgroundColor: "#6b46c1", // Primary purple
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButton: {
    backgroundColor: "#E9E9E9",
    padding: 10,
    borderRadius: 5
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#6b46c1", // Primary purple
    padding: 10,
    borderRadius: 5
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600"
  },
  outlineText: {
    color: "#6b46c1", // Primary purple
    fontSize: 16,
    fontWeight: "600"
  },
  headerButton: {
    marginRight: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: "#6b46c1" // Primary purple
  },
  headerButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  },
  //Navigation tab bar specific styles
  tabBarButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5
  },
  tabBarText: {
    fontSize: 12,
    marginTop: 3
  },
  tabBarActive: {
    color: "#6b46c1" // Primary purple
  },
  tabBarInactive: {
    color: "#8E8E93"
  },
  //button container for groups of buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10
  },
  //disabled state
  disabledButton: {
    backgroundColor: "#E9E9E9",
    opacity: 0.5
  },
  disabledText: {
    color: "#8E8E93"
  }
});
