@echo off
echo Installing Expo Go on emulator...

echo Step 1: Check emulator connection
adb devices

echo.
echo Step 2: Install Expo Go APK
echo Downloading Expo Go...
curl -L -o expo-go.apk "https://d1ahtucjixef4r.cloudfront.net/exponent-2.31.5.apk"
adb install expo-go.apk

echo.
echo Step 3: Launch Expo Go
adb shell monkey -p host.exp.exponent -c android.intent.category.LAUNCHER 1

echo.
echo Done! Now run: npx expo start --clear --android
pause
