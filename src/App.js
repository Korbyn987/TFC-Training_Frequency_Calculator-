import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import "react-native-gesture-handler";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { supabase } from "./config/supabase";
import { TabDataProvider } from "./context/TabDataContext";
import { persistor, store } from "./redux/store";

// Import real screens
import AboutScreen from "./screens/AboutScreen";
import AddExerciseScreen from "./screens/AddExerciseScreen";
import AIWorkoutPlannerScreen from "./screens/AIWorkoutPlannerScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
import LoginScreen from "./screens/LoginScreen";
import NewHomeScreen from "./screens/NewHomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import RecoveryGuideScreen from "./screens/RecoveryGuideScreen";
import RegisterScreen from "./screens/RegisterScreen";
import SplashScreen from "./screens/SplashScreen";
import WorkoutDetailScreen from "./screens/WorkoutDetailScreen";
import WorkoutHistoryScreen from "./screens/WorkoutHistoryScreen";
import WorkoutOptionsScreen from "./screens/WorkoutOptionsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Main app tabs, wrapped in the data provider
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route, navigation }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === "Home") {
          iconName = focused ? "home" : "home-outline";
        } else if (route.name === "Profile") {
          iconName = focused ? "person-circle" : "person-circle-outline";
        } else if (route.name === "Analytics") {
          iconName = focused ? "analytics" : "analytics-outline";
        } else if (route.name === "Recovery") {
          iconName = focused ? "fitness" : "fitness-outline";
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#4CAF50",
      tabBarInactiveTintColor: "gray",
      tabBarStyle: {
        backgroundColor: "#1a1c2e",
        borderTopColor: "#23263a"
      },
      headerStyle: {
        backgroundColor: "#1a1c2e"
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold"
      }
    })}
  >
    <Tab.Screen name="Home" component={NewHomeScreen} />
    <Tab.Screen name="Recovery" component={RecoveryGuideScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const AppContent = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
      setIsLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="LoggedInStack">
            {() => (
              <TabDataProvider>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Tabs" component={TabNavigator} />
                  <Stack.Screen
                    name="ConfigureWorkout"
                    component={ConfigureWorkoutScreen}
                  />
                  <Stack.Screen
                    name="AddExercise"
                    component={AddExerciseScreen}
                  />
                  <Stack.Screen
                    name="WorkoutOptions"
                    component={WorkoutOptionsScreen}
                  />
                  <Stack.Screen
                    name="WorkoutHistory"
                    component={WorkoutHistoryScreen}
                  />
                  <Stack.Screen
                    name="WorkoutDetail"
                    component={WorkoutDetailScreen}
                  />
                  <Stack.Screen
                    name="AIWorkoutPlanner"
                    component={AIWorkoutPlannerScreen}
                    options={{
                      headerShown: true,
                      title: "AI Workout Planner",
                      headerStyle: {
                        backgroundColor: "#1a1c2e"
                      },
                      headerTintColor: "#fff",
                      headerBackTitleVisible: false
                    }}
                  />
                </Stack.Navigator>
              </TabDataProvider>
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  console.log("TFC app with data providers starting...");

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center"
  }
});
