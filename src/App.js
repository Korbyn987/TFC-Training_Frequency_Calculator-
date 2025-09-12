import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { TabDataProvider } from "./context/TabDataContext";
import { navigationRef } from "./navigationRef";
import { persistor, store } from "./redux/store";
import { initDatabase } from "./services/database";

import AboutScreen from "./screens/AboutScreen";
import AddExerciseScreen from "./screens/AddExerciseScreen";
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
import LoginScreen from "./screens/LoginScreen";
import NewHomeScreen from "./screens/NewHomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecoveryGuideScreen from "./screens/RecoveryGuideScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SelectRoutineScreen from "./screens/SelectRoutineScreen";
import WorkoutOptionsScreen from "./screens/WorkoutOptionsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

const screenOptions = {
  headerStyle: {
    backgroundColor: "#23263a"
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "bold"
  },
  detachPreviousScreen: true,
  cardStyle: { backgroundColor: "#1a1c2e" }
};

function AppContent() {
  const memoizedScreenOptions = React.useCallback(() => screenOptions, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={(state) => {
        console.log(
          "🧭 App: Navigation state changed:",
          JSON.stringify(state, null, 2)
        );

        if (state) {
          const currentRoute = state.routes[state.index];
          console.log(`📍 App: Current route: ${currentRoute.name}`);

          if (currentRoute.name === "Tabs") {
            console.log(
              "📱 App: Tab navigator loaded - checking tab screens..."
            );
            if (currentRoute.state) {
              const currentTab =
                currentRoute.state.routes[currentRoute.state.index];
              console.log(`🏠 App: Active tab: ${currentTab.name}`);
            }
          }
        }
      }}
    >
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={memoizedScreenOptions}
        screenListeners={{
          state: (e) => {
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
    <TabDataProvider>
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
        <Tab.Screen
          name="Calculator"
          component={RecoveryGuideScreen}
          options={{ title: "Calculator" }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
        <Tab.Screen
          name="About"
          component={AboutScreen}
          options={{ title: "About" }}
        />
      </Tab.Navigator>
    </TabDataProvider>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing TFC app...");

        await initDatabase();

        console.log("App initialization complete");
      } catch (error) {
        console.error("App initialization error:", error);
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
