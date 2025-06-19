@echo off
setlocal

:: Set environment variables
set NODE_ENV=development
set NODE_OPTIONS=--openssl-legacy-provider
set PORT=3006

:: Kill any existing node processes on port 3006
taskkill /F /IM node.exe /FI "WINDOWTITLE eq webpack*" 2>nul

:: Change to the script directory
cd /d "%~dp0"

:: Start the webpack dev server
echo Starting webpack development server on port %PORT%...
"%ProgramFiles%\nodejs\node.exe" "%USERPROFILE%\AppData\Roaming\npm\node_modules\webpack\bin\webpack.js" serve --config webpack.config.prod.js --mode development --port %PORT% --open

pause
