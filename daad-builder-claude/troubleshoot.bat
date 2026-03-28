@echo off
echo ========================================
echo DAAD Builder - Troubleshooting
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org
    goto :end
)
echo OK!
echo.

echo Checking MCP server installation...
if not exist "mcp-server\node_modules" (
    echo ERROR: MCP server dependencies not installed!
    echo Running npm install...
    cd mcp-server
    npm install
    cd ..
)
echo OK!
echo.

echo Testing MCP server...
cd mcp-server
node test-server.js
cd ..
echo.

echo Checking Claude Desktop config...
if exist "%APPDATA%\Claude\claude_desktop_config.json" (
    echo Config file exists at:
    echo %APPDATA%\Claude\claude_desktop_config.json
    echo.
    echo Contents:
    type "%APPDATA%\Claude\claude_desktop_config.json"
) else (
    echo ERROR: No config file found!
    echo Run setup-claude-desktop.bat first
)
echo.

echo Checking project structure...
if exist ".claude\commands" (
    echo Slash commands: OK
) else (
    echo ERROR: .claude\commands directory missing!
)
echo.

echo Checking for current project file...
if exist "current_project.json" (
    echo Project file exists
) else (
    echo Project file will be created on first use
)
echo.

:end
echo ========================================
echo Troubleshooting complete!
echo ========================================
echo.
echo If you still have issues:
echo 1. Check Claude Desktop logs in %APPDATA%\Claude\logs
echo 2. Make sure Claude Desktop is fully restarted
echo 3. Verify the paths in claude_desktop_config.json are correct
echo.
pause
