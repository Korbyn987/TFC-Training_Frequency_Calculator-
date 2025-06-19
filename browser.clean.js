// Polyfills
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Import jQuery in noConflict mode
import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery.noConflict(true);

// Import React and ReactDOM
import { AppRegistry, Platform } from 'react-native';
import { name as appName } from './app.json';

// Import your main App component
import App from './App';

// Register the app
AppRegistry.registerComponent(appName, () => App);

// Mount the app for web
if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  AppRegistry.runApplication(appName, { rootTag });
}

// Error handling
window.addEventListener('error', (error) => {
  console.error('Uncaught error:', error);
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Development mode logging
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode');
}
