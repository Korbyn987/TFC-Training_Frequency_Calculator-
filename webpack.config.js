const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);
const { presets } = require(`${appDirectory}/babel.config.js`);

const compileNodeModules = [
  // Add React Native and other packages that need compiling
  'react-native-reanimated',
  'react-native-vector-icons',
  '@react-native',
  'react-native',
  '@react-navigation',
  '@expo',
  'expo',
].map((moduleName) => path.resolve(appDirectory, `node_modules/${moduleName}`));

const babelLoaderConfiguration = {
  test: /\.js$|tsx?$/,
  // Add every directory that needs to be compiled by Babel during the build
  include: [
    path.resolve(__dirname, 'src'),
    path.resolve(__dirname, 'App.js'),
    path.resolve(__dirname, 'index.js'),
    ...compileNodeModules,
  ],
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,
      presets,
      plugins: ['react-native-reanimated/plugin'],
    },
  },
};

const svgLoaderConfiguration = {
  test: /\.svg$/,
  use: [{
    loader: '@svgr/webpack',
    options: {
      native: true,
      dimensions: false,
    },
  }],
};

const imageLoaderConfiguration = {
  test: /\.(gif|jpe?g|png)$/,
  type: 'asset/resource',
};

const fontLoaderConfiguration = {
  test: /\.ttf$/,
  type: 'asset/resource',
};

module.exports = {
  entry: {
    app: path.join(__dirname, 'src/index.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public/index.html'),
      favicon: path.join(__dirname, 'public/favicon.ico'),
    }),
  ],
  output: {
    path: path.resolve(appDirectory, 'web-build'),
    filename: 'bundle.[contenthash].js',
    publicPath: '/',
  },
  resolve: {
    extensions: [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.json',
    ],
    alias: {
      'react-native$': 'react-native-web',
      'react-native-svg': 'react-native-svg-web',
      'color': path.resolve(__dirname, 'src/shims/color.js'),
      // Add aliases for missing modules
      'react-native-web/dist/normalize-colors': path.resolve(__dirname, 'src/shims/react-native-web/dist/normalize-colors.js'),
      'react-native-web/dist/assets-registry/registry': path.resolve(__dirname, 'src/shims/react-native-web/dist/assets-registry/registry.js'),
      // Add shim for react-native-reanimated
      'react-native-reanimated': path.resolve(__dirname, 'src/shims/reanimated.js'),
      // Add shim for react-native-redash
      'react-native-redash': path.resolve(__dirname, 'src/shims/redash.js'),
      // Add shim for react-native-circular-progress-indicator
      'react-native-circular-progress-indicator': path.resolve(__dirname, 'src/shims/circular-progress-indicator.js'),
      // Add shim for @react-native-async-storage/async-storage
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/shims/AsyncStorage.js'),
    },
    fallback: {
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
      zlib: require.resolve('browserify-zlib'),
      fs: false,
      buffer: require.resolve('buffer/'),
      process: require.resolve('process/browser'),
    },
  },
  module: {
    rules: [
      babelLoaderConfiguration,
      imageLoaderConfiguration,
      svgLoaderConfiguration,
      fontLoaderConfiguration,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'web/index.html'),
      filename: 'index.html',
      inject: true,
    }),
    new webpack.DefinePlugin({
      // See: https://github.com/necolas/react-native-web/issues/349
      __DEV__: JSON.stringify(true),
      process: { env: {} },
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    compress: true,
    port: 19006,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // Disable client overlay to remove the "compiled with problems" page
    client: {
      overlay: false,
    },
  },
};
