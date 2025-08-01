@echo off
setlocal enabledelayedexpansion

:: Set environment variables
set NODE_OPTIONS=--openssl-legacy-provider
set NODE_ENV=development
set EXPO_USE_STATIC=1
set EXPO_DEBUG=1
set PORT=19006
set BROWSER=none
set REACT_EDITOR=none

:: Install dependencies if needed
echo Checking dependencies...
npm list --depth=0 >nul 2>&1 || (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if !ERRORLEVEL! NEQ 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        pause
        exit /b !ERRORLEVEL!
    )
)

:: Skip Expo CLI to avoid bodyStream error
echo "Bypassing Expo CLI and starting webpack directly..."

:: Start webpack dev server
echo Starting webpack dev server on port %PORT%...
start "" http://localhost:%PORT%

:: Run webpack directly without Expo
call npx webpack serve --config webpack.config.web.js --mode development --port %PORT%

if !ERRORLEVEL! NEQ 0 (
    echo Failed to start webpack dev server. Please check the error above.
    pause
    exit /b !ERRORLEVEL!
)

echo "Web application is running on http://localhost:%PORT%"
echo "Press Ctrl+C to stop the server"

pause >nul
taskkill /F /IM node.exe >nul 2>&1
exit /b 0
