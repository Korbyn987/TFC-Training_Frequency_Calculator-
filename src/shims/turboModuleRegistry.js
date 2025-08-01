/**
 * TurboModuleRegistry shim for React Native Web
 */

// Empty implementations of TurboModule functions
function get(name) {
  return null;
}

function getEnforcing(name) {
  // We're just returning empty objects for requested native modules
  // This prevents errors without actually implementing native functionality
  return {};
}

export default {
  get,
  getEnforcing
};

export {
  get,
  getEnforcing
};
