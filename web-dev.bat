@echo off
setlocal enabledelayedexpansion

:: Load environment variables from .env.web
echo Loading environment variables from .env.web...
for /F "usebackq tokens=*" %%a in (.env.web) do (
    echo Setting: %%a
    set "%%a"
)

:: Set additional environment variables
set NODE_OPTIONS=--openssl-legacy-provider
set PORT=19006
set BROWSER=none

:: Install dotenv to help with environment variables
call npm list dotenv --depth=0 >nul 2>&1 || (
    echo Installing dotenv...
    call npm install --save-dev dotenv
)

:: Check for webpack-dev-server
call npm list webpack-dev-server --depth=0 >nul 2>&1 || (
    echo Installing webpack-dev-server...
    call npm install --save-dev webpack-dev-server
)

echo Starting web application in development mode...
echo Web server will be available at http://localhost:19006

:: Start the webpack dev server with our env variables
call npx webpack serve --config webpack.config.web.js --mode development --port 19006

if !ERRORLEVEL! NEQ 0 (
    echo Failed to start webpack dev server. Please check the error messages above.
    pause
    exit /b !ERRORLEVEL!
)

exit /b 0
