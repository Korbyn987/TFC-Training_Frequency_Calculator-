/**
 * SafeAreaView shim for React Native Web
 * Provides a web-compatible version of react-native-safe-area-context
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

const SafeAreaView = ({ style, children, ...props }) => {
  // On web, SafeAreaView just renders as a regular View with some default padding
  return (
    <View 
      style={[styles.container, style]} 
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Add a small default padding to simulate safe area insets on web
    paddingTop: 8,
    paddingBottom: 8,
    flex: 1,
  }
});

// Also create a useSafeAreaInsets hook that returns consistent values on web
export const useSafeAreaInsets = () => {
  // Return fixed insets for web (could be made dynamic with media queries in a more complex implementation)
  return {
    top: 8,
    bottom: 8,
    left: 0,
    right: 0
  };
};

// Create SafeAreaProvider component that works on web
export const SafeAreaProvider = ({ children, ...props }) => {
  return (
    <View style={{ flex: 1 }} {...props}>
      {children}
    </View>
  );
};

// Create other components from the safe-area-context library for API compatibility
export const SafeAreaConsumer = ({ children }) => {
  const insets = useSafeAreaInsets();
  return children(insets);
};

export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight },
  insets: { top: 8, left: 0, right: 0, bottom: 8 }
};

// Export the SafeAreaView as default and named export
export default SafeAreaView;
export { SafeAreaView };
