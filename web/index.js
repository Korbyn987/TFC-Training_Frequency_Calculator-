// Web entry point - runs before any React Native code

// Core dimensions setup with both window and screen properties
const dimensions = {
  window: {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: 1,
    fontScale: 1
  },
  screen: {
    width: window.screen.width,
    height: window.screen.height,
    scale: 1,
    fontScale: 1
  }
};

// Inject into global namespace for direct access
window.RNDimensions = dimensions;

// Set up DeviceInfo in NativeModules
window.NativeModules = window.NativeModules || {};
window.NativeModules.DeviceInfo = {
  Dimensions: dimensions
};

// Configure BatchedBridge
window.__fbBatchedBridgeConfig = {
  remoteModuleConfig: [
    ["DevSettings", {
      "constants": {},
      "moduleID": 0,
      "methods": {
        "reload": {"type": "remote", "methodID": 0}
      }
    }],
    ["DeviceInfo", {
      "constants": {
        "Dimensions": dimensions
      },
      "moduleID": 1,
      "methods": {}
    }]
  ]
};

// Set up BatchedBridge with standard methods
window.BatchedBridge = {
  registerLazyCallableModule: () => {},
  registerCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => [[], [], [], 0],
  invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
  flushedQueue: () => [[], [], [], 0],
  processCallbacks: () => {},
  getCallableModule: () => ({}),
  callNativeSyncHook: () => {},
  callFunctionReturnResultAndFlushedQueue: () => [null, [], [], [], 0]
};

// Add window resize listener
window.addEventListener('resize', () => {
  if (window.RNDimensions) {
    window.RNDimensions.window.width = window.innerWidth;
    window.RNDimensions.window.height = window.innerHeight;
    
    // Also update in NativeModules if it exists
    if (window.NativeModules && 
        window.NativeModules.DeviceInfo && 
        window.NativeModules.DeviceInfo.Dimensions) {
      window.NativeModules.DeviceInfo.Dimensions.window.width = window.innerWidth;
      window.NativeModules.DeviceInfo.Dimensions.window.height = window.innerHeight;
    }
  }
});

console.log('React Native Web polyfills initialized in web/index.js');

// Import the main entry point after setting up globals
import '../index.web';
