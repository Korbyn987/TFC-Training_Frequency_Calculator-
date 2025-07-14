const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Let mode setting handle NODE_ENV to avoid conflicts

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
  // Set mode explicitly to development
  mode: 'development',
  entry: {
    app: path.resolve(__dirname, 'web/polyfill-entry.js'),
  },
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].chunk.js',
    publicPath: '/',
    globalObject: 'this'
  },
  // Performance settings to avoid large asset warnings
  performance: {
    maxAssetSize: 3 * 1024 * 1024, // 3MB
    maxEntrypointSize: 3 * 1024 * 1024, // 3MB
    hints: 'warning'
  },
  // Enable code splitting for optimization
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: false,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },
    runtimeChunk: 'single'
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
    },
    compress: true,
    port: 3006,
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
      // ----- Stub missing React Native Web internal modules -----
      'react-native-web/dist/assets-registry/registry': false,
      'react-native-web/dist/assets-registry/path-support': false,
      'react-native-web/dist/normalize-colors': false,
      'react-native-web/dist/js-polyfills/error-guard': false,
      'react-native-web/dist/virtualized-lists': false,
      './RCTAlertManager': false,
      './RCTNetworking': false,
      './BaseViewConfig': false,
      '../Components/AccessibilityInfo/legacySendAccessibilityEvent': false,
      './PlatformColorValueTypes': false,
      '../../StyleSheet/PlatformColorValueTypes': false,
      '../DevToolsSettings/DevToolsSettingsManager': false,

      // ----- Map React-Native internal imports to web equivalents -----
      'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'src/shims/PlatformShim.js'),
      '../Utilities/Platform': path.resolve(__dirname, 'src/shims/PlatformShim.js'),
      '../../Utilities/Platform': path.resolve(__dirname, 'src/shims/PlatformShim.js'),
      '../../../Utilities/Platform': path.resolve(__dirname, 'src/shims/PlatformShim.js'),
      './Platform': path.resolve(__dirname, 'src/shims/PlatformShim.js'),
      '../Utilities/BackHandler': false,
      
      // ----- Map Image module references -----
      'react-native/Libraries/Components/Image/Image': 'react-native-web/dist/exports/Image',
      'react-native/Libraries/Image/Image': 'react-native-web/dist/exports/Image',
      '../../Image/Image': 'react-native-web/dist/exports/Image',
      '../Image/Image': 'react-native-web/dist/exports/Image',

      // ----- Stub native-only modules that have no meaning on the web -----
      'react-native/Libraries/StyleSheet/PlatformColorValueTypes': false,
      'react-native/Libraries/DevToolsSettings/DevToolsSettingsManager': false,
      'react-native/Libraries/Core/DevToolsSettings/DevToolsSettingsManager': false,
      'react-native/Libraries/Alert/RCTAlertManager': false,

      // ----- React-Native internal module mappings -----
      'react-native/Libraries/Image/AssetRegistry': false,
      'react-native/Libraries/Image/resolveAssetSource': false,
      'react-native/Libraries/Animated/Animated': false,
      'react-native/Libraries/Animated/NativeAnimatedHelper': false,
      'react-native/Libraries/Lists/FlatList': 'react-native-web/dist/exports/FlatList',
      'react-native/Libraries/Lists/SectionList': 'react-native-web/dist/exports/SectionList',
      'react-native/Libraries/Alert/Alert': false,
      'react-native/Libraries/AppState/AppState': false,
      'react-native/Libraries/Core/NativeExceptionsManager': false,
      'react-native/Libraries/Core/ReactNativeVersionCheck': false,
      'react-native/Libraries/Core/setUpDeveloperTools': false,
      'react-native/Libraries/Core/setUpReactDevTools': false,
      'react-native/Libraries/EventEmitter/NativeEventEmitter': false,
      'react-native/Libraries/Inspector/Inspector': false,
      'react-native/Libraries/LayoutAnimation/LayoutAnimation': false, 
      'react-native/Libraries/Linking/Linking': false,
      
      // ----- Existing aliases -----
      'react-native$': 'react-native-web',
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native-svg': 'react-native-svg-web',
      'color$': path.resolve(__dirname, 'src/shims/color.js'),
      'color': path.resolve(__dirname, 'src/shims/color.js'),
      'query-string': path.resolve(__dirname, 'node_modules/query-string'),
      'expo-sqlite': path.resolve(__dirname, 'src/shims/expo-sqlite.js'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, 'src/shims/AsyncStorage.js'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/shims/SafeAreaView.js'),

      // React-Native emitter/view fallbacks
      'react-native/Libraries/Components/View/ViewStylePropTypes': 'react-native-web/dist/exports/View/ViewStylePropTypes',
      'react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$': 'react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter',
      'react-native/Libraries/vendor/emitter/EventEmitter': 'react-native-web/dist/vendor/react-native/emitter/EventEmitter',
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
      template: path.resolve(__dirname, 'public/index.html'),
      filename: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      scriptLoading: 'blocking',
      excludeChunks: [],
      templateParameters: {
        fixScript: '<script src="/react-native-web-fix.js"></script>'
      }
    }),
    // Handle relative path imports that can't be addressed with normal aliases
    new webpack.NormalModuleReplacementPlugin(
      /\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /\.\.\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /\.\.\/\.\.\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /react-native-web\/dist\/assets-registry\/registry/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/asset-registry.js'); }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /react-native-web\/dist\/assets-registry\/path-support/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/asset-registry.js'); }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Image\/AssetRegistry/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/asset-registry.js'); }
    ),
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Image\/resolveAssetSource/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/asset-registry.js'); }
    ),
    // Also handle AssetSourceResolver
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Image\/AssetSourceResolver/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/asset-registry.js'); }
    ),
    
    // Colors
    new webpack.NormalModuleReplacementPlugin(
      /react-native-web\/dist\/normalize-colors/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/normalize-colors.js'); }
    ),
    
    // RCT components
    new webpack.NormalModuleReplacementPlugin(
      /\.\/\(RCTAlertManager|RCTNetworking|BaseViewConfig\)$/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/empty.js'); }
    ),
    
    // Error guard and virtualized lists
    new webpack.NormalModuleReplacementPlugin(
      /react-native-web\/dist\/js-polyfills\/error-guard/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/empty.js'); }
    ),
    
    new webpack.NormalModuleReplacementPlugin(
      /react-native-web\/dist\/virtualized-lists/,
      (resource) => { resource.request = path.resolve(__dirname, 'src/shims/empty.js'); }
    ),
    
    // Define noop modules that should be empty on web
    new webpack.DefinePlugin({
      '__fbBatchedBridgeConfig': 'window.__fbBatchedBridgeConfig',
      'global.RNDimensions': 'window.RNDimensions',
      'BatchedBridge': 'window.BatchedBridge',
      'NativeModules': 'window.NativeModules'
    }),
    
    // Use react-native-web's versions of core components directly
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/BatchedBridge\/NativeModules/,
      'react-native-web/dist/exports/NativeModules'
    ),
    
    // Direct override of the Dimensions module
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Utilities\/Dimensions/,
      path.resolve(__dirname, 'src/shims/complete-dimensions-override.js')
    ),
    
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Utilities\/PixelRatio/,
      'react-native-web/dist/exports/PixelRatio'
    ),
    
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Utilities\/Platform/,
      'react-native-web/dist/exports/Platform'
    ),
    
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/StyleSheet\/StyleSheet/,
      'react-native-web/dist/exports/StyleSheet'
    ),
    
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/TurboModule\/TurboModuleRegistry/,
      path.resolve(__dirname, 'src/shims/empty.js')
    ),
  ],
};
