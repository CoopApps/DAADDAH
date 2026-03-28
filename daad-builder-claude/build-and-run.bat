@echo off
echo ========================================
echo DAAD Builder - Build and Run
echo ========================================
echo.

REM Set full paths
set RUSTUP_HOME=D:\.rustup
set CARGO_HOME=D:\.cargo
set PATH=D:\nodejs;D:\.cargo\bin;%PATH%
set NODE=D:\nodejs\node.exe
set NPM=D:\nodejs\npm.cmd
set CARGO=D:\.cargo\bin\cargo.exe

echo [1/5] Checking Node.js...
%NODE% --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found at D:\nodejs
    pause
    exit /b 1
)
echo.

echo [2/5] Checking Cargo/Rust...
%CARGO% --version
if %errorlevel% neq 0 (
    echo ERROR: Cargo not found at D:\.cargo\bin
    pause
    exit /b 1
)
echo.

echo [3/5] Installing npm dependencies...
%NPM% install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [4/5] Installing mcp-server dependencies...
cd mcp-server
%NPM% install
cd ..
echo.

echo [5/5] Starting DAAD Builder in dev mode...
echo.
echo ========================================
echo Watch for this message:
echo "🚀 DAAD Builder MCP API server starting on http://localhost:3456"
echo ========================================
echo.
echo Press Ctrl+C to stop the app when done.
echo.

%NPM% run tauri:dev

pause
