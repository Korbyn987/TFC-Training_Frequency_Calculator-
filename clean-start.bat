@echo off
setlocal enabledelayedexpansion

echo Stopping any running Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Clearing temporary files...
if exist node_modules\.cache rmdir /s /q node_modules\.cache
if exist dist rmdir /s /q dist

set NODE_ENV=development
set WEB_PORT=3005
set EXPO_DEBUG=1

echo Starting development server...
call npx webpack serve --config webpack.config.web.js --mode development
