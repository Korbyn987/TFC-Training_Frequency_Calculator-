/**
 * Complete Dimensions Override Module
 * Completely replaces the React Native Dimensions module with a web-compatible version
 */

// Create the dimensions data
const dimensionsData = {
  window: {
    width: window.innerWidth,
    height: window.innerHeight,
    scale: window.devicePixelRatio || 1,
    fontScale: 1
  },
  screen: {
    width: window.screen.width,
    height: window.screen.height,
    scale: window.devicePixelRatio || 1,
    fontScale: 1
  }
};

// Event emitter implementation
class EventEmitter {
  constructor() {
    this.listeners = {};
  }
  
  addListener(eventType, listener) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(listener);
    return {
      remove: () => this.removeListener(eventType, listener)
    };
  }
  
  removeListener(eventType, listener) {
    if (!this.listeners[eventType]) return;
    const index = this.listeners[eventType].indexOf(listener);
    if (index !== -1) {
      this.listeners[eventType].splice(index, 1);
    }
  }
  
  emit(eventType, ...args) {
    if (!this.listeners[eventType]) return;
    this.listeners[eventType].forEach(listener => {
      listener(...args);
    });
  }
}

// Create the event emitter
const eventEmitter = new EventEmitter();
const eventName = 'change';

// The main dimensions module
const Dimensions = {
  get(dimension) {
    if (dimension in dimensionsData) {
      return dimensionsData[dimension];
    }
    
    // Safety fallback
    if (dimension === 'window') {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scale: window.devicePixelRatio || 1,
        fontScale: 1
      };
    } else if (dimension === 'screen') {
      return {
        width: window.screen.width,
        height: window.screen.height,
        scale: window.devicePixelRatio || 1,
        fontScale: 1
      };
    }
    
    return null;
  },
  
  // The problematic method that's causing the error
  set(dims) {
    // This method is only used in native RN, we can make it a no-op
    // or at least ensure it doesn't crash
    return false;
  },
  
  addEventListener(type, handler) {
    return eventEmitter.addListener(eventName, handler);
  },
  
  removeEventListener(type, handler) {
    eventEmitter.removeListener(eventName, handler);
  },
  
  // Extra helper methods for consistency
  update() {
    dimensionsData.window = {
      width: window.innerWidth,
      height: window.innerHeight,
      scale: window.devicePixelRatio || 1,
      fontScale: 1
    };
    
    eventEmitter.emit(eventName, {
      window: dimensionsData.window,
      screen: dimensionsData.screen
    });
    
    return true;
  }
};

// Update on resize
window.addEventListener('resize', () => {
  Dimensions.update();
});

// Set up globally for access from anywhere
window.RNDimensions = dimensionsData;
window.DimensionsModule = Dimensions;

// Inject into NativeModules for consistency
if (typeof window.NativeModules === 'undefined') {
  window.NativeModules = {};
}

window.NativeModules.DeviceInfo = window.NativeModules.DeviceInfo || {};
window.NativeModules.DeviceInfo.Dimensions = dimensionsData;

// Make sure BatchedBridge config exists
window.__fbBatchedBridgeConfig = window.__fbBatchedBridgeConfig || {
  remoteModuleConfig: []
};

// Check if DeviceInfo already exists in the config
let deviceInfoExists = false;
for (let i = 0; i < window.__fbBatchedBridgeConfig.remoteModuleConfig.length; i++) {
  if (window.__fbBatchedBridgeConfig.remoteModuleConfig[i][0] === 'DeviceInfo') {
    window.__fbBatchedBridgeConfig.remoteModuleConfig[i][1].constants.Dimensions = dimensionsData;
    deviceInfoExists = true;
    break;
  }
}

// Add DeviceInfo if it doesn't exist
if (!deviceInfoExists) {
  window.__fbBatchedBridgeConfig.remoteModuleConfig.push([
    "DeviceInfo", {
      "constants": {
        "Dimensions": dimensionsData
      },
      "moduleID": Math.floor(Math.random() * 100) + 10, // Random ID that won't conflict
      "methods": {}
    }
  ]);
}

// Create BatchedBridge if it doesn't exist
window.BatchedBridge = window.BatchedBridge || {
  callFunctionReturnFlushedQueue: () => [[], [], [], 0],
  invokeCallbackAndReturnFlushedQueue: () => [[], [], [], 0],
  flushedQueue: () => [[], [], [], 0],
  callFunctionReturnResultAndFlushedQueue: () => [null, [], [], [], 0],
};

console.log('Complete Dimensions override module initialized');

// Export the Dimensions object for module imports
export default Dimensions;
