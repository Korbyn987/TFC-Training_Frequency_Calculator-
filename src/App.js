// Import only necessary dependencies at the top level
import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { navigationRef } from './navigationRef';
import { store, persistor } from './redux/store';

// Lazy load screens for better performance
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const HomeScreen = lazy(() => import('./screens/HomeScreen'));
const AddExerciseScreen = lazy(() => import('./screens/AddExerciseScreen'));
const SelectRoutineScreen = lazy(() => import('./screens/SelectRoutineScreen'));
const ConfigureWorkoutScreen = lazy(() => import('./screens/ConfigureWorkoutScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

const Stack = createStackNavigator();

// Loading component shown during lazy loading
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#23263a' }}>
    <ActivityIndicator size="large" color="#6b46c1" />
  </View>
);

// Screen options configuration
const screenOptions = {
  headerStyle: {
    backgroundColor: '#23263a',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  // Enable screens to be released from memory when not in use
  detachPreviousScreen: true,
  // Optimize screen transitions
  cardStyle: { backgroundColor: '#1a1c2e' },
};

function AppContent() {
  // Use useCallback to memoize the screen options
  const memoizedScreenOptions = React.useCallback(() => screenOptions, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
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
              console.log('Navigation state changed:', e.data.state);
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
    </Suspense>
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
