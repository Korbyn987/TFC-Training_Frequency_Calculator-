@echo off
echo Cleaning up previous builds...
if exist node_modules rmdir /s /q node_modules
if exist web-build rmdir /s /q web-build
if exist .expo rmdir /s /q .expo
if exist .cache rmdir /s /q .cache

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Failed to install dependencies. Please check your internet connection and try again.
    pause
    exit /b %errorlevel%
)

echo Installation complete! You can now run the app using 'npm run start-web'.
pause
