@echo off
setlocal enabledelayedexpansion

echo ======================================================
echo TFC Web App Launcher with Dependency Fix
echo ======================================================

:: Set critical environment variables
set NODE_OPTIONS=--openssl-legacy-provider
set NODE_ENV=development
set EXPO_DEBUG=1
set EXPO_USE_STATIC=1
set EXPO_SKIP_NATIVE_MODULE_CHECKS=1
set PORT=19006
set BROWSER=none
set REACT_EDITOR=none

echo Fixing React dependency issues...

:: Force install React 18.2.0 which is required by React Native 0.72.10
call npm install --legacy-peer-deps react@18.2.0 react-dom@18.2.0

:: Install missing dependencies for web
echo Installing web dependencies...
call npm install --legacy-peer-deps webpack-dev-server@4.15.1 dotenv@16.3.1 normalize-css-color@1.0.2

:: Now start webpack directly (skipping Expo CLI)
echo Starting webpack dev server on port %PORT%...
echo Web application will be available at: http://localhost:%PORT%
echo ======================================================

:: Open the browser automatically
start "" http://localhost:%PORT%

:: Start webpack with a fixed configuration
call npx webpack serve --config webpack.config.js --mode development --port %PORT%

if !ERRORLEVEL! NEQ 0 (
    echo Failed to start webpack dev server.
    echo You may need to manually install dependencies with: npm install --legacy-peer-deps
    pause
    exit /b !ERRORLEVEL!
)

exit /b 0
