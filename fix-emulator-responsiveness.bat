@echo off
echo ========================================
echo TFC Emulator Responsiveness Fix
echo ========================================

echo Step 1: Killing existing emulator processes...
taskkill /f /im qemu-system-x86_64.exe >nul 2>&1
taskkill /f /im emulator.exe >nul 2>&1

echo.
echo Step 2: Starting emulator with optimized settings...
set "ANDROID_HOME=C:\Users\adamh\AppData\Local\Android\Sdk"
set "PATH=%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%"

echo Starting Pixel_9_API_36 with performance optimizations...
start "Android Emulator" "%ANDROID_HOME%\emulator\emulator" -avd Pixel_9_API_36 -gpu swiftshader_indirect -no-snapshot-load -wipe-data -memory 4096 -cores 4

echo.
echo Step 3: Waiting for emulator to boot...
timeout /t 30 /nobreak

echo.
echo Step 4: Testing emulator responsiveness...
adb wait-for-device
adb shell input keyevent KEYCODE_HOME
adb shell input keyevent KEYCODE_BACK

echo.
echo Step 5: Installing Expo Go...
echo Downloading Expo Go APK...
curl -L -o expo-go.apk "https://d1ahtucjixef4r.cloudfront.net/exponent-2.31.5.apk"
adb install -r expo-go.apk

echo.
echo ========================================
echo Emulator Fix Complete!
echo ========================================
echo.
echo The emulator should now be responsive.
echo Try: npx expo start --clear --android
echo ========================================
pause
