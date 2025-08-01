/**
 * Web application bootstrap file
 * This file helps resolve the Expo CLI bodyStream error by providing a direct web entry point
 */

// Polyfill global scope for web environment
if (typeof global === 'undefined') {
  window.global = window;
}

// Import required app entry point
import '../browser.js';
