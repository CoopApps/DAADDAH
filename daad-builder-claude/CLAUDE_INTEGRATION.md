# DAAD Builder - Claude Integration Guide

This directory contains a fully Claude-integrated version of the DAAD Builder with support for both **Claude Desktop** (via MCP server) and **Claude Code CLI** (via custom commands).

## Overview

This integration provides two ways to work with Claude on DAAD games:

### 1. Claude Desktop Integration (MCP Server)
Use natural language in Claude Desktop to create and modify DAAD games. The MCP server provides tools that let Claude directly manipulate game files.

### 2. Claude Code CLI Integration
Use custom slash commands in Claude Code CLI for rapid game development with enhanced IDE-like features.

---

## Quick Start

### Option 1: Claude Desktop Only

If you only want to use Claude Desktop:

1. Navigate to `mcp-server/` directory
2. Follow the instructions in `mcp-server/README.md`
3. Add the server to your Claude Desktop config
4. Restart Claude Desktop

### Option 2: Claude Code CLI Only

If you only want to use Claude Code CLI:

1. Open this directory in Claude Code CLI:
   ```bash
   cd D:/projects/daadah/daad-builder-claude
   claude-code
   ```

2. Use the available slash commands:
   - `/new-location` - Create a new game location
   - `/new-object` - Create a new game object
   - `/add-rule` - Add game logic rules
   - `/analyze-game` - Analyze your game structure
   - `/test-game` - Run and test your game

### Option 3: Both (Recommended)

Use both for maximum productivity:

1. Set up Claude Desktop for conversational game design
2. Use Claude Code CLI for detailed implementation and testing
3. Switch between them as needed - they work with the same project files

---

## Setting Up Claude Desktop Integration

### Step 1: Locate your Claude Desktop config

