# 🚀 DAAD Builder - Quick Start Guide

## Your Setup

Your tools are installed at:
- **Node.js**: `D:\nodejs`
- **Rust/Cargo**: `D:\.cargo`
- **Rustup**: `D:\.rustup`

The build scripts have been configured for these locations.

---

## ⚡ Fastest Way to Get Started

### Option 1: One-Click Start (Recommended)

Just double-click:
```
quick-start.bat
```

This will:
- ✅ Set up your environment
- ✅ Install dependencies
- ✅ Build the app (first time only - takes 5-10 min)
- ✅ Start the app with HTTP API server
- ✅ Make it ready for Claude Desktop

**Watch for:** `🚀 DAAD Builder MCP API server starting on http://localhost:3456`

### Option 2: Manual Steps

If you prefer to see each step:

```batch
# 1. Build and run in dev mode
build-and-run.bat

# Or for production build:
build-production.bat
```

---

## 🎯 After the App is Running

### Test the HTTP API

Open a new terminal and run:
```batch
test-integration.bat
```

You should see:
- ✅ App is running
- ✅ Test location created
- ✅ Test object created

Check the app - you'll see the test room and key!

### Use with Claude Desktop

Your Claude Desktop is already configured. Just:

1. **Restart Claude Desktop**
2. **Open a new conversation**
3. **Ask:**
   ```
   Check if the DAAD Builder app is running
   ```

4. **Then create something:**
   ```
   Create a mysterious forest location with ancient trees
   ```

5. **Watch it appear in the app instantly!** ✨

---

## 📋 What Each Script Does

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `quick-start.bat` | One-click setup and run | First time or daily use |
| `build-and-run.bat` | Build and run dev mode | Development work |
| `build-production.bat` | Create distributable .exe | When you want a standalone app |
| `test-integration.bat` | Test HTTP API | Verify integration works |
| `setup-claude-desktop.bat` | Configure Claude Desktop | Already done for you |
| `troubleshoot.bat` | Diagnose issues | If something's not working |

---

## 🔧 Environment Variables

The scripts automatically set:
```batch
RUSTUP_HOME=D:\.rustup
CARGO_HOME=D:\.cargo
PATH=D:\nodejs;D:\.cargo\bin;%PATH%
```

If you're using a different terminal, you may need to set these manually.

---

## 💡 Common Scenarios

### First Time Setup
```batch
quick-start.bat
```
Wait for build (5-10 min), then you're ready!

### Daily Use
```batch
quick-start.bat
```
Starts instantly after first build.

### After Making Code Changes
```batch
build-and-run.bat
```
Rebuilds and runs in dev mode.

### Creating a Distributable App
```batch
build-production.bat
```
Creates `src-tauri\target\release\daad-builder.exe`

---

## 🎮 Example Workflow

**Morning:**
1. Double-click `quick-start.bat`
2. App opens with HTTP server running

**Throughout the day:**
3. Switch to Claude Desktop
4. Say: "Create a haunted mansion with 10 rooms"
5. Watch Claude build it in the app
6. Switch back to app, visually arrange rooms
7. Switch to Claude: "Add spooky objects to each room"
8. Keep iterating!

**Evening:**
9. Save your game (Ctrl+S in app)
10. Close the app (Ctrl+C in terminal)

---

## 🐛 Troubleshooting

### "Node.js not found"
Check `D:\nodejs` exists and contains `node.exe`

### "Cargo not found"
Check `D:\.cargo\bin` exists and contains `cargo.exe`

### Build is slow
First build takes 5-10 minutes. After that, it's fast.

### Port 3456 in use
Another app is using that port. Close it or change port in:
- `src-tauri/src/mcp_api.rs` (line ~247)
- `mcp-server/index.js` (line 13)

### Can't see changes in app
Make sure you're watching for the toast notification: "🤖 Game updated from Claude!"

---

## 📖 Next Steps

Once the app is running:

1. **Read** `READY_TO_TEST.md` for detailed examples
2. **Try** the example commands with Claude Desktop
3. **Experiment** with building your own game
4. **Explore** the DAAD Builder UI features
5. **Export** your game to retro platforms!

---

## 🎊 You're Ready!

Just run `quick-start.bat` and you'll be building text adventures with Claude in minutes!

**Have fun!** 🎮✨
