/**
 * Comprehensive React Native Web shim module
 * This file provides web-compatible implementations for critical React Native modules
 */

// Dimensions implementation
const dimensions = {
  window: {
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
    scale: 1,
    fontScale: 1
  },
  screen: {
    width: typeof window !== 'undefined' ? window.screen.width : 375,
    height: typeof window !== 'undefined' ? window.screen.height : 667,
    scale: 1,
    fontScale: 1
  }
};

export const Dimensions = {
  get: function(dimension) {
    if (dimension === 'window') {
      return dimensions.window;
    } else if (dimension === 'screen') {
      return dimensions.screen;
    }
    return dimensions.window;
  },
  set: function(dims) {
    Object.assign(dimensions, dims);
  },
  addEventListener: function() {
    return { remove: () => {} };
  },
  removeEventListener: function() {}
};

// PixelRatio implementation
export const PixelRatio = {
  get: function() {
    return window.devicePixelRatio || 1;
  },
  roundToNearestPixel: function(value) {
    const ratio = PixelRatio.get();
    return Math.round(value * ratio) / ratio;
  },
  getPixelSizeForLayoutSize: function(layoutSize) {
    return Math.round(layoutSize * PixelRatio.get());
  },
  getFontScale: function() {
    return 1;
  },
  startDetecting: function() {}
};

// Platform implementation
export const Platform = {
  OS: 'web',
  select: (obj) => obj.web || obj.default,
  Version: 1,
  isTesting: false,
  isTV: false
};

// StyleSheet implementation
export const StyleSheet = {
  create: styles => styles,
  flatten: style => style,
  hairlineWidth: 1
};

// BatchedBridge implementation
export const BatchedBridge = {
  registerCallableModule: (name, module) => {},
  registerLazyCallableModule: (name, factory) => {},
  getCallableModule: (name) => ({}),
  callFunctionReturnFlushedQueue: () => [[], [], [], 0],
  invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
  flushedQueue: () => [[], [], [], 0],
  callFunctionReturnResultAndFlushedQueue: () => [null, [], [], [], 0]
};

// NativeModules implementation
export const NativeModules = {
  UIManager: {
    getViewManagerConfig: () => null,
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
    measureLayoutRelativeToAncestor: () => {}
  },
  DeviceInfo: {
    Dimensions: dimensions
  },
  I18nManager: {
    localeIdentifier: 'en_US',
    isRTL: false
  },
  NativeAnimatedModule: null,
  StatusBarManager: {
    HEIGHT: 0,
    setStyle: () => {},
    setHidden: () => {}
  },
  Timing: {
    createTimer: () => {},
    deleteTimer: () => {}
  }
};

// TurboModuleRegistry implementation
export const TurboModuleRegistry = {
  get(name) {
    return null;
  },
  getEnforcing(name) {
    return NativeModules[name] || null;
  }
};

// Setup global variables that React Native expects
if (typeof window !== 'undefined') {
  window.__fbBatchedBridgeConfig = {
    remoteModuleConfig: []
  };
  
  window.BatchedBridge = BatchedBridge;
  
  // Register core modules
  window.__fbBatchedBridgeConfig.remoteModuleConfig.push(
    ["UIManager", {
      constants: {},
      moduleID: 1,
      methods: {}
    }],
    ["Timing", {
      constants: {},
      moduleID: 2,
      methods: {}
    }],
    ["DeviceInfo", {
      constants: {
        Dimensions: dimensions
      },
      moduleID: 3,
      methods: {}
    }]
  );
  
  console.log('React Native Web modules initialized');
}
