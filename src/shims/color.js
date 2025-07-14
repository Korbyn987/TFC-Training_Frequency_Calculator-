/**
 * Custom color shim for React Native Web
 * Implements the color functions needed by React Navigation
 */

// Regular expressions for parsing color strings
const HEX_REGEX = /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const RGB_REGEX = /^rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)$/;
const RGBA_REGEX = /^rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]+)\s*\)$/;

// Additional HSL regex patterns for broader color support
const HSL_REGEX = /^hsl\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})%\s*,\s*([0-9]{1,3})%\s*\)$/;
const HSLA_REGEX = /^hsla\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})%\s*,\s*([0-9]{1,3})%\s*,\s*([0-9\.]+)\s*\)$/;

// Color name mapping (extended with more colors)
const COLOR_NAMES = {
  transparent: [0, 0, 0, 0],
  black: [0, 0, 0],
  white: [255, 255, 255],
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
  yellow: [255, 255, 0],
  cyan: [0, 255, 255],
  magenta: [255, 0, 255],
  gray: [128, 128, 128],
  grey: [128, 128, 128],
  purple: [128, 0, 128],
  navy: [0, 0, 128],
  orange: [255, 165, 0],
  lightgray: [211, 211, 211],
  lightgrey: [211, 211, 211],
  darkgray: [169, 169, 169],
  darkgrey: [169, 169, 169],
  // Add more color names as needed by React Navigation
  primary: [66, 153, 225], // default primary blue
  card: [255, 255, 255],
  border: [216, 216, 216],
  notification: [255, 59, 48]
};

function Color(color) {
  if (!(this instanceof Color)) {
    return new Color(color);
  }
  
  this.color = color;
  this._rgb = [0, 0, 0];
  this._alpha = 1;
  
  this._parse(color);
}

// Parse color strings into RGB values
Color.prototype._parse = function(color) {
  if (!color) return;
  
  // Handle string inputs
  if (typeof color === 'string') {
    color = color.toLowerCase().trim();
    
    // Named colors
    if (COLOR_NAMES[color]) {
      const values = COLOR_NAMES[color];
      this._rgb = values.slice(0, 3);
      this._alpha = values.length === 4 ? values[3] : 1;
      return;
    }
    
    // Hex colors
    let match = color.match(HEX_REGEX);
    if (match) {
      const hex = match[1];
      if (hex.length === 3) { // #RGB
        this._rgb = [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16)
        ];
      } else if (hex.length === 4) { // #RGBA
        this._rgb = [
          parseInt(hex[0] + hex[0], 16),
          parseInt(hex[1] + hex[1], 16),
          parseInt(hex[2] + hex[2], 16)
        ];
        this._alpha = parseInt(hex[3] + hex[3], 16) / 255;
      } else if (hex.length === 6) { // #RRGGBB
        this._rgb = [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16)
        ];
      } else if (hex.length === 8) { // #RRGGBBAA
        this._rgb = [
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16)
        ];
        this._alpha = parseInt(hex.substring(6, 8), 16) / 255;
      }
      return;
    }
    
    // RGB format
    match = color.match(RGB_REGEX);
    if (match) {
      this._rgb = [
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10)
      ];
      return;
    }
    
    // RGBA format
    match = color.match(RGBA_REGEX);
    if (match) {
      this._rgb = [
        parseInt(match[1], 10),
        parseInt(match[2], 10),
        parseInt(match[3], 10)
      ];
      this._alpha = parseFloat(match[4]);
      return;
    }
  }
  
  // Handle array input
  if (Array.isArray(color)) {
    this._rgb = color.slice(0, 3).map(Number);
    if (color.length >= 4) {
      this._alpha = Number(color[3]);
    }
  }
};

// Convert color to RGBA string
Color.prototype.toString = function() {
  return `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${this._alpha})`;
};

// Make color darker
Color.prototype.darken = function(amount = 0.1) {
  const rgb = this._rgb.map(val => Math.max(0, Math.floor(val * (1 - amount))));
  const result = new Color([...rgb, this._alpha]);
  return result;
};

// Create a lighter version of the color
Color.prototype.lighten = function(amount = 0.1) {
  const rgb = this._rgb.map(val => Math.min(255, Math.floor(val + (255 - val) * amount)));
  const result = new Color([...rgb, this._alpha]);
  return result;
};

// Change alpha value
Color.prototype.alpha = function(value) {
  const result = new Color([...this._rgb, value]);
  return result;
};

