const createExpoWebpackConfig = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfig({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@react-navigation'],
    },
  }, argv);

  // Customize the config before returning it.
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      'react-native$': 'react-native-web',
      'expo-file-system': path.resolve(__dirname, 'src/shims/expo-file-system.web.js'),
    },
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
    fallback: {
      ...config.resolve?.fallback,
      crypto: false,
      path: false,
      util: false,
      stream: false,
      buffer: false,
      process: false,
    },
  };

  // Add plugins for polyfills if needed
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin({
      resourceRegExp: /^expo-file-system$/
    })
  ];

  // Handle MIME type errors
  config.module = {
    ...config.module,
    rules: [
      ...(config.module?.rules || []),
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(@react-navigation|react-native-gesture-handler|react-native-reanimated|@react-native-community\/masked-view|react-native-screens|react-native-safe-area-context|@react-navigation\/.*|@react-navigation\/.*\/.*)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: [
              '@babel/plugin-proposal-export-namespace-from',
              'react-native-reanimated/plugin',
            ],
          },
        },
      },
    ],
  };

  return config;
};
