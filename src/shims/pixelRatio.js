/**
 * PixelRatio shim for React Native Web
 * This provides pixel density information for the device
 */

import Dimensions from './dimensions';

const PixelRatio = {
  get: function() {
    return window.devicePixelRatio || 1;
  },
  
  // Return the floating point value of a pixel value by multiplying by the pixel ratio
  roundToNearestPixel: function(value) {
    const pixelRatio = PixelRatio.get();
    return Math.round(value * pixelRatio) / pixelRatio;
  },
  
  // Return the pixel value by multiplying by the pixel ratio
  getPixelSizeForLayoutSize: function(layoutSize) {
    return Math.round(layoutSize * PixelRatio.get());
  },
  
  // Set to true when font scales independently from system size settings
  getFontScale: function() {
    return Dimensions.get('window').fontScale || 1;
  },
  
  // Return pixel density
  get pixelSizeForLayoutSize() {
    return PixelRatio.getPixelSizeForLayoutSize;
  },
  
  // Ratio of pixels in a layout to pixels on the physical screen
  startDetecting: function() {}
};

export default PixelRatio;
