/**
 * Enhanced Platform shim for React Native Web
 * Provides additional compatibility with React Native Platform module
 */

// Start with the web platform module
import { Platform as WebPlatform } from 'react-native-web';

// Create an enhanced platform object with additional properties needed by libraries
const Platform = {
  ...WebPlatform,
  
  // Make sure OS is correctly set
  OS: 'web',
  
  // Add constants that might be missing in React Native Web
  constants: {
    ...WebPlatform.constants,
    reactNativeVersion: {
      major: 0,
      minor: 72,
      patch: 10,
    },
    isTesting: false,
    isTV: false,
    isTVOS: false,
  },
  
  // Enhanced version of select that supports more native features
  select: (obj) => {
    if (!obj) {
      return null;
    }
    
    // First try web-specific value
    if (obj.web != null) {
      return obj.web;
    }
    
    // Then try native, or default
    return obj.default || obj.native || null;
  },
  
  // Version object matches the format returned by native Platform
  Version: 1,
  
  // Add methods that might be expected from React Native
  isPad: false,
  isTV: false,
  isTVOS: false,
  
  // Helper for component styles
  getConstants: () => {
    return Platform.constants;
  },
};

// Export both as default and named
export default Platform;
export { Platform };

// Also export as global if in browser
if (typeof window !== 'undefined') {
  window.ReactNativePlatform = Platform;
}
