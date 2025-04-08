import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NavigationContainer, DefaultTheme, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Provider, useDispatch } from "react-redux";
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
import { linking } from "./navigation/linking";
import LogoutButton from './components/LogoutButton';
import { authService } from './services/authService';
import { logoutUser } from './redux/userSlice';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logoutUser());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <LogoutButton onPress={handleLogout} />,
        headerStyle: {
          backgroundColor: '#6b46c1',
        },
        headerTintColor: '#fff',
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
          borderTopColor: "#e2e8f0",
          paddingTop: 10,
          height: 70,
        },
        tabBarActiveTintColor: "#6b46c1",
        tabBarInactiveTintColor: "#718096",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home"
        }}
      />
      <Tab.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{
          title: "Calculator"
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile"
        }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "About"
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = React.useRef(null);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      if (navigationRef.current) {
        navigationRef.current.navigate('Login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Provider store={store}>
      <NavigationContainer ref={navigationRef} linking={linking} theme={DefaultTheme}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6b46c1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerRight: isAuthenticated ? () => <LogoutButton onPress={handleLogout} /> : undefined,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: "Login",
              headerRight: undefined,
            }}
          />
          <Stack.Screen
            name="CreateAccount"
            component={CreateAccount}
            options={{
              title: "Create Account",
              headerRight: undefined,
            }}
          />
          <Stack.Screen
            name="Recovery"
            component={RecoveryScreen}
            options={{
              title: "Account Recovery",
              headerRight: undefined,
            }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{
              title: "Reset Password",
              headerRight: undefined,
            }}
          />
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              headerShown: false,
            }}
            listeners={{
              focus: () => setIsAuthenticated(true),
              beforeRemove: () => setIsAuthenticated(false),
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
