@echo off
echo ========================================
echo DAAD Builder - Claude Desktop Setup
echo ========================================
echo.

REM Create Claude config directory
echo Creating Claude config directory...
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM Check if config already exists
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    echo.
    echo WARNING: claude_desktop_config.json already exists!
    echo.
    echo Your existing config is at:
    echo %APPDATA%\Claude\claude_desktop_config.json
    echo.
    echo You need to manually add the DAAD Builder MCP server.
    echo.
    echo Add this to your "mcpServers" section:
    echo.
    type claude_desktop_config.example.json
    echo.
    echo Press any key to open the config directory...
    pause >nul
    explorer "%APPDATA%\Claude"
) else (
    echo Creating new config file...
    copy claude_desktop_config.example.json "%APPDATA%\Claude\claude_desktop_config.json"
    echo.
    echo SUCCESS! Config file created.
    echo.
    echo Press any key to open the config directory...
    pause >nul
    explorer "%APPDATA%\Claude"
)

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Close Claude Desktop if it's running
echo 2. Restart Claude Desktop
echo 3. Ask Claude: "What DAAD tools do you have?"
echo 4. You should see create_location, create_object, etc.
echo.
echo Ready to create games!
echo ========================================
pause
