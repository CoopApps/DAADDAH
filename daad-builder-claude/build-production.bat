@echo off
echo ========================================
echo DAAD Builder - Production Build
echo ========================================
echo.

REM Set up custom paths for Rust and Node.js
set RUSTUP_HOME=D:\.rustup
set CARGO_HOME=D:\.cargo
set PATH=D:\nodejs;D:\.cargo\bin;%PATH%
set NODE=D:\nodejs\node.exe
set NPM=D:\nodejs\npm.cmd
set CARGO=D:\.cargo\bin\cargo.exe

REM Use D:\temp for cargo build artifacts (faster, more space)
set CARGO_TARGET_DIR=D:\temp\cargo-target
set TMPDIR=D:\temp
set TEMP=D:\temp
set TMP=D:\temp

echo Creating temp directories...
if not exist "D:\temp" mkdir "D:\temp"
if not exist "D:\temp\cargo-target" mkdir "D:\temp\cargo-target"
echo.

echo [1/4] Checking tools...
%NODE% --version
%CARGO% --version
echo.

echo [2/4] Installing dependencies...
%NPM% install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo.

echo [3/4] Building for production...
echo This may take 5-10 minutes on first build...
echo.
%NPM% run tauri:build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo.

echo [4/4] Build complete!
echo.
echo Executable location:
echo   src-tauri\target\release\daad-builder.exe
echo.
echo You can now:
echo   1. Run the exe directly
echo   2. The MCP server will work with it
echo   3. Distribute the exe to others
echo.

pause
