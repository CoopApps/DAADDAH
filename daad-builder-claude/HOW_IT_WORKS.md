# How the Claude Integration Works

## Overview

You have **two Claude interfaces** that both manipulate the same DAAD game project file:

```
┌─────────────────────┐
│  Claude Desktop     │──┐
│  (Natural Language) │  │
└─────────────────────┘  │
                         ├──→ current_project.json ←── Your DAAD Game
┌─────────────────────┐  │
│  Claude Code CLI    │──┘
│  (Developer Tools)  │
└─────────────────────┘
```

## Method 1: Claude Desktop + MCP Server

### What is MCP?

**MCP (Model Context Protocol)** is a standard that lets Claude Desktop use external tools. The MCP server acts as a bridge between Claude's conversational interface and your DAAD game files.

### The Flow

```
You type: "Create a forest location"
    ↓
Claude Desktop understands your intent
    ↓
Claude calls: create_location(name="Forest", description="...")
    ↓
MCP Server (index.js) receives the tool call
    ↓
Server reads: current_project.json
    ↓
Server adds: { id: 0, name: "Forest", ... }
    ↓
Server saves: current_project.json (updated)
    ↓
Claude responds: "Created location 'Forest' with ID 0"
```

### Available Tools

The MCP server provides these tools to Claude:

| Tool | What It Does | Example Usage |
|------|--------------|---------------|
| `create_location` | Adds a new room/area | "Create a dark cave" |
| `create_object` | Adds an item | "Add a rusty sword" |
| `create_connection` | Links rooms | "Connect forest to cave going north" |
| `add_rule` | Adds game logic | "When player takes sword, show message" |
| `list_locations` | Shows all rooms | "Show me all locations" |
| `list_objects` | Shows all items | "What objects exist?" |
| `get_game_info` | Shows game settings | "What's the game info?" |
| `update_game_info` | Changes settings | "Set title to 'My Adventure'" |
| `set_project_path` | Changes active project | "Work on adventure1.json" |

### Real Example

**You say in Claude Desktop:**
```
I want to create a simple game with a forest clearing, a cave,
and a treasure chest containing a diamond. The cave should be
north of the clearing.
```

**Claude does this (behind the scenes):**

1. **Creates the clearing:**
   ```javascript
   create_location({
     name: "Forest Clearing",
     description: "Sunlight filters through the trees. A path leads north.",
     x: 0, y: 0
   })
   ```
   Result: Location ID 0 created

2. **Creates the cave:**
   ```javascript
   create_location({
     name: "Dark Cave",
     description: "A damp cave shrouded in darkness.",
     x: 0, y: 1
   })
   ```
   Result: Location ID 1 created

3. **Connects them:**
   ```javascript
   create_connection({
     from_location: 0,
     to_location: 1,
     direction: "n"
   })
   ```

4. **Creates the chest:**
   ```javascript
   create_object({
     name: "treasure chest",
     description: "An old wooden chest with iron bands.",
     location: 1,  // In the cave
     noun: "chest",
     adjective: "treasure"
   })
   ```

5. **Creates the diamond:**
   ```javascript
   create_object({
     name: "sparkling diamond",
     description: "A brilliant diamond that catches the light.",
     location: 254,  // Not created yet (inside chest)
     noun: "diamond",
     adjective: "sparkling"
   })
   ```

**Claude responds:**
```
I've created your game! Here's what I built:

Locations:
- Forest Clearing (ID: 0) - starting point
- Dark Cave (ID: 1) - north of clearing

Objects:
- Treasure chest (ID: 0) - in the cave
- Sparkling diamond (ID: 1) - inside the chest

You can now test the game or add more features!
```

**The resulting JSON:**
```json
{
  "gameInfo": {
    "title": "New DAAD Game",
    "author": "",
    "startLocation": 0,
    "maxCarried": 4,
    "vocabulary": [
      { "word": "chest", "type": "noun", "id": 0 },
      { "word": "treasure", "type": "adjective", "id": 0 },
      { "word": "diamond", "type": "noun", "id": 1 },
      { "word": "sparkling", "type": "adjective", "id": 1 }
    ]
  },
  "locations": [
    {
      "id": 0,
      "name": "Forest Clearing",
      "description": "Sunlight filters through the trees. A path leads north.",
      "x": 0,
      "y": 0
    },
    {
      "id": 1,
      "name": "Dark Cave",
      "description": "A damp cave shrouded in darkness.",
      "x": 0,
      "y": 1
    }
  ],
  "objects": [
    {
      "id": 0,
      "name": "treasure chest",
      "description": "An old wooden chest with iron bands.",
      "location": 1,
      "noun": "chest",
      "adjective": "treasure"
    },
    {
      "id": 1,
      "name": "sparkling diamond",
      "description": "A brilliant diamond that catches the light.",
      "location": 254,
      "noun": "diamond",
      "adjective": "sparkling"
    }
  ],
  "connections": [
    {
      "id": 0,
      "from": 0,
      "to": 1,
      "direction": "n"
    }
  ]
}
```

