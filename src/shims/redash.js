/**
 * Shim for react-native-redash for web
 * This provides safe fallbacks for redash functions in the web context
 */

import React from 'react';
import { Text } from 'react-native-web';
import { transformStyles } from './styleShim';

// Simple implementation of ReText component with style transformation
export const ReText = ({ text, style }) => {
  // Transform the style to be web-compatible
  const webStyle = transformStyles(style);
  return <Text style={webStyle}>{typeof text === 'object' && text.value !== undefined ? text.value : text}</Text>;
};

// Mock functions used by the app
export const useAnimatedProps = () => ({});
export const useVector = (x, y) => ({ x, y });
export const withPause = (animationValue, paused) => animationValue;
export const withBouncing = (animationValue, bounciness) => animationValue;

// Default export
export default {
  ReText,
  useAnimatedProps,
  useVector,
  withPause,
  withBouncing
};
