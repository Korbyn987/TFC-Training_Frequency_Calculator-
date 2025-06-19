const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const isDev = process.env.NODE_ENV !== 'production';

// Set the port for the dev server
const PORT = process.env.PORT || 3006;

module.exports = {
  mode: isDev ? 'development' : 'production',
  entry: {
    app: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      'webpack/hot/dev-server',
      `webpack-dev-server/client?http://localhost:${PORT}`,
      './browser.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    publicPath: '/',
    globalObject: 'this',
  },
  devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
      publicPath: '/',
    },
    port: PORT,
    host: '0.0.0.0',
    historyApiFallback: true,
    hot: true,
    open: true,
    compress: true,
    allowedHosts: 'all',
    client: {
      progress: true,
      overlay: {
        errors: true,
        warnings: false,
      },
      logging: 'warn',
    },
    devMiddleware: {
      stats: 'minimal',
    },
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
      '.mjs',
    ],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Renderer/shims/ReactNativePropRegistry': 'react-native-web/dist/modules/ReactNativePropRegistry',
      'react-native/Libraries/Components/View/ReactNativeStyleAttributes': 'react-native-web/dist/exports/StyleSheet/compiler/react-native-web',
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native-svg': 'react-native-svg-web',
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules\/(?!(?:@react-native|react-native|@react-navigation|@react-native-community|@react-native-masked-view|@react-native-picker)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              ['@babel/preset-env', { useBuiltIns: 'usage', corejs: 3 }],
              '@babel/preset-react',
              '@babel/preset-typescript',
              'module:metro-react-native-babel-preset',
            ],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              ['@babel/plugin-proposal-private-methods', { loose: true }],
              ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
              '@babel/plugin-transform-runtime',
            ],
          },
        },
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './web/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: isDev,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  externals: {
    'core-js/stable': 'core-js/stable',
    'regenerator-runtime/runtime': 'regenerator-runtime/runtime',
  },
  optimization: {
    minimize: !isDev,
    splitChunks: {
      chunks: 'all',
    },
  },
};
