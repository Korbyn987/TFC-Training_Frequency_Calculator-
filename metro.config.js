const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable all platforms
config.resolver.platforms = ["native", "android", "ios", "web"];

// Platform-specific resolver configuration
config.resolver.resolverMainFields = ["react-native", "browser", "main"];

// Block React Native Web entirely for native platforms (Android/iOS)
config.resolver.blockList = [
  // Block react-native-web for Android and iOS builds
  /.*\/react-native-web\/.*/
];

// Only enable React Native Web aliases for web platform
config.resolver.alias = {};

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
