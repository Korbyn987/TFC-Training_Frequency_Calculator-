import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import store from './redux/store';
import HomeScreen from './screens/HomeScreen';
import AboutScreen from './screens/AboutScreen';
import CalculatorScreen from './screens/CalculatorScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './login/login';
import CreateAccount from './login/createAccount';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
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
        <Stack.Navigator 
          initialRouteName="Tabs"
          screenOptions={{
            headerShown: true,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{
              headerShown: true,
              title: 'Login'
            }}
          />
          <Stack.Screen 
            name="CreateAccount" 
            component={CreateAccount}
            options={{
              headerShown: true,
              title: 'Create Account'
            }}
          />
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;
