import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { Text, View } from "react-native";
import { Provider } from "react-redux";
import CreateAccount from "./login/createAccount";
import LoginScreen from "./login/login";
import store from "./redux/store";
import AboutScreen from "./screens/AboutScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CalculatorScreen from "./screens/RecoveryGuideScreen";
import ButtonStyles from "./styles/Button";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
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
                    : ButtonStyles.tabBarInactive
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "gray"
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{ headerLeft: () => null }}
      />{" "}
      {/* Hides the back button */}
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: true,
            headerLeft: null // Remove back button from all screens
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: true,
              title: "Login",
              gestureEnabled: false // Prevent swipe back
            }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{
              headerShown: true,
              title: "Create Account"
            }}
          />
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              headerShown: false,
              gestureEnabled: false // Prevent swipe back
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
