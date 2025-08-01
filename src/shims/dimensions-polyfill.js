/**
 * Direct Dimensions module polyfill for React Native Web
 */

// Define the dimensions object with required properties
const dimensionsData = {
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

// Create the dimensions handler
const dimensions = {
  get: function(dimension) {
    return dimensionsData[dimension];
  },
  set: function() {
    // Do nothing in the polyfill
    return false;
  },
  addEventListener: function() {
    // No-op implementation
    return {
      remove: () => {}
    };
  },
  removeEventListener: function() {
    // No-op implementation
  }
};

// Add resize handler
window.addEventListener('resize', () => {
  if (dimensionsData.window) {
    dimensionsData.window.width = window.innerWidth;
    dimensionsData.window.height = window.innerHeight;
  }
});

// Export the dimensions API
export default dimensions;

// Also expose as global for direct reference
window.RNDimensions = dimensionsData;
