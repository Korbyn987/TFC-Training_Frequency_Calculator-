import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
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
import RecoveryScreen from "./screens/RecoveryScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import WorkoutOptionsScreen from "./screens/WorkoutOptionsScreen";
import AddExerciseScreen from "./screens/AddExerciseScreen";
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
import ButtonStyles from "./styles/Button";

const Stack = createStackNavigator();

function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: "#171923",
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
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{ title: "Create Account" }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Home" }}
          />
          <Stack.Screen
            name="Calculator"
            component={CalculatorScreen}
            options={{ title: "Calculator" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Profile" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ title: "About" }}
          />
          <Stack.Screen
            name="WorkoutOptionsScreen"
            component={WorkoutOptionsScreen}
            options={{ title: "Choose Your Workout" }}
          />
          <Stack.Screen
            name="AddExercise"
            component={AddExerciseScreen}
            options={{ title: "Add Exercise" }}
          />
          <Stack.Screen
            name="ConfigureWorkout"
            component={ConfigureWorkoutScreen}
            options={{ title: "Configure Workout" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
