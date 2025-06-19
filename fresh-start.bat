@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo   TFC - Training Frequency Calculator
echo   Fresh Start Script
echo ==============================================
echo.

:: Stop any running processes
echo [1/6] Stopping any running processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Metro*" >nul 2>&1

:: Clean up directories
echo [2/6] Cleaning up directories...
if exist node_modules (
    echo   - Removing node_modules...
    rmdir /s /q node_modules
)

if exist web-build (
    echo   - Removing web-build...
    rmdir /s /q web-build
)

if exist .expo (
    echo   - Removing .expo directory...
    rmdir /s /q .expo
)

:: Clean npm cache
echo [3/6] Cleaning npm cache...
call npm cache clean --force >nul 2>&1

:: Install dependencies
echo [4/6] Installing dependencies...
call npm install --legacy-peer-deps
if !ERRORLEVEL! NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b !ERRORLEVEL!
)

:: Install web dependencies
echo [5/6] Installing web dependencies...
call npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin clean-webpack-plugin file-loader babel-loader @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript @babel/plugin-transform-runtime @babel/plugin-proposal-class-properties @babel/plugin-proposal-private-methods @babel/plugin-proposal-private-property-in-object --legacy-peer-deps
if !ERRORLEVEL! NEQ 0 (
    echo Error: Failed to install web dependencies
    pause
    exit /b !ERRORLEVEL!
)

:: Copy clean configuration files
echo [6/6] Setting up configuration...
if exist webpack.config.clean.js (
    copy /y webpack.config.clean.js webpack.config.js >nul
)
if exist browser.clean.js (
    copy /y browser.clean.js browser.js >nul
)
if exist web\index.clean.html (
    copy /y web\index.clean.html web\index.html >nul
)

echo.
echo ==============================================
echo   Setup complete!
echo   Run 'start-clean.bat' to start the development server.
echo ==============================================
echo.

pause
