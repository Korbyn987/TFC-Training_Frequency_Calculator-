const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    'expo-file-system': path.resolve(__dirname, 'src/shims/expo-file-system.web.js'),
  };

  // Add web-specific configurations
  config.resolve.extensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    '.js',
    '.jsx',
    '.ts',
    '.tsx'
  ];

  // Add Node.js polyfills for newer Node versions
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer/"),
    "process": require.resolve("process/browser"),
  };

  // Add plugins for polyfills
  config.plugins.push(
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    })
  );

  // Ignore expo-file-system entirely on web to prevent warnings and Buffer errors
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^expo-file-system$/
    })
  );

  return config;
};
