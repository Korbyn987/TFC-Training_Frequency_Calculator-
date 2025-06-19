import { AppRegistry } from 'react-native';
import App from './src/App.web';
import appJson from './app.json';

// Get the app name from the default export
const appName = appJson.name;

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root')
});