Find your configuration file:

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Step 2: Add the MCP server

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "daad-builder": {
      "command": "node",
      "args": [
        "D:/projects/daadah/daad-builder-claude/mcp-server/index.js"
      ],
      "env": {
        "DAAD_PROJECT_PATH": "D:/projects/daadah/daad-builder-claude/current_project.json"
      }
    }
  }
}
```

**Important**: Change the paths to match your actual installation directory!

If you already have other MCP servers, just add the `daad-builder` entry to your existing `mcpServers` object.

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop to load the MCP server.

### Step 4: Verify connection

In Claude Desktop, you should see the DAAD Builder tools available. Try asking:

```
What tools do you have available for DAAD games?
```

---

## Using Claude Desktop for Game Creation

Once the MCP server is connected, you can use natural language to build games:

### Creating Locations

```
Create a location called "Ancient Library" with the description "Towering bookshelves line the walls of this dusty library. The smell of old parchment fills the air."
```

### Creating Objects

```
Create a book object called "mysterious tome" with description "A leather-bound book with strange symbols on the cover." The noun is "tome" and adjective is "mysterious". Put it in location 0.
```

### Adding Connections

```
Connect the library (location 0) to the corridor (location 1) going east
```

### Adding Game Rules

```
When the player examines the tome, show the message "The symbols seem to shift and move before your eyes."
```

### Querying the Game

```
Show me all locations
List all the objects
What's the current game info?
```

---

## Using Claude Code CLI

### Available Slash Commands

The `.claude/commands/` directory contains these custom commands:

#### `/new-location`
Creates a new location with interactive prompts for all details.

```
/new-location
```

Claude will ask you for the location name, description, position, and connections.

#### `/new-object`
Creates a new object with vocabulary and properties.

```
/new-object
```

Claude will guide you through creating the object with all necessary attributes.

#### `/add-rule`
Adds game logic rules with proper DAAD syntax.

```
/add-rule
```

Claude will help you define conditions and actions for the rule.

#### `/analyze-game`
Provides a comprehensive analysis of your current game.

```
/analyze-game
```

Get insights on game structure, potential issues, and suggestions.

#### `/test-game`
Launches the DAAD builder and helps you test your game.

```
/test-game
```

Starts the Tauri dev server and provides testing guidance.

### Regular Claude Code Features

All standard Claude Code features work:
- File editing and refactoring
- Code search and navigation
- Git integration
- Terminal commands
- And more!

---

## Project Structure

```
daad-builder-claude/
├── .claude/
│   ├── commands/           # Custom slash commands
│   │   ├── new-location.md
│   │   ├── new-object.md
│   │   ├── add-rule.md
│   │   ├── analyze-game.md
│   │   └── test-game.md
│   └── settings.local.json # Claude Code permissions
│
├── mcp-server/             # MCP server for Claude Desktop
│   ├── index.js           # Server implementation
│   ├── package.json       # Dependencies
│   └── README.md          # MCP-specific docs
│
├── src/                    # DAAD Builder UI source
├── src-tauri/             # Tauri backend
│
├── current_project.json   # Default project file (created on first use)
│
└── CLAUDE_INTEGRATION.md  # This file
```

---

## Workflow Examples

### Example 1: Quick Prototyping

1. **Claude Desktop**: "Create a simple 3-room dungeon with a key and a locked door"
2. Claude creates locations, objects, connections, and rules
3. **Claude Code CLI**: `/analyze-game` to review the structure
4. **Claude Code CLI**: `/test-game` to play through it
5. **Claude Desktop**: "The door is too easy to open, add more puzzles"

### Example 2: Detailed Implementation

1. **Claude Code CLI**: `/new-location` to create a complex location with specific properties
2. **Claude Code CLI**: Edit the JSON directly for fine-tuning
3. **Claude Desktop**: "Add 5 objects that would fit in this medieval armory"
4. **Claude Code CLI**: `/add-rule` for specific game mechanics
5. **Claude Desktop**: "Make the game harder by adding more conditions to the rules"

### Example 3: Collaborative Design

1. **Claude Desktop**: Discuss game design and narrative
2. Claude creates the basic structure via MCP
3. **Claude Code CLI**: Open the UI with `/test-game`
4. Make visual adjustments in the DAAD Builder UI
5. **Claude Desktop**: "I changed the map, add appropriate descriptions"
6. Claude updates descriptions based on the new layout

---

## Tips and Best Practices

### When to Use Claude Desktop
- Initial game design and brainstorming
- Creating multiple elements at once
- Natural language game logic ("when player enters dark room without light...")
- Quick iterations and experiments
- Learning DAAD concepts

### When to Use Claude Code CLI
- Detailed implementation work
- Testing and debugging
- File management and organization
- Visual map editing (via UI)
- Performance optimization
- Git workflow and version control

### Working with Both
- Use the same project file (current_project.json) for both
- Changes made in either interface are immediately visible to the other
- Claude Desktop for design, Claude Code for implementation
- Commit your changes regularly with git

---

## Troubleshooting

### MCP Server Issues

**Server not connecting:**
1. Check Node.js is installed: `node --version`
2. Verify paths in claude_desktop_config.json are absolute and correct
3. Check Claude Desktop logs in %APPDATA%\Claude\logs
4. Try running the server manually: `node mcp-server/index.js`

**Tools not appearing:**
1. Restart Claude Desktop completely
2. Check the config JSON syntax is valid
3. Ensure npm install was run in mcp-server/

### Claude Code CLI Issues

**Slash commands not working:**
1. Make sure you're in the daad-builder-claude directory
2. Check .claude/commands/ contains the .md files
3. Try running `claude-code` from a fresh terminal

**Permissions errors:**
1. Check .claude/settings.local.json has proper permissions
2. The file should allow necessary npm, node, and cargo commands

### General Issues

**Project file not found:**
- Create an empty current_project.json or let the MCP server create it
- Set DAAD_PROJECT_PATH to your desired project file

**Changes not syncing:**
- Both tools work with the same file, but you need to reload manually
- In Claude Desktop, reference the resource: `daad://current-project`
- In Claude Code, just read the file again

---

## Advanced Configuration

### Using Multiple Project Files

You can work with multiple games by:

1. **In Claude Desktop:**
   ```
   Set the project path to D:/my-games/adventure1.json
   ```

2. **In Claude Code:**
   Just edit any JSON file - Claude can work with any DAAD project file

### Environment Variables

Set these in your shell or Claude Desktop config:

- `DAAD_PROJECT_PATH` - Default project file location
- `NODE_ENV` - Set to 'development' for verbose MCP logging

### Custom Slash Commands

Add your own commands to `.claude/commands/`:

1. Create a new `.md` file
2. Add a description in YAML frontmatter
3. Write the prompt for Claude
4. Use it with `/your-command-name`

Example: `.claude/commands/quick-test.md`
```markdown
---
description: Quickly test the current room
---

Load the current project, find the most recently modified location, and create a simple test scenario for it.
```

---

## Next Steps

1. **Set up your preferred integration** (Desktop, CLI, or both)
2. **Create your first location** to test the setup
3. **Explore the example commands** to learn the workflow
4. **Read the DAAD documentation** in the main directory
5. **Start building your adventure!**

## Resources

- [DAAD Builder Manual](DAAD_BUILDER_MANUAL.md) - Full DAAD system documentation
- [MCP Server README](mcp-server/README.md) - Detailed MCP setup
- [Model Context Protocol Docs](https://modelcontextprotocol.io) - Learn about MCP
- [Claude Code Docs](https://docs.anthropic.com/claude-code) - Claude CLI features

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the example workflows
- Experiment with simple commands first
- Read the MCP server logs for debugging

Happy game building! 🎮
