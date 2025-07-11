console.log("App.js loaded (start)");

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { navigationRef } from './navigationRef';
import { store, persistor } from './redux/store';
// import { initDatabase } from './database/database';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AddExerciseScreen from './screens/AddExerciseScreen';
import SelectRoutineScreen from './screens/SelectRoutineScreen';
import ConfigureWorkoutScreen from './screens/ConfigureWorkoutScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

function AppContent() {
  // Database initialization can be uncommented if needed
  // useEffect(() => {
  //   const setupDatabase = async () => {
  //     try {
  //       await initDatabase();
  //     } catch (error) {
  //       console.error('Failed to initialize database:', error);
  //     }
  //   };
  //   setupDatabase();
  // }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#23263a',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'TFC' }}
        />
        <Stack.Screen 
          name="AddExercise" 
          component={AddExerciseScreen}
          options={{ title: 'Add Exercise' }}
        />
        <Stack.Screen 
          name="SelectRoutine" 
          component={SelectRoutineScreen}
          options={{ title: 'Select Routine' }}
        />
        <Stack.Screen 
          name="ConfigureWorkout" 
          component={ConfigureWorkoutScreen}
          options={{ title: 'Configure Workout' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}
