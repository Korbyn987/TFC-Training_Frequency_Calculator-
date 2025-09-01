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
echo Step 7: Build and install TFC app directly (bypass Expo Go)...
echo This will create a standalone APK and install it on emulator...
echo Setting environment for active emulator...
for /f "tokens=1" %%i in ('adb devices ^| findstr "device$"') do (
    set "ANDROID_SERIAL=%%i"
    echo Found active emulator: %%i
)

if defined ANDROID_SERIAL (
    echo.
    echo Building TFC app as standalone Android APK...
    echo This may take 2-3 minutes for first build...
    echo.
    npx expo run:android 
) else (
    echo No active emulator found. Cannot build app.
    echo Please ensure emulator is running and try again.
)

pause
