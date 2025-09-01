@echo off
echo Force cleaning Android build directory...

echo.
echo Step 1: Killing ALL processes that might lock Android directory...
taskkill /f /im "node.exe" 2>nul
taskkill /f /im "java.exe" 2>nul
taskkill /f /im "gradle.exe" 2>nul
taskkill /f /im "adb.exe" 2>nul
taskkill /f /im "qemu-system-x86_64.exe" 2>nul
taskkill /f /im "emulator.exe" 2>nul

echo.
echo Step 2: Restarting Windows Explorer to release file locks...
taskkill /f /im "explorer.exe" 2>nul
start explorer.exe

echo.
echo Step 3: Waiting longer for processes to terminate...
timeout /t 10 /nobreak >nul

echo.
echo Step 4: Force removing Android directory with multiple attempts...
for /L %%i in (1,1,3) do (
    if exist "android" (
        echo Attempt %%i: Removing Android directory...
        rmdir /s /q "android" 2>nul
        timeout /t 2 /nobreak >nul
    )
)

if exist "android" (
    echo Android directory still exists. Manual intervention may be required.
) else (
    echo Android directory successfully removed.
)

echo.
echo Step 5: Rebuilding Android project...
npx expo run:android

pause
