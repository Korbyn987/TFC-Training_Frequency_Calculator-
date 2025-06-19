@echo off
setlocal

:: Set environment variables
set NODE_ENV=development
set WEB_PORT=19006
set BROWSER=none
set EXPO_DEBUG=true

:: Install dependencies if needed
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install --legacy-peer-deps
  if %ERRORLEVEL% NEQ 0 (
    echo Failed to install dependencies
    exit /b 1
  )
)

:: Start Metro bundler in a separate window
start "Metro Bundler" cmd /c "set NODE_ENV=development && npx react-native start --reset-cache"

:: Wait for Metro to start
timeout /t 5 /nobreak >nul

:: Start webpack dev server
echo Starting Webpack Dev Server...
call npx webpack serve --config webpack.config.clean.js --mode development --hot --color --progress

if %ERRORLEVEL% NEQ 0 (
  echo Failed to start Webpack Dev Server
  exit /b 1
)

endlocal
