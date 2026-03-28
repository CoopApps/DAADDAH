# DAAD Builder - Claude Integrated Edition

A fully Claude-integrated DAAD (text adventure) game builder with support for both **Claude Desktop** and **Claude Code CLI**.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)

## What is This?

This is a complete DAAD game builder with deep Claude integration, allowing you to create text adventure games using natural language and AI-assisted development.

**Two Ways to Use Claude:**

1. **Claude Desktop (MCP Server)** - Talk to Claude in natural language to design and build games
2. **Claude Code CLI** - Use enhanced IDE features with custom slash commands for rapid development

Both methods work together seamlessly with the same project files.

## Quick Start

### 🚀 60-Second Setup

1. **Install dependencies:**
   ```bash
   cd D:/projects/daadah/daad-builder-claude/mcp-server
   npm install
   ```

2. **Configure Claude Desktop:**
   - Open `claude_desktop_config.example.json`
   - Copy its contents to your Claude Desktop config
   - Update the paths to match your installation
   - Restart Claude Desktop

3. **Verify setup:**
   ```bash
   cd D:/projects/daadah/daad-builder-claude/mcp-server
   node test-server.js
   ```

4. **Start creating:**
   - Open Claude Desktop and ask: "Create a location called 'Forest'"
   - OR use Claude Code CLI: `claude-code` then `/new-location`

### 📚 Detailed Setup

See **[SETUP.md](SETUP.md)** for comprehensive installation instructions.

## Features

### Claude Desktop Integration (MCP)

- **Natural language game creation** - Just describe what you want
- **Intelligent tools** - Create locations, objects, connections, and rules
- **Real-time validation** - Claude helps you avoid DAAD syntax errors
- **Conversational workflow** - Design games through dialogue

**Example usage:**
```
You: Create a mysterious forest location with a hidden path
Claude: *creates location with atmospheric description*

You: Add a rusty key hidden under a rock
Claude: *creates object with proper vocabulary and placement*

You: When the player examines the rock, reveal the key
Claude: *creates game rule with conditions and actions*
```

### Claude Code CLI Integration

- **Custom slash commands** - Quick access to common operations
- **Enhanced permissions** - Pre-configured for DAAD development
- **Full IDE features** - File editing, search, git integration
- **Testing helpers** - Launch and test your game easily

**Available commands:**
- `/new-location` - Create a new game location interactively
- `/new-object` - Create a new game object
- `/add-rule` - Add game logic rules
- `/analyze-game` - Get insights on your game structure
- `/test-game` - Launch and test your game

### DAAD Builder UI

The full graphical interface for visual game development:

- Visual map editor with drag-and-drop
- Object and location management
- Rule editor with autocomplete
- Real-time game preview
- Multi-platform export (Spectrum, Amstrad, C64, etc.)

## Project Structure

```
daad-builder-claude/
│
├── 📁 mcp-server/              MCP server for Claude Desktop
│   ├── index.js               Server implementation
│   ├── test-server.js         Setup verification
│   ├── package.json           Dependencies
│   └── README.md              MCP-specific docs
│
├── 📁 .claude/                 Claude Code CLI config
│   ├── commands/              Custom slash commands
│   │   ├── new-location.md    Create locations
│   │   ├── new-object.md      Create objects
│   │   ├── add-rule.md        Add game rules
│   │   ├── analyze-game.md    Analyze game structure
│   │   └── test-game.md       Test the game
│   └── settings.local.json    Permissions & settings
│
├── 📁 src/                     UI source code (React)
├── 📁 src-tauri/               Backend (Rust/Tauri)
│
├── 📄 CLAUDE_INTEGRATION.md    Complete integration guide
├── 📄 SETUP.md                 Setup instructions
├── 📄 README_CLAUDE.md         This file
├── 📄 claude_desktop_config.example.json  Sample config
│
└── 📄 current_project.json     Your game (created on first use)
```

## Documentation

| Document | Purpose |
|----------|---------|
| **[SETUP.md](SETUP.md)** | Step-by-step installation guide |
| **[CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)** | Complete usage guide for both integrations |
| **[mcp-server/README.md](mcp-server/README.md)** | MCP server details and troubleshooting |
| **[DAAD_BUILDER_MANUAL.md](DAAD_BUILDER_MANUAL.md)** | DAAD system reference |
| **[USER_MANUAL.md](USER_MANUAL.md)** | UI user guide |

## Example Workflows

### Workflow 1: Rapid Prototyping

```
Claude Desktop: "Create a 5-room haunted mansion with a ghost and three keys"
→ Claude creates the basic structure

Claude Code CLI: /analyze-game
→ Review and refine

Claude Desktop: "Add a puzzle where player must find all keys to unlock the exit"
→ Claude adds the game logic

Claude Code CLI: /test-game
→ Play and test
```

### Workflow 2: Detailed Design

