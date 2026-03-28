@echo off
echo ========================================
echo DAAD Builder - Install Dependencies
echo ========================================
echo.

REM Set PATH
set PATH=D:\nodejs;D:\.cargo\bin;%PATH%

echo [1/3] Installing main project dependencies...
D:\nodejs\npm.cmd install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✅ Done
echo.

echo [2/3] Installing MCP server dependencies...
cd mcp-server
D:\nodejs\npm.cmd install
if %errorlevel% neq 0 (
    echo ERROR: MCP server npm install failed!
    pause
    exit /b 1
)
cd ..
echo ✅ Done
echo.

echo [3/3] Verifying Rust installation...
D:\.cargo\bin\cargo.exe --version
if %errorlevel% neq 0 (
    echo ERROR: Cargo not found!
    pause
    exit /b 1
)
echo ✅ Done
echo.

echo ========================================
echo ✅ All dependencies installed!
echo ========================================
echo.
echo Next step: Run quick-start.bat
echo.
pause
