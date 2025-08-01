/**
 * Color normalization module for React Native Web
 */

// Based on react-native-web's normalize-color implementation
function normalizeColor(color) {
  if (typeof color === 'number') {
    // Already normalized
    if (color >>> 0 === color && color >= 0 && color <= 0xffffffff) {
      return color;
    }
    return null;
  }
  
  // String color values
  if (typeof color === 'string') {
    // Hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        // #rgb
        return parseInt(`0xFF${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`, 16);
      } else if (hex.length === 6) {
        // #rrggbb
        return parseInt(`0xFF${hex}`, 16);
      } else if (hex.length === 8) {
        // #rrggbbaa
        return parseInt(`0x${hex}`, 16);
      }
    }
    
    // Named colors
    const namedColors = {
      'transparent': 0x00000000,
      'black': 0xFF000000,
      'white': 0xFFFFFFFF,
      'red': 0xFFFF0000,
      'green': 0xFF00FF00,
      'blue': 0xFF0000FF,
      'gray': 0xFF808080,
      'grey': 0xFF808080,
    };
    
    if (color.toLowerCase() in namedColors) {
      return namedColors[color.toLowerCase()];
    }
  }
  
  // Default
  return null;
}

// Export both default and named function
module.exports = normalizeColor;
module.exports.default = normalizeColor;
