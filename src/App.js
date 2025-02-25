import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import store from "./src/redux/store"; // Ensure this path is correct
import HomeScreen from "./screens/HomeScreen.js"; // Create this screen
import DetailsScreen from "./screens/DetailsScreen.js"; // Create this screen

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen.js} />
          <Stack.Screen name="Details" component={DetailsScreen.js} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
