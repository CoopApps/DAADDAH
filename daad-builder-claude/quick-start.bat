@echo off
echo ========================================
echo DAAD Builder - Quick Start
echo ========================================
echo.

REM Set full paths
set RUSTUP_HOME=D:\.rustup
set CARGO_HOME=D:\.cargo
set NODE=D:\nodejs\node.exe
set NPM=D:\nodejs\npm.cmd
set CARGO=D:\.cargo\bin\cargo.exe

echo Verifying tools...
%NODE% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found at D:\nodejs
    echo.
    echo Please check your Node.js installation.
    pause
    exit /b 1
)

%CARGO% --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Cargo not found at D:\.cargo\bin
    echo.
    echo Please check your Rust installation.
    pause
    exit /b 1
)
echo ✅ Tools verified
echo.

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Dependencies not installed yet.
    echo Running install-dependencies.bat...
    echo.
    call install-dependencies.bat
    if %errorlevel% neq 0 (
        echo Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo Starting DAAD Builder...
echo.
echo ========================================
echo Watch for this message:
echo "🚀 DAAD Builder MCP API server starting on http://localhost:3456"
echo ========================================
echo.

REM Run Tauri dev server
set PATH=D:\nodejs;D:\.cargo\bin;%PATH%
%NPM% run tauri:dev

pause