// Mix two colors together
Color.prototype.mix = function(otherColor, weight = 0.5) {
  // If string is passed, convert to Color object
  if (typeof otherColor === 'string') {
    otherColor = new Color(otherColor);
  }
  
  // If not a Color object, try to convert
  if (!(otherColor instanceof Color)) {
    try {
      otherColor = new Color(otherColor);
    } catch (e) {
      return this; // Return original if can't convert
    }
  }
  
  // Ensure weight is between 0 and 1
  weight = Math.max(0, Math.min(1, weight));
  
  // Mix the RGB values
  const rgb = [
    Math.round(this._rgb[0] * (1 - weight) + otherColor._rgb[0] * weight),
    Math.round(this._rgb[1] * (1 - weight) + otherColor._rgb[1] * weight),
    Math.round(this._rgb[2] * (1 - weight) + otherColor._rgb[2] * weight)
  ];
  
  // Mix the alpha
  const alpha = this._alpha * (1 - weight) + otherColor._alpha * weight;
  
  // Return new color
  return new Color([...rgb, alpha]);
};

// Convert color to hex string
Color.prototype.hex = function() {
  // Convert RGB values to hex
  const hexR = this._rgb[0].toString(16).padStart(2, '0');
  const hexG = this._rgb[1].toString(16).padStart(2, '0');
  const hexB = this._rgb[2].toString(16).padStart(2, '0');
  
  // Return hex color string
  return `#${hexR}${hexG}${hexB}`;
};

// Determine if a color is dark (for contrast calculation)
Color.prototype.isDark = function() {
  // Calculate relative luminance using the sRGB color space formula
  // Based on W3C accessibility guidelines
  const [r, g, b] = this._rgb.map(value => {
    const normalized = value / 255;
    return normalized <= 0.03928 ? 
      normalized / 12.92 : 
      Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  
  // Luminance formula gives more weight to green as human eyes are more sensitive to it
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  
  // A luminance of less than 0.5 is considered "dark"
  return luminance < 0.5;
};

// Add compatibility method to check for light colors (inverse of isDark)
Color.prototype.isLight = function() {
  return !this.isDark();
};

// Add method to get perceived brightness (alternative calculation)
Color.prototype.getBrightness = function() {
  // Formula: (R * 299 + G * 587 + B * 114) / 1000
  return (this._rgb[0] * 299 + this._rgb[1] * 587 + this._rgb[2] * 114) / 1000;
};

// Get contrast ratio with another color
Color.prototype.getContrastRatio = function(otherColor) {
  if (!(otherColor instanceof Color)) {
    otherColor = new Color(otherColor);
  }
  
  // Calculate luminance for both colors
  const getRelativeLuminance = (rgb) => {
    const [r, g, b] = rgb.map(value => {
      const normalized = value / 255;
      return normalized <= 0.03928 ? 
        normalized / 12.92 : 
        Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getRelativeLuminance(this._rgb);
  const l2 = getRelativeLuminance(otherColor._rgb);
  
  // Formula: (max(L1, L2) + 0.05) / (min(L1, L2) + 0.05)
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

// RGB method for compatibility with some libraries
Color.prototype.rgb = function() {
  return `rgb(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]})`;
};

// RGBA method for compatibility
Color.prototype.rgba = function(alpha) {
  if (typeof alpha === 'number') {
    return `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${alpha})`;
  }
  return `rgba(${this._rgb[0]}, ${this._rgb[1]}, ${this._rgb[2]}, ${this._alpha})`;
};

// HSL conversion for broader compatibility
Color.prototype.hsl = function() {
  const [r, g, b] = this._rgb.map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

// Color inversion for themes
Color.prototype.negate = function() {
  const rgb = this._rgb.map(value => 255 - value);
  return new Color([...rgb, this._alpha]);
};

// Set up the exports to work like the 'color' module
// This is critical for React Navigation's BottomTabBarItem
Color.default = Color;
Color.prototype.default = Color;

// Add static functions directly to Color constructor for compatibility
Color.rgb = function(r, g, b) {
  return new Color([r, g, b]);
};

Color.rgba = function(r, g, b, a) {
  return new Color([r, g, b, a]);
};

Color.hsl = function(h, s, l) {
  // Convert HSL to RGB
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return new Color([Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]);
};

// Create a factory function for convenience
const colorFactory = (c) => new Color(c);
colorFactory.default = colorFactory;

// Ensure all Color methods are also available on the factory function
Object.keys(Color).forEach(key => {
  if (typeof Color[key] === 'function' && !colorFactory[key]) {
    colorFactory[key] = Color[key];
  }
});

// Add compatibility for CommonJS and ES Modules
module.exports = colorFactory;
module.exports.default = colorFactory;
