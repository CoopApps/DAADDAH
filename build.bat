@echo off
REM Build script for DAADDAH (Windows)

echo ═══════════════════════════════════════════
echo   DAADDAH Build Script
echo ═══════════════════════════════════════════
echo.

REM Build the Builder
echo 📦 Building DAAD Builder...
cd daad-bevy-builder
cargo build --release
if %ERRORLEVEL% EQU 0 (
    echo ✅ Builder compiled successfully!
    echo    Location: daad-bevy-builder\target\release\daad-bevy-builder.exe
) else (
    echo ❌ Builder compilation failed!
    exit /b 1
)
echo.

REM Build the Player
echo 🎮 Building DAAD Player...
cd ..\daad-player
cargo build --release
if %ERRORLEVEL% EQU 0 (
    echo ✅ Player compiled successfully!
    echo    Location: daad-player\target\release\daad-player.exe
) else (
    echo ❌ Player compilation failed!
    exit /b 1
)
echo.

REM Create distribution directory
echo 📁 Creating distribution directory...
cd ..
if not exist dist mkdir dist
copy daad-bevy-builder\target\release\daad-bevy-builder.exe dist\
copy daad-player\target\release\daad-player.exe dist\
echo ✅ Executables copied to dist\ directory
echo.

echo ═══════════════════════════════════════════
echo   Build Complete!
echo ═══════════════════════════════════════════
echo.
echo Run the builder:
echo   dist\daad-bevy-builder.exe
echo.
echo Run a game with the player:
echo   dist\daad-player.exe mygame.json
echo.
pause
