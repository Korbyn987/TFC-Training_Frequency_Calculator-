/**
 * Dimensions shim for React Native Web
 */

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

let dimensionsInitialized = false;
let dimensionsListeners = [];

function initializeDimensions() {
  if (dimensionsInitialized || typeof window === 'undefined') return;
  
  // Update dimensions on window resize
  window.addEventListener('resize', () => {
    dimensions.window.width = window.innerWidth;
    dimensions.window.height = window.innerHeight;
    dimensions.screen.width = window.screen.width;
    dimensions.screen.height = window.screen.height;
    
    // Notify listeners
    dimensionsListeners.forEach(listener => {
      listener({
        window: dimensions.window,
        screen: dimensions.screen
      });
    });
  });
  
  dimensionsInitialized = true;
}

if (typeof window !== 'undefined') {
  initializeDimensions();
}

const Dimensions = {
  get: function(dimension) {
    if (dimension === 'window') {
      return dimensions.window;
    } else if (dimension === 'screen') {
      return dimensions.screen;
    }
    return dimensions.window;
  },
  
  set: function(dims) {
    if (dims.screen) {
      dimensions.screen = dims.screen;
    }
    if (dims.window) {
      dimensions.window = dims.window;
    }
  },
  
  addEventListener: function(type, handler) {
    if (type === 'change' && typeof handler === 'function') {
      dimensionsListeners.push(handler);
      return {
        remove: function() {
          const index = dimensionsListeners.indexOf(handler);
          if (index !== -1) {
            dimensionsListeners.splice(index, 1);
          }
        }
      };
    }
    return { remove: () => {} };
  },
  
  removeEventListener: function(type, handler) {
    if (type === 'change' && typeof handler === 'function') {
      const index = dimensionsListeners.indexOf(handler);
      if (index !== -1) {
        dimensionsListeners.splice(index, 1);
      }
    }
  }
};

export default Dimensions;
