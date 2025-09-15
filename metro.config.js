const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable all platforms
config.resolver.platforms = ["ios", "android", "native", "web"];

// Platform-specific resolver configuration
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Add resolver for network modules
config.resolver.sourceExts = ["js", "jsx", "ts", "tsx", "json"];

// Block React Native Web entirely for native platforms (Android/iOS)
config.resolver.blockList = [
  // Block react-native-web for Android and iOS builds
  /.*\/react-native-web\/.*/
];

// Only enable React Native Web aliases for web platform
config.resolver.alias = {};

// Improve cache management
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true
  }
};

// Better reload handling
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Add headers to prevent caching issues during development
      if (req.url.includes("hot-reload") || req.url.includes("reload")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      }
      return middleware(req, res, next);
    };
  }
};

// Platform-specific configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true
    }
  })
};

module.exports = config;
