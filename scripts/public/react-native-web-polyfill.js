// React Native Web Polyfills - Load before any React Native code

// Create global RN objects
window.__fbBatchedBridgeConfig = {
  remoteModuleConfig: []
};

// Add core modules to the bridge config
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
      Dimensions: {
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
      }
    },
    moduleID: 3,
    methods: {}
  }]
);

// Mock BatchedBridge
window.BatchedBridge = {
  callFunctionReturnFlushedQueue: function() { return [[], [], [], 0]; },
  invokeCallbackAndReturnFlushedQueue: function() { return [[], [], [], 0]; },
  flushedQueue: function() { return [[], [], [], 0]; },
  callFunctionReturnResultAndFlushedQueue: function() { return [null, [], [], [], 0]; }
};

// Create NativeModules
window.NativeModules = {
  UIManager: {
    getViewManagerConfig: function() { return null; },
    createView: function() {},
    updateView: function() {},
    focus: function() {},
    blur: function() {},
    findSubviewIn: function() {},
    dispatchViewManagerCommand: function() {},
    measure: function() {},
    measureInWindow: function() {},
    viewIsDescendantOf: function() {},
    measureLayout: function() {}
  },
  DeviceInfo: {
    Dimensions: {
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
    }
  },
  StatusBarManager: {
    HEIGHT: 0,
    setStyle: function() {},
    setHidden: function() {}
  }
};

// Global dimensions
window.RNDimensions = {
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

// Add update event listener
window.addEventListener('resize', function() {
  window.RNDimensions.window.width = window.innerWidth;
  window.RNDimensions.window.height = window.innerHeight;
});

console.log('React Native Web polyfills loaded successfully');
