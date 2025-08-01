/**
 * BatchedBridge shim for React Native Web
 * Provides a mock configuration for __fbBatchedBridgeConfig
 */

// Mock native modules
const NativeModules = {
  StatusBarManager: {
    HEIGHT: 0,
    setStyle: () => {},
    setHidden: () => {},
    setNetworkActivityIndicatorVisible: () => {}
  },
  Timing: {
    createTimer: () => {},
    deleteTimer: () => {}
  },
  UIManager: {
    getViewManagerConfig: () => ({}),
    createView: () => {},
    updateView: () => {},
    focus: () => {},
    blur: () => {},
    findSubviewIn: () => {},
    dispatchViewManagerCommand: () => {},
    measure: () => {},
    measureInWindow: () => {},
    viewIsDescendantOf: () => {},
    measureLayout: () => {},
    measureLayoutRelativeToParent: () => {},
    setJSResponder: () => {},
    clearJSResponder: () => {}
  },
  DeviceInfo: {
    Dimensions: {
      window: {
        width: typeof window !== 'undefined' ? window.innerWidth : 375,
        height: typeof window !== 'undefined' ? window.innerHeight : 667,
        scale: 1,
        fontScale: 1
      },
      screen: {
        width: typeof window !== 'undefined' ? window.innerWidth : 375,
        height: typeof window !== 'undefined' ? window.innerHeight : 667,
        scale: 1,
        fontScale: 1
      }
    },
    isIPhoneX_deprecated: false
  },
  PlatformConstants: {
    forceTouchAvailable: false
  }
};

// Create global bridge config
if (typeof window !== 'undefined') {
  window.__fbBatchedBridgeConfig = {
    remoteModuleConfig: Object.keys(NativeModules).reduce((acc, name) => {
      acc[name] = {
        moduleID: name,
        methods: Object.keys(NativeModules[name]).reduce((methodMap, methodName) => {
          const method = NativeModules[name][methodName];
          if (typeof method === 'function') {
            methodMap[methodName] = {
              type: 'remote',
              methodID: methodName
            };
          }
          return methodMap;
        }, {})
      };
      return acc;
    }, {})
  };

  // Mock BatchedBridge
  window.BatchedBridge = {
    registerCallableModule: () => {},
    registerLazyCallableModule: () => {},
    callFunctionReturnFlushedQueue: () => [[], [], [], 0],
    invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
    flushedQueue: () => [[], [], [], 0],
    getCallableModule: () => ({})
  };
}

export { NativeModules };
export default NativeModules;
