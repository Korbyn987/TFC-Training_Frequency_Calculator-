import { AppRegistry } from "react-native";
import App from "./App.web";

AppRegistry.registerComponent("TFC", () => App);

if (window.document) {
  AppRegistry.runApplication("TFC", {
    initialProps: {},
    rootTag: document.getElementById("root"),
  });
}
