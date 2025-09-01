@echo off
echo Testing TFC App on Multiple Platforms...

echo.
echo Step 1: Starting Expo development server...
start "Expo Server" cmd /k "npx expo start --clear"

echo.
echo Waiting 10 seconds for server to initialize...
timeout /t 10 /nobreak

echo.
echo Step 2: Testing Android platform...
echo Opening Android app in emulator...
start "Android Test" cmd /k "npx expo run:android"

echo.
echo Step 3: Testing Web platform...
echo Opening web app in browser...
timeout /t 5 /nobreak
start "Web Test" cmd /k "npx expo start --web"

echo.
echo Platform testing initiated!
echo - Expo server running in first window
echo - Android app launching in emulator
echo - Web app opening in browser
echo.
echo Check each platform for successful loading and functionality.
pause
