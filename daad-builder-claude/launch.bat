@echo off
echo DAAD Builder - Launcher
echo.
echo Setting up Node.js PATH...
set PATH=C:\Program Files\nodejs;%PATH%

echo Changing to project directory...
cd /d D:\projects\daadah\daad-builder-ui

echo.
echo Starting DAAD Builder...
echo The application window should open shortly.
echo.
echo Press Ctrl+C to stop the application.
echo.

npm run tauri dev

pause
