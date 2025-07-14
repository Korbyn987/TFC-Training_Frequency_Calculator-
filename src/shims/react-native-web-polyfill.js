// This polyfill must be loaded before any React Native code

// Set up global React Native Web polyfill
if (typeof window !== 'undefined') {
  // Create global ReactNativeWebView if it doesn't exist
  if (!window.ReactNativeWebView) {
    window.ReactNativeWebView = {
      postMessage: () => {},
      onMessage: {},
    };
  }

  // Set up BatchedBridge
  if (!window.__fbBatchedBridgeConfig) {
    window.__fbBatchedBridgeConfig = {
      remoteModuleConfig: [
        ["DevSettings", {
          "constants": {},
          "moduleID": 0,
          "methods": {
            "reload": {"type": "remote", "methodID": 0}
          }
        }]
      ]
    };
  }

  // Set up BatchedBridge global
  if (!window.BatchedBridge) {
    window.BatchedBridge = {
      registerLazyCallableModule: () => {},
      registerCallableModule: () => {},
      callFunctionReturnFlushedQueue: () => [],
      invokeCallbackAndReturnFlushedQueue: () => [],
      flushedQueue: () => [],
      processCallbacks: () => {},
      getCallableModule: () => ({}),
      callNativeSyncHook: () => {}
    };
  }

  // Set up native modules
  if (!window.nativeModuleProxy) {
    window.nativeModuleProxy = {
      NativeModules: {}
    };
  }

  // Set up native extensions
  if (!window.nativeExtensions) {
    window.nativeExtensions = {};
  }
}

// Export an empty object as the default export
export default {};
