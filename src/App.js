import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import store from "./src/redux/store"; // Ensure this path is correct
import HomeScreen from "./screens/HomeScreen.js"; // Create this screen
import AboutScreen from "./screens/AboutScreen.js"; // Create this screen
import CalculatorScreen from "./screens/CalculatorScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import LoginScreen from "./login/login";
import CreateAccount from "./login/createAccount";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name == "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Calculator") {
            iconName = focused ? "calculator" : "calculator-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "About") {
            iconName = focused
              ? "information-circle"
              : "information-circle-outline";
          }

          return (
            <View style={ButtonStyles.tabBarButton}>
              <Ionicons name={iconName} size={size} color={color} />
              <Text
                style={[
                  ButtonStyles.tabBarText,
                  focused
                    ? ButtonStyles.tabBarActive
                    : ButtonStyles.tabBarInactive,
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: "blue", //tbt this will be changed
        tabBarInactiveTintColor: "gray", //tbt, this will be changed
        tabBarStyle: {},
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MainTabs" screenOptions={{}}>
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />

          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Create Account" component={CreateAccount} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