## Method 2: Claude Code CLI + Slash Commands

### What Are Slash Commands?

Slash commands are shortcuts that load pre-written instructions for Claude. They're stored as markdown files in `.claude/commands/`.

### The Flow

```
You type: /new-location
    ↓
Claude Code reads: .claude/commands/new-location.md
    ↓
File contains: "Ask me for location name, description..."
    ↓
Claude follows those instructions
    ↓
Claude asks: "What should the location be called?"
    ↓
You answer: "Haunted Manor"
    ↓
Claude reads: current_project.json
    ↓
Claude edits: Adds new location to JSON
    ↓
Claude saves: current_project.json (updated)
    ↓
Claude confirms: "Created location 'Haunted Manor'"
```

### Available Slash Commands

| Command | File | What It Does |
|---------|------|--------------|
| `/new-location` | new-location.md | Interactive location creator |
| `/new-object` | new-object.md | Interactive object creator |
| `/add-rule` | add-rule.md | Interactive rule creator |
| `/analyze-game` | analyze-game.md | Analyzes your game structure |
| `/test-game` | test-game.md | Launches the game for testing |

### Real Example

**In Claude Code CLI:**

```
$ cd D:/projects/daadah/daad-builder-claude
$ claude-code

You: /analyze-game

Claude: I'll analyze the current DAAD game project for you.

*reads current_project.json*

📊 Game Analysis:

**Game Info:**
- Title: "New DAAD Game"
- Author: Not set
- Start Location: 0 (Forest Clearing)
- Max Carried Items: 4

**Content:**
- 2 locations (Forest Clearing, Dark Cave)
- 2 objects (treasure chest, sparkling diamond)
- 1 connection (Forest → Cave, north)
- 0 rules (no game logic yet!)
- 4 vocabulary words

**Potential Issues:**
⚠️ No game rules defined - player can't interact with anything
⚠️ Diamond is in a chest but no rule to open the chest
⚠️ No win condition

**Suggestions:**
1. Add an OPEN CHEST rule to reveal the diamond
2. Add an EXAMINE rule for the chest
3. Add a GET DIAMOND rule with a win message
4. Consider adding south connection from cave to forest

Would you like me to add any of these features?
```

### How Slash Commands Work Internally

When you use `/new-location`, this is what happens:

1. **Command file is read:**
   ```markdown
   ---
   description: Create a new location in the DAAD game
   ---

   Create a new location for the DAAD game. Ask me for the location
   name, description, and any connected locations. Then add it to
   the current project JSON file.
   ```

2. **Claude follows the instructions:**
   - Asks you questions interactively
   - Gathers all required information
   - Reads the existing project file
   - Modifies the JSON structure
   - Writes it back to disk

3. **You get a confirmation:**
   ```
   ✅ Created location "Haunted Manor" (ID: 2)
   ✅ Added connection: Cave → Manor (east)
   ```

## Combining Both Methods

### The Power of Dual Integration

Both methods work with **the same file**, so you can switch between them:

**Workflow Example:**

**Morning - Quick Design (Claude Desktop):**
```
You: Create a 10-room mystery mansion with 5 characters and
     15 objects. Make it a murder mystery.

Claude: *uses MCP tools*
        *creates all locations, objects, characters*

Done! Created:
- 10 locations (Entrance Hall, Library, Dining Room, ...)
- 5 characters (Butler, Detective, Maid, ...)
- 15 objects (Knife, Candlestick, Revolver, ...)
```

**Afternoon - Detailed Work (Claude Code CLI):**
```
You: /add-rule

Claude: What action should trigger this rule?

You: When player accuses butler

Claude: What conditions must be met?

You: Player must have found 3 clues

Claude: What should happen?

You: Show win message if correct, game over message if wrong

Claude: *creates complex rule with conditions and actions*
        ✅ Rule created!
```

**Evening - Visual Polish (DAAD Builder UI):**
```bash
npm run tauri:dev
```
- Drag rooms to organize the map visually
- Adjust object descriptions
- Preview the game in real-time

