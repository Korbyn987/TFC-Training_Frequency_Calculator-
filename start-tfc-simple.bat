@echo off
echo Starting TFC Training Frequency Calculator...

echo.
echo Step 1: Installing required dependencies...
echo Installing react-native-gesture-handler (if not already present)...
npm install react-native-gesture-handler@~2.12.0

echo.
echo Step 2: Check emulator status...
adb devices

echo.
echo Step 3: Starting emulator if needed...
start /min "" "%ANDROID_HOME%\emulator\emulator" -avd Pixel_9_API_36 -netdelay none -netspeed full

echo.
echo Step 4: Wait for emulator to boot...
echo Waiting 15 seconds for emulator to start...
timeout /t 15 /nobreak >nul

echo.
echo Step 5: Check devices again...
adb devices

echo.
echo Step 6: Check if Expo Go is installed...
adb shell pm list packages | findstr host.exp.exponent
if %errorlevel% neq 0 (
    echo Expo Go not found. Installing...
    adb install "%ANDROID_HOME%\..\expo-go.apk" 2>nul || echo Could not install Expo Go automatically
)

echo.
echo Step 7: Clear any previous Metro cache
echo Clearing Metro cache...
npx expo start --clear --tunnel

echo.
echo App should now be running!
echo Use the Expo Go app on your phone to scan the QR code.
echo.
pause
