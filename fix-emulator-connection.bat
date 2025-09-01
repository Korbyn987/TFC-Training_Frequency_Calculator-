@echo off
echo Fixing TFC emulator connection...

echo.
echo Step 1: Killing offline emulator-5554...
adb -s emulator-5554 emu kill 2>nul

echo.
echo Step 2: Verifying active emulator...
adb devices

echo.
echo Step 3: Starting TFC app on emulator-5556...
set "ANDROID_SERIAL=emulator-5556"
npx expo start --android --clear

echo.
echo TFC app should now connect to the active emulator (emulator-5556)