### Real-World Scenario

**Day 1: Rapid Prototyping**
```
Claude Desktop: "Create a fantasy quest with 20 locations,
                 30 objects, and a dragon boss fight"

→ Game structure created in 2 minutes
```

**Day 2: Add Logic**
```
Claude Code CLI: /add-rule (×15 times)

→ All game mechanics implemented
```

**Day 3: Testing & Polish**
```
Claude Code CLI: /test-game
DAAD Builder UI: Visual tweaks
Claude Desktop: "Add more atmosphere to the descriptions"

→ Polished, playable game
```

## Technical Architecture

```
┌───────────────────────────────────────────────────────┐
│                 Claude Desktop                        │
│  (Natural language conversations)                     │
└─────────────────────┬─────────────────────────────────┘
                      │
                      │ MCP Protocol (stdio)
                      │
┌─────────────────────▼─────────────────────────────────┐
│              MCP Server (Node.js)                     │
│  - Provides tools to Claude                           │
│  - Validates inputs                                   │
│  - Reads/writes JSON                                  │
└─────────────────────┬─────────────────────────────────┘
                      │
                      │ File I/O
                      │
┌─────────────────────▼─────────────────────────────────┐
│            current_project.json                       │
│  {                                                    │
│    gameInfo: { ... },                                 │
│    locations: [ ... ],                                │
│    objects: [ ... ],                                  │
│    rules: [ ... ]                                     │
│  }                                                    │
└─────────────────────▲─────────────────────────────────┘
                      │
                      │ File I/O
                      │
┌─────────────────────┴─────────────────────────────────┐
│              Claude Code CLI                          │
│  - Slash commands                                     │
│  - Direct file editing                                │
│  - Full dev tools                                     │
└───────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. **State is in the File**

Everything is stored in `current_project.json`. There's no database, no cloud sync, just a JSON file. This means:

- ✅ Easy to version control (git)
- ✅ Easy to backup (copy the file)
- ✅ Easy to share (send the file)
- ✅ Works offline

### 2. **Claude is Stateless**

Each time you ask Claude something:
1. It reads the current state from the file
2. Makes changes
3. Saves back to the file

Claude doesn't "remember" your game - it reads it fresh each time.

### 3. **Two Interfaces, Same Data**

Think of it like editing a document:
- Claude Desktop = Voice dictation
- Claude Code CLI = Keyboard typing
- DAAD Builder UI = Mouse/GUI

All edit the same document (current_project.json).

## Advantages of This Design

### For Beginners
- Talk naturally: "Add a dragon"
- No syntax to learn
- Instant feedback
- Claude explains what it's doing

### For Advanced Users
- Full control via CLI
- Direct JSON editing
- Git integration
- Batch operations

### For Everyone
- Choose your interface
- Switch anytime
- No vendor lock-in
- Standard JSON format

## Common Questions

**Q: Do I need both Claude Desktop and Claude Code?**
A: No! Use whichever you prefer. They're complementary but independent.

**Q: Where is my game stored?**
A: In `current_project.json` in the daad-builder-claude directory.

**Q: Can I edit the JSON file directly?**
A: Yes! It's just a text file. Any changes you make manually will be seen by both Claude interfaces.

**Q: What if I break something?**
A: Use git! `git init` → `git add .` → `git commit -m "Working version"` before making changes.

**Q: Can I have multiple games?**
A: Yes! Either:
- Use different directories
- Use different JSON files and switch with `set_project_path`
- Copy current_project.json to save different versions

**Q: Does this work offline?**
A: The MCP server works offline (but Claude Desktop needs internet). Claude Code CLI works fully offline once downloaded.

## Next Steps

Now that you understand how it works:

1. **Try the MCP server:**
   - Configure Claude Desktop (see SETUP.md)
   - Ask Claude to create a simple game
   - Watch the magic happen!

2. **Try slash commands:**
   - Open Claude Code CLI
   - Type `/new-location`
   - See the interactive workflow

3. **Combine them:**
   - Design in Claude Desktop
   - Refine in Claude Code CLI
   - Polish in the UI

4. **Create something amazing!**
   - Your imagination is the limit
   - Claude handles the technical details
   - Focus on storytelling and design

## Resources

- **Setup Guide**: SETUP.md
- **Usage Examples**: CLAUDE_INTEGRATION.md
- **Quick Start**: QUICK_START.md
- **MCP Details**: mcp-server/README.md

Happy creating! 🎮
