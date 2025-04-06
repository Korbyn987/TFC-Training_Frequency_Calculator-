import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider } from "react-redux";
import store from "./redux/store";
import HomeScreen from "./screens/HomeScreen";
import AboutScreen from "./screens/AboutScreen";
import CalculatorScreen from "./screens/RecoveryGuideScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./login/login";
import CreateAccount from "./login/createAccount";
import RecoveryScreen from "./screens/RecoveryScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import { Ionicons } from "@expo/vector-icons";
import ButtonStyles from "./styles/Button";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
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
            iconName = focused ? "information-circle" : "information-circle-outline";
          }

          return (
            <View style={ButtonStyles.tabBarButton}>
              <Ionicons name={iconName} size={size} color={color} />
              <Text
                style={[
                  ButtonStyles.tabBarText,
                  focused ? ButtonStyles.tabBarActive : ButtonStyles.tabBarInactive,
                ]}
              >
                {route.name}
              </Text>
            </View>
          );
        },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e0e0e0",
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerShown: true,
          title: "Home"
        }}
      />
      <Tab.Screen 
        name="Calculator" 
        component={CalculatorScreen}
        options={{
          headerShown: true,
          title: "Recovery Guide"
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: "Profile"
        }}
      />
      <Tab.Screen 
        name="About" 
        component={AboutScreen}
        options={{
          headerShown: true,
          title: "About"
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: "#6b46c1",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Login",
            }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{
              title: "Create Account",
            }}
          />
          <Stack.Screen
            name="Recovery"
            component={RecoveryScreen}
            options={{
              title: "Account Recovery",
            }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              title: "Reset Password",
            }}
          />
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
