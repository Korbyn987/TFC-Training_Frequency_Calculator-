@echo off
setlocal enabledelayedexpansion

:: Set environment variables
set NODE_ENV=development
set NODE_OPTIONS=--openssl-legacy-provider
set PORT=3006

:: Kill any existing node processes on port 3006
taskkill /F /IM node.exe /FI "WINDOWTITLE eq webpack*" 2>nul

:: Install dependencies if needed
echo Checking dependencies...
npm list --depth=0
if %ERRORLEVEL% NEQ 0 (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install dependencies. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

:: Change to the directory where the script is located
cd /d "%~dp0"

:: Start the webpack dev server
echo Starting webpack development server on port %PORT%...
call npx webpack serve --config webpack.config.prod.js --mode development --port %PORT% --open

pause
