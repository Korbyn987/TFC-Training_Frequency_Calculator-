module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
      '@babel/preset-typescript',
      ['module:metro-react-native-babel-preset', { 
        useTransformReactJSXExperimental: true 
      }],
      ['@babel/preset-env', { 
        useBuiltIns: 'usage',
        corejs: '3.8.3',
        targets: {
          chrome: '58',
          ie: '11',
          esmodules: true
        }
      }],
    ],
    plugins: [
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      ['@babel/plugin-transform-private-methods', { loose: true }],
      ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ['@babel/plugin-proposal-export-namespace-from'],
      'react-native-web',
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-runtime', {
        corejs: 3,
        helpers: true,
        regenerator: true,
        useESModules: true,
        absoluteRuntime: false
      }],
      ['module-resolver', {
        root: ['./'],
        extensions: [
          '.js',
          '.jsx',
          '.ts',
          '.tsx',
          '.web.js',
          '.web.jsx',
          '.web.ts',
          '.web.tsx'
        ],
        alias: {
          '^react-native$': 'react-native-web',
          '^@expo/vector-icons': '@expo/vector-icons',
          'react-native-svg': 'react-native-svg-web',
          '^@react-native/(.+)': 'react-native-web/dist/\\1',
          '^@react-navigation/(.+)': '@react-navigation/\\1',
        },
      }],
      'transform-inline-environment-variables',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
