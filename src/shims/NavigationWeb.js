/**
 * Navigation shim for React Navigation in web environment
 * This provides safer navigation methods that work in the web context
 */

// Cache for navigation state to avoid repeated lookups
let navigationStateCache = {};

// List of routes that need special handling (stack navigator routes)
const STACK_ROUTES = [
  'ConfigureWorkout', 'AddExercise', 'SelectRoutine', 'RecoveryGuide', 'WorkoutInProgress'
];

// Map of route names to URL paths for direct URL navigation fallback
const ROUTE_URL_MAP = {
  'Home': '/',
  'Tabs': '/',
  'AddExercise': '/AddExercise',
  'ConfigureWorkout': '/ConfigureWorkout',
  'Profile': '/Profile',
  'Login': '/Login',
  'CreateAccount': '/CreateAccount',
  'SelectRoutine': '/SelectRoutine',
  'RecoveryGuide': '/RecoveryGuide',
  'Settings': '/Settings',
  'WorkoutInProgress': '/WorkoutInProgress',
  'WorkoutHistory': '/WorkoutHistory',
  'ForgotPassword': '/ForgotPassword',
  'ResetPassword': '/ResetPassword'
};

// This utility function helps make navigation operations safer in the web environment
export const safeNavigate = (navigation, routeName, params = {}) => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }
  
  // Validate route name
  if (!routeName || typeof routeName !== 'string') {
    console.warn('Invalid route name:', routeName);
    return;
  }
  
  // Debug logs for navigation tracking
  console.log(`Navigation requested to: ${routeName}`, params);

  try {
    // Special handling for stack navigator routes
    if (STACK_ROUTES.includes(routeName)) {
      console.log(`Using special navigation for stack route: ${routeName}`);
      
      // Try to find parent navigator if possible
      if (typeof navigation.getParent === 'function') {
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate(routeName, params);
          return;
        }
      }
    }
    
    // For regular routes, check if they exist in the current navigator
    if (navigation.getState && typeof navigation.getState === 'function') {
      try {
        const state = navigation.getState();
        const routeNames = state?.routeNames || [];
        
        if (routeNames.length > 0 && !routeNames.includes(routeName)) {
          console.warn(`Route "${routeName}" not found in current navigator [${routeNames.join(', ')}]`);
          
          // Try finding the route in a parent navigator
          if (typeof navigation.getParent === 'function') {
            const parent = navigation.getParent();
            if (parent) {
              parent.navigate(routeName, params);
              return;
            }
          }
        }
      } catch (stateError) {
        console.warn('Error accessing navigation state:', stateError);
      }
    }

    // Standard navigation for routes in the current navigator
    navigation.navigate(routeName, params);
  } catch (error) {
    console.error('Error during navigation:', error);
    
    // Final fallback: Try using direct URL navigation for web
    if (typeof window !== 'undefined') {
      try {
        if (ROUTE_URL_MAP[routeName]) {
          console.log(`Falling back to direct URL navigation: ${ROUTE_URL_MAP[routeName]}`);
          // Add query params if provided
          let url = ROUTE_URL_MAP[routeName];
          if (params && Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                queryParams.append(key, typeof value === 'object' ? JSON.stringify(value) : value.toString());
              }
            });
            url += `?${queryParams.toString()}`;
          }
          window.location.href = url;
        } else {
          console.error(`No URL mapping found for route: ${routeName}`);
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

  if (!Array.isArray(routes) || routes.length === 0) {
    console.warn('Invalid routes array for reset:', routes);
    return;
  }

  try {
    // Check if the navigation object has the reset method
    if (typeof navigation.reset !== 'function') {
      console.warn('Navigation reset method not available');
      // Try alternative approach if reset isn't available
      if (typeof navigation.navigate === 'function') {
        const mainRoute = routes[routes.length - 1];
        console.log('Falling back to navigate instead of reset');
        safeNavigate(navigation, mainRoute.name, mainRoute.params);
      }
      return;
    }

    // Ensure routes are properly formatted
    const validRoutes = routes.map(route => {
      if (typeof route === 'string') {
        return { name: route };
      } else if (typeof route === 'object' && route !== null && route.name) {
        return {
          name: route.name,
          params: route.params || {}
        };
      }
      return null;
    }).filter(Boolean); // Remove any null values

    if (validRoutes.length === 0) {
      console.warn('No valid routes for reset');
      return;
    }

    // Perform the reset operation
    navigation.reset({
      index: validRoutes.length - 1,
      routes: validRoutes,
    });
  } catch (error) {
    console.error('Error during navigation reset:', error);
    
    // Fallback for web
    if (typeof window !== 'undefined' && routes.length > 0) {
      const mainRoute = routes[routes.length - 1];
      
      if (typeof mainRoute === 'object' && mainRoute !== null && mainRoute.name) {
        safeNavigate(navigation, mainRoute.name, mainRoute.params || {});
      } else if (typeof mainRoute === 'string') {
        safeNavigate(navigation, mainRoute, {});
      }
    }
  }
};

// Helper for push navigation action
export const safePush = (navigation, routeName, params = {}) => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }

  if (!routeName || typeof routeName !== 'string') {
    console.warn('Invalid route name for push:', routeName);
    return;
  }

  console.log(`Push navigation requested to: ${routeName}`);

  try {
    // Check if push method exists first
    if (typeof navigation.push !== 'function') {
      console.warn('Navigation push method not available, falling back to navigate');
      safeNavigate(navigation, routeName, params);
      return;
    }

    // Attempt push navigation
    navigation.push(routeName, params);
  } catch (error) {
    console.error('Error during navigation push:', error);
    // Fall back to regular navigate as a safer option
    safeNavigate(navigation, routeName, params);
  }
};

// Helper for going back in navigation
export const safeGoBack = (navigation, fallbackRoute = 'Home') => {
  if (!navigation) {
    console.warn('Navigation object is undefined or null');
    return;
  }

  try {
    // Check if canGoBack method exists and if we can go back
    if (typeof navigation.canGoBack === 'function' && navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    
    // If we can't go back in the navigation stack
    if (typeof window !== 'undefined') {
      // Check if browser can go back
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Navigate to fallback route if can't go back
        safeNavigate(navigation, fallbackRoute);
      }
    } else {
      // Fallback to navigate to home screen
      safeNavigate(navigation, fallbackRoute);
    }
  } catch (error) {
    console.error('Error during navigation goBack:', error);
    // Fall back to home screen
    safeNavigate(navigation, fallbackRoute);
  }
};

export default {
  safeNavigate,
  safeReset,
  safePush,
  safeGoBack
};
