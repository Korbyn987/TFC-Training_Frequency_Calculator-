/**
 * Entry point that ensures polyfills are loaded first
 * This file is imported before any React Native code
 */

// Fix for process is not defined error
if (typeof process === 'undefined') {
  window.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    nextTick: fn => setTimeout(fn, 0),
    platform: 'web',
    release: {},
    versions: {}
  };
}

// Add required globals
if (!global) {
  window.global = window;
}

// Ensure Buffer is defined
if (typeof Buffer === 'undefined') {
  window.Buffer = require('buffer/').Buffer;
}

// Import our shims in the correct order
// Dimensions first, as many components depend on it
import '../src/shims/complete-dimensions-override';

// Import AsyncStorage shim 
import '../src/shims/AsyncStorage';

// Import color shim for navigation
import '../src/shims/color';

// Setup BatchedBridge globally (needed for React Native internals)
window.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [
    ["DeviceInfo", {
      "constants": {
        "Dimensions": window.RNDimensions
      },
      "moduleID": 1,
      "methods": {}
    }]
  ]
};

// Create global objects needed by React Native
window.BatchedBridge = window.BatchedBridge || {
  registerLazyCallableModule: () => {},
  registerCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => [[], [], [], 0],
  invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
  flushedQueue: () => [[], [], [], 0],
  getCallableModule: () => ({}),
  callNativeSyncHook: () => {}
};

// Create NativeModules object if it doesn't exist
window.NativeModules = window.NativeModules || {};

// Setup DeviceInfo in NativeModules for React Native compatibility
window.NativeModules.DeviceInfo = {
  Dimensions: window.RNDimensions
};

// Add other commonly needed modules to NativeModules
window.NativeModules.StatusBarManager = {
  getHeight: (cb) => cb({ height: 0 }),
  setStyle: () => {},
  setHidden: () => {},
  HEIGHT: 0
};

// Clipboard module shim
window.NativeModules.Clipboard = {
  getString: async () => '',
  setString: () => {}
};

// Appearance module for dark mode detection
window.NativeModules.Appearance = {
  getColorScheme: () => 'light',
  addListener: () => {},
  removeListeners: () => {}
};

// Error handler to catch and log React Native errors
window.ErrorUtils = {
  reportError: (error) => {
    console.error('React Native Error:', error);
  },
  reportFatalError: (error) => {
    console.error('React Native Fatal Error:', error);
  }
};

// Now import the regular entry point
import './index.js';

// Log initialization complete
console.log('React Native Web polyfills initialized');

