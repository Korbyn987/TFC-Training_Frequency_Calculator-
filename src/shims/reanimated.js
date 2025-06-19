/**
 * Shim for react-native-reanimated for web
 * This provides safe fallbacks for reanimated functions in the web context
 */

// Mock functions and components for Reanimated in web context
const createAnimatedComponent = (Component) => Component;

// Import the style transformation utility
import { transformStyles } from './styleShim';

const useAnimatedStyle = (styleCallback) => {
  try {
    // Try to execute the styleCallback function safely
    let style = typeof styleCallback === 'function' ? styleCallback() : {};
    // Transform the resulting style to be web-compatible
    return transformStyles(style);
  } catch (error) {
    console.warn('Error in useAnimatedStyle:', error);
    return {}; // Return empty style object as fallback
  }
};

const useSharedValue = (initialValue) => {
  return {
    value: initialValue,
    _value: initialValue,
    setValue: function(newValue) {
      this.value = newValue;
      this._value = newValue;
    },
    addListener: () => {},
    removeListener: () => {},
  };
};

const withTiming = (toValue, config, callback) => {
  if (callback) {
    callback(true);
  }
  return toValue;
};

const withSpring = (toValue, config, callback) => {
  if (callback) {
    callback(true);
  }
  return toValue;
};

const withDelay = (delay, animation) => animation;

const runOnJS = (fn) => (...args) => fn(...args);

const useAnimatedGestureHandler = (handlers) => {
  return handlers;
};

// Function to track animated nodes
const useAnimatedReaction = (prepare, react, deps) => {
  // No-op implementation for web
};

// Function used by react-native-redash
const addWhitelistedNativeProps = (props) => {
  // This is a no-op in our web shim
  return props;
};

// Additional functions used by third-party libraries
const useAnimatedRef = () => {
  return { current: null };
};

const useDerivedValue = (derivation) => {
  return useSharedValue(0);
};

const interpolate = (value, inputRange, outputRange, options) => {
  return outputRange[0];
};

const Extrapolation = {
  CLAMP: 'clamp',
  IDENTITY: 'identity',
  EXTEND: 'extend',
};

// Empty worklet implementation for web
const worklet = fn => fn;

// Create a default export with all the mocked functions
const Reanimated = {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useDerivedValue,
  interpolate,
  Extrapolation,
  addWhitelistedNativeProps,
  // Add default for worklet tagging
  default: {
    addWhitelistedNativeProps,
  }
};

export {
  createAnimatedComponent,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useDerivedValue,
  interpolate,
  Extrapolation,
  addWhitelistedNativeProps,
  worklet,
};

export default Reanimated;
