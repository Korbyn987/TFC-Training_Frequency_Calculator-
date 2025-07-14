// This is an enhanced stub file used to replace native modules in the React Native web build
// It provides minimal implementations of commonly used functions and objects

// Common exports for RN modules
export const Platform = { OS: 'web', select: obj => obj.web || obj.default };
export const StyleSheet = { create: styles => styles };
export const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {}
};

// Asset registry mock
export const getAssetByID = () => null;
export const registerAsset = () => 1;
export const getImageAssetPath = () => '';
export const getPathForResource = () => null;
export const pathSupport = { separator: '/' };

// Virtualized lists exports
export const VirtualizedList = 'div';
export const VirtualizedSectionList = 'div';

// Color normalization
export const normalizeColor = color => color;
export const processColor = color => color;

// Error guard polyfill
export const ErrorUtils = {
  setGlobalHandler: () => {}
};

// Default export for modules that import the whole file
export default {
  Platform,
  StyleSheet,
  BackHandler,
  getAssetByID,
  registerAsset,
  normalizeColor,
  processColor,
  ErrorUtils
};
