@echo off
echo ========================================
echo DAAD Builder - Environment Setup
echo ========================================
echo.

REM Set environment variables for this session
set RUSTUP_HOME=D:\.rustup
set CARGO_HOME=D:\.cargo
set PATH=D:\nodejs;D:\.cargo\bin;%PATH%

echo Environment configured:
echo   Node.js: D:\nodejs
echo   Cargo:   D:\.cargo\bin
echo   Rustup:  D:\.rustup
echo.

echo Verifying tools...
echo.

echo Node.js:
D:\nodejs\node.exe --version
if %errorlevel% neq 0 (
    echo   ❌ Not found at D:\nodejs
    echo.
    echo Please check Node.js installation location.
    pause
    exit /b 1
) else (
    echo   ✅ Found
)
echo.

echo npm:
D:\nodejs\npm.cmd --version
if %errorlevel% neq 0 (
    echo   ❌ Not found
    pause
    exit /b 1
) else (
    echo   ✅ Found
)
echo.

echo Cargo:
D:\.cargo\bin\cargo.exe --version
if %errorlevel% neq 0 (
    echo   ❌ Not found at D:\.cargo\bin
    echo.
    echo Please check Rust installation location.
    pause
    exit /b 1
) else (
    echo   ✅ Found
)
echo.

echo ========================================
echo ✅ All tools verified!
echo ========================================
echo.
echo Environment is ready for this session.
echo.
echo You can now run:
echo   - npm install
echo   - cargo build
echo   - npm run tauri:dev
echo.

REM Keep the window open with environment set
cmd /k
