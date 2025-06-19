const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const appJson = require('./app.json');

const appName = appJson.name;
const isDev = process.env.NODE_ENV !== 'production';
const webPort = process.env.WEB_PORT || 19006;

// Base webpack configuration
module.exports = {
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
  stats: 'minimal',
  infrastructureLogging: {
    level: 'error',
  },
  entry: {
    app: [
      // Load jQuery first to avoid conflicts
      'jquery',
      // Then load core-js polyfills
      'core-js/stable',
      'regenerator-runtime/runtime',
      // Then webpack dev server
      'webpack/hot/dev-server',
      `webpack-dev-server/client?http://localhost:${process.env.WEB_PORT || 19006}`,
      // Then our app
      './browser.js',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
    globalObject: 'this',
  },
  // Remove jQuery from externals to let webpack handle it
  externals: {
    // Add core-js to prevent conflicts
    'core-js/stable': 'core-js/stable',
    'regenerator-runtime/runtime': 'regenerator-runtime/runtime'
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
      '.mjs'
    ],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Renderer/shims/ReactNativePropRegistry': 'react-native-web/dist/modules/ReactNativePropRegistry',
      'react-native/Libraries/Components/View/ReactNativeStyleAttributes': 'react-native-web/dist/exports/StyleSheet/compiler/react-native-web',
      'react-native-web': path.resolve(__dirname, 'node_modules/react-native-web'),
      'react-native-svg': 'react-native-svg-web',
      'react-native-reanimated': path.resolve(
        __dirname,
        'node_modules/react-native-reanimated/mock'
      ),
      'expo-sqlite': path.resolve(__dirname, 'src/shims/expo-sqlite.js'),
      'color': path.resolve(__dirname, 'src/shims/color.js'),
      'stream': require.resolve('stream-browserify'),
      'crypto': require.resolve('crypto-browserify'),
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'os': require.resolve('os-browserify/browser'),
      'url': require.resolve('url/'),
      'assert': require.resolve('assert/'),
      'buffer': require.resolve('buffer/'),
      'process': require.resolve('process/browser'),
      'vm': require.resolve('vm-browserify'),
      '@react-native-async-storage/async-storage': path.resolve(
        __dirname,
        'src/shims/async-storage.js'
      ),
      '@expo/vector-icons': path.resolve(
        __dirname,
        'node_modules/@expo/vector-icons'
      ),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      url: require.resolve('url/'),
      zlib: require.resolve('browserify-zlib'),
      path: require.resolve('path-browserify'),
      fs: false,
      'normalize-css-color': require.resolve('normalize-css-color'),
      'jquery': require.resolve('jquery')
    }
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules\/(?!(@react-native|react-native|@react-navigation|@react-native-community|@react-native-masked-view|@react-native-picker|@react-navigation\/).*))/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              presets: [
                ['@babel/preset-env', { 
                  modules: false,
                  targets: {
                    esmodules: true
                  }
                }],
                '@babel/preset-react',
                '@babel/preset-typescript',
                'module:metro-react-native-babel-preset'
              ],
              plugins: [
                ['@babel/plugin-proposal-class-properties', { loose: true }],
                ['@babel/plugin-proposal-private-methods', { loose: true }],
                ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
                ['@babel/plugin-transform-runtime', { 
                  helpers: true,
                  regenerator: true,
                  useESModules: true,
                  absoluteRuntime: false
                }],
                ['module-resolver', {
                  root: ['./'],
                  extensions: ['.js', '.jsx', '.ts', '.tsx', '.web.js', '.web.jsx', '.web.ts', '.web.tsx'],
                  alias: {
                    '^react-native$': 'react-native-web',
                    'react-native-svg': 'react-native-svg-web',
                    '^@react-native/(.+)': 'react-native-web/dist/\\1',
                    '^@react-navigation/(.+)': '@react-navigation/\\1',
                    'react-native-web/dist/normalize-colors': 'normalize-css-color'
                  }
                }],
                'transform-inline-environment-variables',
                'react-native-reanimated/plugin'
              ]
            }
          }
        ]
      },
      // Handle SVG files
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              native: true
            }
          }
        ]
      },
      // Handle other assets
      {
        test: /\.(jpg|jpeg|png|gif|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/media/[name].[hash:8][ext]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|otf)$/i,
        type: 'asset/resource'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
      React: 'react',
      // Provide jQuery but don't use $ to avoid conflicts
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(isDev),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.__WEBPACK_ENV_NODE_DEBUG__': JSON.stringify('false'),
      'process.platform': JSON.stringify('web'),
      'process.env.EXPO_DEBUG': JSON.stringify(process.env.EXPO_DEBUG || '1'),
      'process.env.EXPO_DEV_SERVER_ORIGIN': JSON.stringify(`http://localhost:${webPort}`),
      'global.__DEV__': JSON.stringify(isDev)
    }),
    new HtmlWebpackPlugin({
      template: './web/index.html',
      filename: 'index.html',
      inject: true
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
      publicPath: '/'
    },
    compress: true,
    port: webPort,
    host: '0.0.0.0', // Bind to all available network interfaces
    hot: true,
    historyApiFallback: true,
    client: {
      logging: 'error',
      overlay: {
        errors: true,
        warnings: false
      },
      progress: true
    },
    devMiddleware: {
      stats: 'minimal'
    },
    open: false, // We'll open the browser manually to avoid issues
    watchFiles: {
      paths: ['src/**/*', 'app/**/*'],
      options: {
        ignored: /node_modules/
      }
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    allowedHosts: 'all'
  },

  node: {
    __dirname: false,
    __filename: false,
    global: true
  },
  performance: {
    hints: false
  }
};
