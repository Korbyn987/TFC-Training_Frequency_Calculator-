import React from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider, useSelector, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import store from "./redux/store";
import HomeScreen from "./screens/HomeScreen";
import AboutScreen from "./screens/AboutScreen";
import RecoveryGuideScreen from "./screens/RecoveryGuideScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./login/login";
import CreateAccount from "./login/createAccount";
import RecoveryScreen from "./screens/RecoveryScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import LogoutButton from "./components/LogoutButton";
import { linking } from "./navigation/linking";
import AddExerciseScreen from "./screens/AddExerciseScreen";
<<<<<<< HEAD
=======
import ConfigureWorkoutScreen from "./screens/ConfigureWorkoutScreen";
>>>>>>> 123ee98a509e9b94e505351d78fedd0d66e4b281

const Stack = createNativeStackNavigator();
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
        component={RecoveryGuideScreen}
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
  return (
    <Provider store={store}>
      <NavigationContainer linking={linking}>
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
<<<<<<< HEAD
            options={{ headerShown: false }}
=======
            options={{ headerShown: true, title: "Select Exercise" }}
          />
          <Stack.Screen
            name="ConfigureWorkout"
            component={ConfigureWorkoutScreen}
            options={{ headerShown: true, title: "Configure Workout" }}
>>>>>>> 123ee98a509e9b94e505351d78fedd0d66e4b281
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
