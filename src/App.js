// Import only necessary dependencies at the top level
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { navigationRef } from "./navigationRef";
import { persistor, store } from "./redux/store";

// Import database initialization
import { initDatabase } from "./services/database";

// Import LoginScreen directly (not lazy) since it's the initial screen
import LoginScreen from "./screens/LoginScreen";

// Import all screens directly to avoid lazy loading issues
import AboutScreen from "./screens/AboutScreen";
import AddExerciseScreen from "./screens/AddExerciseScreen";
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
import NewHomeScreen from "./screens/NewHomeScreen"; // Import NewHomeScreen
import ProfileScreen from "./screens/ProfileScreen";
import RecoveryGuideScreen from "./screens/RecoveryGuideScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SelectRoutineScreen from "./screens/SelectRoutineScreen";
import WorkoutOptionsScreen from "./screens/WorkoutOptionsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Loading component shown during lazy loading
const LoadingFallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#23263a"
    }}
  >
    <ActivityIndicator size="large" color="#6b46c1" />
  </View>
);

// Screen options configuration
const screenOptions = {
  headerStyle: {
    backgroundColor: "#23263a"
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold"
  },
  // Enable screens to be released from memory when not in use
  detachPreviousScreen: true,
  // Optimize screen transitions
  cardStyle: { backgroundColor: "#1a1c2e" }
};

function AppContent() {
  // Use useCallback to memoize the screen options
  const memoizedScreenOptions = React.useCallback(() => screenOptions, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      // Enable React Native Screens for better performance
      documentTitle={{ enabled: false }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={memoizedScreenOptions}
        screenListeners={{
          // Add performance monitoring for navigation events
          state: (e) => {
            // Optional: Add analytics or performance monitoring here
            console.log("Navigation state changed:", e.data.state);
          }
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: "Register" }}
        />
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddExercise"
          component={AddExerciseScreen}
          options={{ title: "Add Exercise" }}
        />
        <Stack.Screen
          name="SelectRoutine"
          component={SelectRoutineScreen}
          options={{ title: "Select Routine" }}
        />
        <Stack.Screen
          name="ConfigureWorkout"
          component={ConfigureWorkoutScreen}
          options={{ title: "Configure Workout" }}
        />
        <Stack.Screen
          name="RecoveryGuide"
          component={RecoveryGuideScreen}
          options={{ title: "Recovery Guide" }}
        />
        <Stack.Screen
          name="WorkoutOptions"
          component={WorkoutOptionsScreen}
          options={{ title: "Workout Options" }}
        />
        <Stack.Screen
          name="ResetPassword"
          component={ResetPasswordScreen}
          options={{ title: "Reset Password" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "ios-home" : "ios-home-outline";
          } else if (route.name === "Calculator") {
            iconName = focused ? "ios-calculator" : "ios-calculator-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "ios-person" : "ios-person-outline";
          } else if (route.name === "About") {
            iconName = focused
              ? "ios-information-circle"
              : "ios-information-circle-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6b46c1",
        tabBarInactiveTintColor: "gray",
        headerStyle: {
          backgroundColor: "#23263a"
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold"
        }
      })}
    >
      <Tab.Screen
        name="Home"
        component={NewHomeScreen}
        options={{ title: "TFC" }}
      />
      <Tab.Screen name="Calculator" component={RecoveryGuideScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="About" component={AboutScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing TFC app...");

        // Re-enable database initialization
        await initDatabase();

        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
        // Don't let initialization errors prevent app from loading
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#23263a"
        }}
      >
        <ActivityIndicator size="large" color="#6b46c1" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