```
Claude Code CLI: /new-location
→ Create a complex location with specific properties

UI: Open the visual editor and arrange the map

Claude Desktop: "Populate this castle armory with period-appropriate items"
→ Claude adds multiple thematic objects

Claude Code CLI: /add-rule
→ Add specific game mechanics
```

## Use Cases

**Perfect for:**
- 🎮 Game designers who want AI-assisted creation
- 📝 Writers who want to prototype interactive fiction
- 🎓 Learning text adventure game design
- 🔧 Developers who want rapid DAAD prototyping
- 🎨 Creating retro games for classic platforms

**Create games for:**
- ZX Spectrum
- Amstrad CPC
- Commodore 64
- MSX
- Modern web browsers

## Requirements

- **Node.js** 18 or later
- **Claude Desktop** (for MCP integration)
- **Claude Code CLI** (for CLI integration)
- **Rust & Cargo** (for building the UI)
- **Windows** / macOS / Linux

## Getting Started

### For Claude Desktop Users

1. Follow **[SETUP.md](SETUP.md)** to configure the MCP server
2. Read **[CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)** for usage examples
3. Open Claude Desktop and start creating!

### For Claude Code CLI Users

1. `cd D:/projects/daadah/daad-builder-claude`
2. `claude-code`
3. Try `/new-location` or ask "Help me create a text adventure game"

### For UI Users

1. `npm install` (install dependencies)
2. `npm run tauri:dev` (launch the UI)
3. Use the visual editor

### For Best Results

Use all three! They complement each other:
- **Design** with Claude Desktop
- **Implement** with Claude Code CLI
- **Visualize** with the UI

## Examples

### Create Your First Game in 60 Seconds

**In Claude Desktop:**
```
Create a simple game with:
- A forest clearing (start location)
- A dark cave to the north
- A rusty sword in the clearing
- A dragon in the cave
- When player uses sword on dragon, they win
```

Claude will create all locations, objects, connections, and rules automatically!

### Expand an Existing Game

**In Claude Code CLI:**
```
/analyze-game
```

Claude analyzes your game and suggests improvements.

```
/new-location
```

Add a new area with guided prompts.

## Troubleshooting

### MCP Server Not Connecting

1. Verify Node.js: `node --version` (should be 18+)
2. Check config path is absolute in `claude_desktop_config.json`
3. Run test: `node mcp-server/test-server.js`
4. Check logs: `%APPDATA%\Claude\logs` (Windows)

### Slash Commands Not Working

1. Ensure you're in the `daad-builder-claude` directory
2. Check `.claude/commands/` contains .md files
3. Restart Claude Code CLI

### General Issues

- See **[CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)** troubleshooting section
- Check all dependencies are installed
- Verify file permissions

## Tips & Best Practices

### When to Use Claude Desktop
- Initial brainstorming and design
- Creating multiple elements at once
- Natural language game logic
- Quick iterations

### When to Use Claude Code CLI
- Detailed implementation
- File management
- Testing and debugging
- Git workflow

### When to Use the UI
- Visual map design
- Fine-tuning placement
- Previewing the game
- Exporting to platforms

## Advanced Features

### Multiple Projects

Work with different games:
```
In Claude Desktop: "Set project path to D:/my-games/adventure1.json"
In Claude Code: Just edit any .json file
```

### Custom Commands

Add your own slash commands in `.claude/commands/`:
```markdown
---
description: Your command description
---

Your prompt for Claude
```

### Batch Operations

```
In Claude Desktop: "Create 10 medieval weapons and distribute them across locations 1-5"
```

Claude handles the bulk operation intelligently.

## What's Included

✅ Complete DAAD Builder UI
✅ MCP Server for Claude Desktop
✅ Custom Claude Code CLI commands
✅ Pre-configured permissions
✅ Test scripts and verification
✅ Comprehensive documentation
✅ Example configurations
✅ Sample workflows

## Contributing

This is a custom integration of the DAAD Builder. For the base DAAD Builder:
- See the main project documentation
- Check the original README.md

For Claude integration improvements:
- Test your changes
- Update documentation
- Share your custom commands!

## Resources

- **DAAD System**: Classic text adventure development system
- **MCP**: [Model Context Protocol](https://modelcontextprotocol.io)
- **Claude Desktop**: [Download](https://claude.ai/download)
- **Claude Code**: [Documentation](https://docs.anthropic.com/claude-code)

## License

MIT License - See LICENSE file for details

## Support & Community

- Check documentation in this directory
- Run test scripts to verify setup
- Read troubleshooting guides
- Experiment with example workflows

## Credits

- DAAD Builder - Original game development system
- MCP SDK - Anthropic's Model Context Protocol
- Claude - AI assistant integration
- Tauri - Desktop application framework

---

**Ready to create amazing text adventures with Claude? Start here:**

1. **[SETUP.md](SETUP.md)** - Get everything installed
2. **[CLAUDE_INTEGRATION.md](CLAUDE_INTEGRATION.md)** - Learn how to use it
3. Open Claude Desktop or Claude Code CLI - Start building!

Happy adventuring! 🎮✨
