@echo off
echo ========================================
echo Fix React Native Web Dependencies
echo ========================================

echo Installing React Native Web with proper version...
npm install react-native-web@^0.19.12

echo Installing missing React Native Web dependencies...
npm install react-native-web-normalize-color
npm install react-native-web-asset-registry
npm install react-native-web-virtualized-list

echo Fixing Expo dependencies...
npx expo install --fix

echo Starting Expo with web support...
npx expo start --clear --android

pause
