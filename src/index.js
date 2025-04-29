console.log("index.js loaded (start)");

window.global = window;

import { AppRegistry } from "react-native";
import App from "./App.web";

AppRegistry.registerComponent("TFC", () => App);

global = global || window;
registerRootComponent(App);
if (window.document) {
  AppRegistry.runApplication("TFC", {
    initialProps: {},
    rootTag: document.getElementById("root"),
  });
}
