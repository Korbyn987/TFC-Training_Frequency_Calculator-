module.exports = function (api) {
  api.cache(true);

  // Base configuration for all platforms
  const baseConfig = {
    presets: ["babel-preset-expo"],
    plugins: ["react-native-reanimated/plugin"]
  };

  return baseConfig;
};
