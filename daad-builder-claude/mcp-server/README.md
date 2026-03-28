# DAAD Builder MCP Server

This MCP (Model Context Protocol) server allows Claude Desktop to interact with DAAD text adventure games through natural language commands.

## Features

The MCP server provides tools to:

- **Create locations**: Add new rooms and areas to your game
- **Create objects**: Add items and interactive objects
- **Create connections**: Link locations together with directional exits
- **Add rules**: Define game logic and responses to player actions
- **List and query**: View all locations, objects, and game information
- **Update game info**: Modify game title, author, settings

## Installation

### 1. Install dependencies

Dependencies are already installed if you ran npm install in this directory. If not:

```bash
cd D:/projects/daadah/daad-builder-claude/mcp-server
npm install
```

### 2. Configure Claude Desktop

Add the following to your Claude Desktop configuration file:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

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

**Note**: Adjust the paths above to match your actual installation directory.

### 3. Restart Claude Desktop

After updating the configuration, restart Claude Desktop for the changes to take effect.

## Usage

Once configured, you can use natural language in Claude Desktop to work with DAAD games:

### Example Commands

**Create a new location:**
```
Create a location called "Dark Forest" with the description "You are in a dark, foreboding forest. Trees loom overhead and strange sounds echo in the distance."
```

**Create an object:**
```
Create a sword object called "rusty sword" with description "An old, rusty sword that has seen better days." The noun is "sword" and adjective is "rusty". It should start in location 1.
```

**Add a connection:**
```
Connect location 0 to location 1 going north
```

**Add a game rule:**
```
Add a rule that when the player examines the sword, it shows a message "The sword is covered in rust but still looks sturdy."
```

**List everything:**
```
Show me all locations in the game
Show me all objects
What's the current game info?
```

### Working with Project Files

By default, the server works with `current_project.json` in the daad-builder-claude directory. You can change this by:

1. Setting the `DAAD_PROJECT_PATH` environment variable in the config (as shown above)
2. Using the `set_project_path` tool within a conversation

## Available Tools

The MCP server exposes these tools to Claude Desktop:

- `create_location` - Create a new game location
- `create_object` - Create a new interactive object
- `create_connection` - Connect two locations
- `add_rule` - Add game logic/responses
- `list_locations` - List all locations
- `list_objects` - List all objects
- `get_game_info` - Get game metadata
- `update_game_info` - Update game metadata
- `set_project_path` - Change the active project file

## Resources

The server also provides a resource:

- `daad://current-project` - Access the full current project JSON

## Troubleshooting

### Server not appearing in Claude Desktop

1. Check that the paths in `claude_desktop_config.json` are correct and absolute
2. Ensure Node.js is installed and in your PATH
3. Check Claude Desktop logs for errors:
   - Windows: `%APPDATA%\Claude\logs`
   - macOS: `~/Library/Logs/Claude`
   - Linux: `~/.config/Claude/logs`

### Permission errors

Make sure the DAAD_PROJECT_PATH directory exists and is writable.

### Server crashes

Check the MCP server logs in Claude Desktop's log directory for error messages.

## Development

To run the server in development mode with auto-reload:

```bash
npm run dev
```

The server uses stdio for communication, so it must be run through Claude Desktop or another MCP client.

## Project Structure

```
mcp-server/
├── index.js           # Main MCP server implementation
├── package.json       # Dependencies and metadata
└── README.md         # This file
```

## Next Steps

1. Open Claude Desktop and verify the DAAD Builder server is connected
2. Create a new game or load an existing one
3. Use natural language to build your text adventure!
4. Open the project in the DAAD Builder UI to see your changes visually

For the full DAAD Builder UI, see the parent directory's README.
