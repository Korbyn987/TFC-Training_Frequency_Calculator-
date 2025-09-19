console.log("index.js loaded (start)");

// Ensure global is defined for React Native Web
window.global = window;
global = global || window;

// Import required components
import { registerRootComponent } from "expo";
import { AppRegistry } from "react-native";
import { name as appName } from "../app.json";
import App from "./App.web";

// Register the app component both ways (for Expo and React Native Web)
AppRegistry.registerComponent(appName, () => App);

try {
  registerRootComponent(App);
} catch (error) {
  console.warn("Could not register root component:", error);
}

// Run the application for web
if (window.document) {
  AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById("root"),
  });
}
