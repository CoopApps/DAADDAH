@echo off
echo ========================================
echo DAAD Builder - Integration Test
echo ========================================
echo.

echo [1/3] Checking if app is running...
curl -s http://localhost:3456/health >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: App is running! ✓
    echo.
    curl http://localhost:3456/health
    echo.
) else (
    echo FAILED: App is not running ✗
    echo.
    echo Please start the app first:
    echo   cd D:\projects\daadah\daad-builder-claude
    echo   npm run tauri:dev
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] Testing location creation...
curl -s -X POST http://localhost:3456/api/location ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Room\",\"description\":\"This is a test location created via HTTP API\",\"x\":0,\"y\":0}"
echo.
echo.

echo [3/3] Testing object creation...
curl -s -X POST http://localhost:3456/api/object ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"test key\",\"description\":\"A test key\",\"noun\":\"key\",\"adjective\":\"test\",\"location\":254,\"weight\":1}"
echo.
echo.

echo ========================================
echo Integration Test Complete!
echo ========================================
echo.
echo If you see success messages above, the integration is working!
echo.
echo Check the DAAD Builder app - you should see:
echo   - A "Test Room" location
echo   - A "test key" object
echo.
echo Now try it with Claude Desktop!
echo.
pause
