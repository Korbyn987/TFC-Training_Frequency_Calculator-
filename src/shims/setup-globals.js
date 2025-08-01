/**
 * Global setup for React Native Web compatibility
 * This file sets up critical global variables before React Native modules load
 */

// Setup global bridge config to prevent 'not set' errors
global.__fbBatchedBridgeConfig = {
  remoteModuleConfig: {}
};

// Mock BatchedBridge
global.BatchedBridge = {
  registerCallableModule: () => {},
  registerLazyCallableModule: () => {},
  callFunctionReturnFlushedQueue: () => [[], [], [], 0],
  invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
  flushedQueue: () => [[], [], [], 0],
  getCallableModule: () => ({})
};

// Expose to window for browser environment
if (typeof window !== 'undefined') {
  window.__fbBatchedBridgeConfig = global.__fbBatchedBridgeConfig;
  window.BatchedBridge = global.BatchedBridge;
}

export default {};
