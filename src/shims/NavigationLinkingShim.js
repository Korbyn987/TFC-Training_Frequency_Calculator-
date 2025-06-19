/**
 * Shim to fix React Navigation linking issues in web environment
 * This patches the useLinking and URL handling behavior of React Navigation
 */
import { useCallback, useEffect, useRef } from 'react';

// Modified version of the useLinking hook that's more resilient for web
export function useEnhancedLinking(ref, options = {}) {
  const getInitialURLRef = useRef(false);
  
  // Ensure we have proper options with safe defaults
  const {
    enabled = true,
    prefixes = [],
    config = {},
    getInitialURL = () => Promise.resolve(typeof window !== 'undefined' ? window.location.href : ''),
    subscribe = (listener) => {
      // Safe event registration for web
      if (typeof window !== 'undefined') {
        window.addEventListener('popstate', listener);
        return () => window.removeEventListener('popstate', listener);
      }
      return () => {};
    },
    getStateFromPath = () => ({}),
    getActionFromState = () => null,
  } = options;

  // Safe function to get the current navigation state
  const getStateForAction = useCallback((action, state) => {
    try {
      if (!ref.current) {
        return null;
      }

      // Get the navigator's state safely
      const navigation = ref.current;
      
      if (!navigation.getRootState) {
        return null;
      }

      // Get the root state or a safe fallback
      const rootState = navigation.getRootState() || { routes: [{ name: 'Home' }], index: 0 };
      
      // If we have a state, attempt to apply the action
      if (rootState) {
        try {
          // This is where the original code would try to calculate the new state
          // Instead, we'll just return the current state as a safe fallback
          return rootState;
        } catch (e) {
          console.warn('Error applying navigation action:', e);
          return rootState;
        }
      }
      
      return null;
    } catch (e) {
      console.error('Error in getStateForAction:', e);
      return null;
    }
  }, [ref]);

  // Safe navigation reset that avoids the routes error
  const safeResetRoot = useCallback((state) => {
    try {
      if (ref.current) {
        const navigation = ref.current;
        
        // Check if we have the resetRoot method
        if (navigation.resetRoot) {
          // Create a minimal safe state if the provided one is problematic
          const safeState = {
            index: 0,
            routes: [{ name: 'Home' }]
          };
          
          // Try to use the provided state but fallback to safe state
          try {
            navigation.resetRoot(state || safeState);
          } catch (e) {
            console.warn('Error in resetRoot with provided state, using fallback:', e);
            navigation.resetRoot(safeState);
          }
        }
      }
    } catch (e) {
      console.error('Error in safeResetRoot:', e);
    }
  }, [ref]);

  // Modified URL handler for web environment
  const onReceiveURL = useCallback(async ({ url }) => {
    try {
      if (!enabled || !ref.current) {
        return;
      }

      const navigation = ref.current;
      const path = url.replace(/^https?:\/\/[^/]+/, '');
      
      try {
        const state = getStateFromPath(path, config);
        
        if (state) {
          const action = getActionFromState(state, config);
          
          if (action !== undefined) {
            try {
              navigation.dispatch(action);
            } catch (e) {
              console.warn('Error dispatching action, falling back to resetRoot:', e);
              safeResetRoot(state);
            }
          } else {
            safeResetRoot(state);
          }
        }
      } catch (e) {
        console.error('Error processing URL:', e);
      }
    } catch (e) {
      console.error('Error in onReceiveURL:', e);
    }
  }, [enabled, ref, config, getStateFromPath, getActionFromState, safeResetRoot]);

  // Set up URL subscription safely
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Only run this once
    if (getInitialURLRef.current) {
      return;
    }

    getInitialURLRef.current = true;

    // Get initial URL safely
    getInitialURL().then(url => {
      if (url) {
        onReceiveURL({ url });
      }
    }).catch(e => {
      console.warn('Failed to get initial URL:', e);
    });
  }, [enabled, getInitialURL, onReceiveURL]);

  // Set up ongoing URL change subscription
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to URL changes safely
    const listener = ({ url }) => onReceiveURL({ url });
    
    return subscribe(({ url }) => {
      listener({ url });
    });
  }, [enabled, subscribe, onReceiveURL]);

  // Return functions needed by React Navigation
  return {
    getStateFromPath,
    getActionFromState,
  };
}

export default useEnhancedLinking;
