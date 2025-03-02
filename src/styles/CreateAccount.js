import { Stylesheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const createAccountStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
