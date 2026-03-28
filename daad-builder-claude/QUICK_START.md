# DAAD Builder - Quick Start Guide

## 🎯 You Have Two Ways to Use Claude

### Option 1: Claude Desktop (Conversational AI)

**Setup (5 minutes):**
1. Open: `D:\projects\daadah\daad-builder-claude\claude_desktop_config.example.json`
2. Copy its contents
3. Paste into: `%APPDATA%\Claude\claude_desktop_config.json`
4. Restart Claude Desktop

**Usage:**
```
"Create a haunted mansion with 5 rooms and a ghost"
"Add a rusty key object in the library"
"When player uses key on door, show success message"
```

### Option 2: Claude Code CLI (Enhanced IDE)

**Setup (instant):**
```bash
cd D:\projects\daadah\daad-builder-claude
claude-code
```

**Usage:**
```
/new-location     → Create a new location
/new-object       → Create a new object
/add-rule         → Add game logic
/analyze-game     → Analyze your game
/test-game        → Run the game
```

## 🚀 First Steps

### Test the Setup

```bash
cd D:\projects\daadah\daad-builder-claude\mcp-server
node test-server.js
```

Should show: ✅ All tests passed!

### Create Your First Location

**In Claude Desktop:**
```
Create a location called "Ancient Library" with description
"Dusty books line the walls. A mysterious tome lies on a pedestal."
```

**In Claude Code CLI:**
```
/new-location
```
Then follow the prompts.

### Verify It Worked

Check the file: `D:\projects\daadah\daad-builder-claude\current_project.json`

It should contain your new location!

## 📖 Documentation

| File | What It Covers |
|------|---------------|
| **README_CLAUDE.md** | Overview and features |
| **SETUP.md** | Detailed installation steps |
| **CLAUDE_INTEGRATION.md** | Complete usage guide |
| **mcp-server/README.md** | MCP server specifics |

## 🎮 Example: Create a Simple Game

### In Claude Desktop (5 minutes):

```
Create a simple adventure game with:

1. A forest clearing (starting location)
2. A dark cave to the north
3. A treasure room to the east (from the cave)
4. A golden key in the clearing
5. A locked chest in the treasure room
6. When player uses key on chest, they find a diamond and win

Set the game title to "The Lost Diamond"
Set the author to my name
```

Claude will create the entire game structure!

### Test It:

In Claude Code CLI:
```
/analyze-game
```

You'll see a complete analysis of your game.

## 🔧 Troubleshooting

### MCP Server Not Working?
```bash
# Check Node.js version (need 18+)
node --version

# Reinstall dependencies
cd D:\projects\daadah\daad-builder-claude\mcp-server
npm install

# Run tests
node test-server.js
```

### Slash Commands Not Working?
```bash
# Make sure you're in the right directory
cd D:\projects\daadah\daad-builder-claude

# Check commands exist
ls .claude/commands/

# Restart Claude Code
```

## 💡 Tips

**Combine Both Tools:**
1. Use Claude Desktop for initial design
2. Use Claude Code CLI for detailed work
3. Use the UI (`npm run tauri:dev`) for visual editing

**Save Your Work:**
```bash
git init
git add .
git commit -m "My awesome DAAD game"
```

**Work on Multiple Games:**

In Claude Desktop:
```
Set project path to D:/my-games/adventure1.json
```

In Claude Code:
```
Just open and edit any .json file
```

## 🎓 Learning Path

1. **Day 1**: Create simple locations and objects
2. **Day 2**: Add connections and basic rules
3. **Day 3**: Learn DAAD rule syntax (read DAAD_BUILDER_MANUAL.md)
4. **Day 4**: Build a complete playable game
5. **Day 5**: Export to retro platforms!

## 📱 Next Steps

### If Using Claude Desktop:
1. ✅ Configure claude_desktop_config.json
2. ✅ Restart Claude Desktop
3. ✅ Ask: "What DAAD tools do you have?"
4. ✅ Start creating!

### If Using Claude Code:
1. ✅ `cd D:\projects\daadah\daad-builder-claude`
2. ✅ `claude-code`
3. ✅ Try: `/new-location`
4. ✅ Start building!

### If Using Both:
1. ✅ Set up Claude Desktop
2. ✅ Design your game conversationally
3. ✅ Switch to Claude Code for details
4. ✅ Use the UI for visual work

## 🎪 Fun Examples to Try

**Mystery Game:**
```
Create a mystery game set in a Victorian mansion where the player
must find 3 clues to solve a murder. Include a detective, a butler,
and a secret passage.
```

**Fantasy Quest:**
```
Create a fantasy game with a wizard's tower, a dragon's lair, and
a magic sword that can defeat the dragon. Add a riddle that guards
the sword.
```

**Retro Adventure:**
```
Create a ZX Spectrum style adventure with 8 locations, 5 objects,
and a treasure hunt. Make it feel like a classic 1980s text adventure.
```

## 🆘 Get Help

1. Read CLAUDE_INTEGRATION.md for detailed examples
2. Run `node test-server.js` to verify setup
3. Check %APPDATA%\Claude\logs for errors
4. Try the example games above

## ✨ Have Fun!

You now have a powerful AI-assisted DAAD game development environment.

**Start creating amazing text adventures!** 🎮

---

**Quick Command Reference:**

| Where | Command | What It Does |
|-------|---------|--------------|
| Claude Desktop | "Create location..." | Makes new location |
| Claude Desktop | "List all locations" | Shows all locations |
| Claude Code | `/new-location` | Interactive location creator |
| Claude Code | `/analyze-game` | Game analysis |
| Terminal | `node test-server.js` | Verify setup |
| Terminal | `npm run tauri:dev` | Launch UI |

**Ready? Open Claude Desktop or Claude Code CLI and start building!**
