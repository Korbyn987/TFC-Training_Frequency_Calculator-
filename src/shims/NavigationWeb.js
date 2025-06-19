/**
 * Navigation shim for React Navigation in web environment
 * This provides safer navigation methods that work in the web context
 */

// This utility function helps make navigation operations safer in the web environment
export const safeNavigate = (navigation, routeName, params = {}) => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }

  try {
    // Special handling for nested navigation structure
    // This is needed because ConfigureWorkout is in the Stack navigator
    // while HomeScreen is in the Tab navigator (which is nested in Stack)
    
    // Check if we're navigating to a screen that might be in a parent navigator
    const specialRoutes = ['ConfigureWorkout', 'AddExercise', 'SelectRoutine'];
    
    if (specialRoutes.includes(routeName)) {
      console.log(`Using special navigation for route: ${routeName}`);
      // Use the special syntax for navigating to a screen in parent navigator
      navigation.navigate(routeName, params);
      return;
    }
    
    // For regular routes, check if they exist in the current navigator
    if (navigation.getState) {
      const state = navigation.getState();
      const routeExists = state && state.routeNames && state.routeNames.includes(routeName);

      if (!routeExists) {
        console.warn(`Route "${routeName}" not found in current navigator, trying special navigation`);
        // Try special navigation as a fallback
        navigation.navigate(routeName, params);
        return;
      }
    }

    // Standard navigation for routes in the current navigator
    navigation.navigate(routeName, params);
  } catch (error) {
    console.error('Error during navigation:', error);
    
    // Final fallback: Try using direct URL navigation for web
    if (typeof window !== 'undefined') {
      try {
        // Handle common routes with simple mapping
        const routeMapping = {
          'Home': '/',
          'Tabs': '/',
          'AddExercise': '/AddExercise',
          'ConfigureWorkout': '/ConfigureWorkout',
          'Profile': '/Profile',
          'Login': '/Login',
          'CreateAccount': '/CreateAccount',
          'SelectRoutine': '/SelectRoutine',
          // Add more route mappings as needed
        };
        
        if (routeMapping[routeName]) {
          console.log(`Falling back to direct URL navigation: ${routeMapping[routeName]}`);
          window.location.href = routeMapping[routeName];
        }
      } catch (e) {
        console.error('Error during URL fallback navigation:', e);
      }
    }
  }
};

// Helper for reset navigation action (commonly fails in web)
export const safeReset = (navigation, routes) => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }

  try {
    // Check if the navigation object has the reset method
    if (typeof navigation.reset !== 'function') {
      console.warn('Navigation reset method not available');
      return;
    }

    // Perform the reset operation
    navigation.reset({
      index: routes.length - 1,
      routes: routes,
    });
  } catch (error) {
    console.error('Error during navigation reset:', error);
    
    // Fallback for web
    if (typeof window !== 'undefined' && routes.length > 0) {
      const mainRoute = routes[routes.length - 1];
      safeNavigate(navigation, mainRoute.name, mainRoute.params);
    }
  }
};

// Helper for push navigation action
export const safePush = (navigation, routeName, params = {}) => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }

  try {
    navigation.push(routeName, params);
  } catch (error) {
    console.error('Error during navigation push:', error);
    // Fall back to regular navigate as a safer option
    safeNavigate(navigation, routeName, params);
  }
};

export default {
  safeNavigate,
  safeReset,
  safePush
};
