@echo off
echo Restarting emulator to fix reload issues...

REM Kill current emulator
adb emu kill
timeout /t 3 /nobreak >nul

REM Start fresh emulator
echo Starting fresh emulator...
start "" "%ANDROID_HOME%\emulator\emulator" -avd Pixel_9_API_36 -no-snapshot-load

REM Wait for emulator to boot
echo Waiting for emulator to boot...
timeout /t 15 /nobreak >nul

REM Check if emulator is ready
:wait_for_device
adb devices | findstr "device" >nul
if errorlevel 1 (
    echo Waiting for emulator...
    timeout /t 2 /nobreak >nul
    goto wait_for_device
)

echo Emulator ready! You can now run npm run start:dev
pause
