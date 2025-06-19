@echo off
setlocal enabledelayedexpansion

:: Set environment variables
set NODE_OPTIONS=--openssl-legacy-provider
set NODE_ENV=development
set EXPO_USE_STATIC=1
set EXPO_DEBUG=1
set PORT=19006
set WEB_PORT=19006
set BROWSER=none
set REACT_EDITOR=none

:: Install dependencies if needed
echo Checking dependencies...
npm list --depth=0 || (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if !ERRORLEVEL! NEQ 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        pause
        exit /b !ERRORLEVEL!
    )
)

:: Start Metro bundler in a separate window
echo Starting Metro bundler...
start "Metro Bundler" /B /MIN cmd /c "npx expo start --clear"

:: Wait a moment for Metro to start
timeout /t 5 /nobreak >nul

:: Start webpack dev server
echo Starting webpack dev server...
start "" http://localhost:%WEB_PORT%
call npx webpack serve --config webpack.config.web.js --mode development --port %WEB_PORT% --hot

if !ERRORLEVEL! NEQ 0 (
    echo Failed to start webpack dev server. Please check the error above.
    pause
    exit /b !ERRORLEVEL!
)

start "" /B /MIN cmd /c "npx webpack serve --config webpack.config.web.js --mode development --port %PORT% --hot --open"

echo ""
echo "Web application is running on http://localhost:%PORT%"
echo "Press any key to stop the servers..."
pause >nul

taskkill /F /IM node.exe >nul 2>&1
exit /b 0
