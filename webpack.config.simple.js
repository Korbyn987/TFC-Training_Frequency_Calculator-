const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

process.env.NODE_ENV = 'development';

// Simplified regex pattern
const excludedNodeModules = [
  'react-native-web',
  '@expo',
  'expo-',
  '@react-navigation',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-screens',
  'react-native-safe-area-context',
  'react-native-svg'
];

module.exports = {
  mode: 'development',
  entry: './index.web.js',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
    globalObject: 'this'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    compress: true,
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      // Handle SQL files
      {
        test: /\.sql$/,
        use: 'raw-loader',
      },
      // Handle Flow type annotations
      {
        test: /\.(js|jsx|mjs)$/,
        include: [
          path.resolve(__dirname, 'node_modules/react-native/'),
          path.resolve(__dirname, 'node_modules/react-native-svg/'),
          path.resolve(__dirname, 'node_modules/@react-native/'),
          path.resolve(__dirname, 'src/'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-expo'],
            plugins: [
              '@babel/plugin-transform-flow-strip-types',
              '@babel/plugin-proposal-export-namespace-from',
              '@babel/plugin-syntax-dynamic-import',
              ['@babel/plugin-transform-runtime', { helpers: true }],
            ],
          },
        },
      },
      // Handle standard JavaScript/TypeScript files
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: (modulePath) => {
          return /node_modules/.test(modulePath) && 
                 !excludedNodeModules.some(module => modulePath.includes(module));
        },
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['babel-preset-expo'],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg|ttf|otf)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native-svg': 'react-native-svg-web',
      'color$': path.resolve(__dirname, 'src/shims/color.js'),
      'color': path.resolve(__dirname, 'src/shims/color.js'),
      'query-string': path.resolve(__dirname, 'node_modules/query-string'),
      'expo-sqlite': path.resolve(__dirname, 'src/shims/expo-sqlite.js'),
      // Add aliases for react-native modules
      'react-native/Libraries/Components/View/ViewStylePropTypes': 'react-native-web/dist/exports/View/ViewStylePropTypes',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
      'react-native/Libraries/EventEmitter/NativeEventEmitter': 'react-native-web/dist/vendor/react-native/emitter/NativeEventEmitter',
    },
    fallback: {
      'process/browser': require.resolve('process/browser'),
      querystring: require.resolve('querystring-es3'),
      url: require.resolve('url/'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer/'),
      util: require.resolve('util/'),
      process: require.resolve('process/browser'),
      path: require.resolve('path-browserify'),
      fs: false,
      http: false,
      https: false,
      zlib: false,
      // Add fallbacks for react-native specific modules
      'react-native-sqlite-storage': false,
      'expo-sqlite': false,
      '@react-native-async-storage/async-storage': false,
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
      Color: ['color', 'default'],
      React: 'react',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: process.env.NODE_ENV !== 'production',
    }),
    new HtmlWebpackPlugin({
      template: './web/index.html',
    }),
  ],
};
