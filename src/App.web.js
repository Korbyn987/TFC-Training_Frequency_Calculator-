import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider, useSelector, useDispatch } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./redux/store";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "./screens/HomeScreen";
import AboutScreen from "./screens/AboutScreen";
// Import the web-compatible version of RecoveryGuideScreen
import RecoveryGuideScreenWeb from "./shims/RecoveryGuideScreenWeb";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./login/login";
import CreateAccount from "./login/createAccount";
import RecoveryScreen from "./screens/RecoveryScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import LogoutButton from "./components/LogoutButton";
// Import our enhanced linking solution instead of the standard one
import { useEnhancedLinking } from "./shims/NavigationLinkingShim";
// Import the original linking configuration
import { linking as linkingConfig } from "./navigation/linking";
import AddExerciseScreen from "./screens/AddExerciseScreen";
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
import SelectRoutineScreen from "./screens/SelectRoutineScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#23263a",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        tabBarStyle: {
          backgroundColor: "#23263a",
          borderTopColor: "rgba(107, 70, 193, 0.2)",
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: "#6b46c1",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Calculator"
        component={RecoveryGuideScreenWeb}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  // Create navigation ref for our enhanced linking
  const navigationRef = React.useRef();
  
  // Use our enhanced linking hook with the original config
  const enhancedLinking = useEnhancedLinking(navigationRef, {
    enabled: true,
    prefixes: linkingConfig.prefixes || [],
    config: linkingConfig.config || {}
  });

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#23263a",
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold",
            },
          }}
        >
          <Stack.Screen
            name="Tabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Recovery"
            component={RecoveryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="AddExercise"
            component={AddExerciseScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ConfigureWorkout"
            component={ConfigureWorkoutScreen}
            options={{ headerShown: true, title: "Configure Workout" }}
          />
          <Stack.Screen
            name="SelectRoutine"
            component={SelectRoutineScreen}
            options={{ headerShown: true, title: "Select Routine" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

export default App;
