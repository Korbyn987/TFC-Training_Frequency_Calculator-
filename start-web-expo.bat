@echo off
echo Starting Development Server...

:: Kill any processes using ports 19000 and 3006
for /f "tokens=5" %%a in ('netstat -aon ^| find ":19000" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3006" ^| find "LISTENING"') do taskkill /F /PID %%a >nul 2>&1

:: Set environment variables
set NODE_ENV=development
set PORT=3006

:: Start Development Server
start "Development Server" cmd /k "npm run start-web"

echo.
echo Development server starting...
echo Web application should be running at http://localhost:3006
echo.
echo If you encounter any issues:
echo 1. Check the terminal window for errors
echo 2. Try refreshing the browser after a few seconds
echo 3. Ensure no other applications are using port 3006
echo.
echo Press Ctrl+C in the terminal window to stop the server
echo Press any key to close all windows...
pause >nul

:: Kill the server when the user presses a key
taskkill /FI "WINDOWTITLE eq Development Server" /F >nul 2>&1
