# DAAD Builder - Claude Integration Setup

Quick setup guide for getting started with the Claude-integrated DAAD Builder.

## Prerequisites

- Node.js installed (v18 or later)
- Claude Desktop installed (for MCP integration)
- Claude Code CLI installed (for CLI integration)
- Git Bash or similar terminal (Windows)

## Setup Steps

### 1. Install MCP Server Dependencies

```bash
cd D:/projects/daadah/daad-builder-claude/mcp-server
npm install
```

Expected output: "added 91 packages" and "found 0 vulnerabilities"

### 2. Install Main Project Dependencies

```bash
cd D:/projects/daadah/daad-builder-claude
npm install
```

This installs the DAAD Builder UI dependencies.

### 3. Configure Claude Desktop (Optional but Recommended)

**Option A: Copy the example config**

1. Copy the contents of `claude_desktop_config.example.json`
2. Locate your Claude Desktop config:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`
3. If the file exists, add the `daad-builder` entry to the `mcpServers` object
4. If it doesn't exist, create it with the example contents
5. **Important**: Update the paths to match your installation directory

**Option B: Use command line (Windows)**

```powershell
# Create config directory if needed
mkdir $env:APPDATA\Claude -ErrorAction SilentlyContinue

# Copy example config (adjust source path as needed)
copy D:\projects\daadah\daad-builder-claude\claude_desktop_config.example.json $env:APPDATA\Claude\claude_desktop_config.json
```

**Note**: If you already have other MCP servers configured, manually merge the configurations.

### 4. Restart Claude Desktop

Close Claude Desktop completely and reopen it to load the MCP server.

### 5. Verify MCP Connection

In Claude Desktop, ask:
```
What DAAD Builder tools do you have available?
```

You should see a list of tools like create_location, create_object, etc.

### 6. Test Claude Code CLI Integration

```bash
cd D:/projects/daadah/daad-builder-claude
claude-code
```

In the Claude Code session, try:
```
/new-location
```

Claude should respond with prompts to create a new location.

---

## Verification Checklist

- [ ] Node.js is installed (`node --version`)
- [ ] MCP server dependencies installed (check `mcp-server/node_modules/` exists)
- [ ] Main project dependencies installed (check `node_modules/` exists)
- [ ] Claude Desktop config updated with correct paths
- [ ] Claude Desktop restarted
- [ ] MCP tools visible in Claude Desktop
- [ ] Claude Code CLI can access slash commands
- [ ] `.claude/commands/` directory contains .md files

---

## Quick Test

### Test 1: Claude Desktop

In Claude Desktop:
```
Create a location called "Test Room" with description "This is a test location."
```

Expected: Success message with location ID.

Check the file: `D:/projects/daadah/daad-builder-claude/current_project.json` should now exist with your location.

### Test 2: Claude Code CLI

In Claude Code:
```
/analyze-game
```

Expected: Analysis of your current project (including the test room from Test 1 if you ran it).

---

## Common Issues and Solutions

### Issue: MCP server not showing in Claude Desktop

**Solution:**
1. Check the config file syntax with a JSON validator
2. Ensure paths are absolute, not relative
3. Check Claude Desktop logs: `%APPDATA%\Claude\logs\mcp*.log`
4. Verify Node.js is in your PATH: `node --version`

### Issue: "Cannot find module" error

**Solution:**
```bash
cd D:/projects/daadah/daad-builder-claude/mcp-server
npm install
```

### Issue: Slash commands not working in Claude Code

**Solution:**
1. Make sure you're in the `daad-builder-claude` directory
2. Check `.claude/commands/` directory exists and has .md files
3. Try with a full restart of Claude Code

### Issue: Permission denied errors

**Solution:**
1. Check `.claude/settings.local.json` has the necessary permissions
2. Run your terminal as administrator (Windows)
3. Check file/directory permissions

---

## Next Steps

Once everything is verified:

1. **Read the integration guide**: `CLAUDE_INTEGRATION.md`
2. **Create your first game**: Use Claude Desktop or Claude Code CLI
3. **Explore the examples**: Try different workflows
4. **Read the DAAD manual**: Learn DAAD concepts and features

---

## File Locations Reference

| File | Purpose | Location |
|------|---------|----------|
| MCP Server | Claude Desktop integration | `mcp-server/index.js` |
| MCP Config Example | Sample config for Claude Desktop | `claude_desktop_config.example.json` |
| Slash Commands | Claude Code CLI commands | `.claude/commands/*.md` |
| Settings | Claude Code permissions | `.claude/settings.local.json` |
| Project File | Default game project | `current_project.json` |
| Integration Guide | Full usage documentation | `CLAUDE_INTEGRATION.md` |
| This File | Setup instructions | `SETUP.md` |

---

## Getting Help

If you encounter issues:

1. Check the troubleshooting sections in `CLAUDE_INTEGRATION.md`
2. Verify all prerequisites are installed
3. Check the logs in Claude Desktop's log directory
4. Try the manual test steps above to isolate the problem

## Ready?

You're all set! Start building your DAAD text adventure game with Claude. 🎮

Try this in Claude Desktop to begin:
```
I want to create a mystery adventure game set in a Victorian mansion. Help me create the first few locations.
```

Or in Claude Code CLI:
```
/new-location
```

Happy adventuring!
