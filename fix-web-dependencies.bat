@echo off
echo Fixing React Native Web dependencies...

echo.
echo Step 1: Installing compatible react-native-web version...
npm install react-native-web@0.19.12

echo.
echo Step 2: Running expo install --fix to resolve dependency conflicts...
npx expo install --fix

echo.
echo Step 3: Clearing Metro cache and starting development server...
npx expo start --clear --reset-cache

echo.
echo Web dependency fix complete!
pause
