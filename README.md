# DAADDAH - DAAD Adventure Creator

**Professional-grade text adventure game development environment** for creating games using the classic DAAD system (Diseñador de Aventuras AD) from the 1980s, modernized with contemporary no-code visual tools.

## 🌟 Project Components

DAADDAH consists of **two major applications**:

1. **DAAD Bevy Builder** - Visual game creation tool (Rust/Bevy desktop app)
2. **DAAD Standalone Player** - Portable game runtime (console executable)

## ✨ Features

### DAAD Builder (`daad-bevy-builder/`)
- 🗺️ **Visual Location Editor** - Drag-and-drop map building with automatic connections
- 📦 **Object Editor** - Complete object management with properties, containers, and icons
- ⚙️ **Visual Rule Builder** - No-code condition/action logic editor
- 🚩 **Property Editors** - Full text input forms for flags, messages, locations, and objects ✨ NEW!
- 💬 **Message System** - Text and dialogue management
- 🎮 **Live Preview** - Test your game instantly with built-in interpreter
- 💾 **Export System** - Generate authentic DAAD source code (.sce files)
- ⌨️ **Keyboard Shortcuts** - F1 (code viewer), F5 (preview), Ctrl+S (save), Ctrl+E (export)
- 📊 **Game Statistics** - Real-time metrics and validation

### DAAD Player (`daad-player/`) ✨ NEW!
- 🎯 **Standalone Executable** - Single-file game distribution
- 📱 **Cross-platform** - Windows, macOS, Linux support
- 🚀 **Zero Dependencies** - Players need nothing else installed
- 📂 **Drag-and-drop** - Simply drop game files onto the player
- 🎮 **Full DAAD Support** - Complete text adventure gameplay
- 💾 **JSON Format** - Loads games exported from the builder

## 🚀 Quick Start

### Building Everything

**macOS / Linux:**
```bash
./build.sh
```

**Windows:**
```batch
build.bat
```

This compiles both the Builder and Player, placing executables in `dist/`.

### Manual Build

**Builder:**
```bash
cd daad-bevy-builder
cargo build --release
./target/release/daad-bevy-builder
```

**Player:**
```bash
cd daad-player
cargo build --release
./target/release/daad-player mygame.json
```

## 📖 Creating Your First Game

### 1. Launch the Builder
```bash
./dist/daad-bevy-builder
```

### 2. Design Your Game
- **Game Info Panel** - Set title, author, version
- **Locations Panel** - Create locations, add descriptions
- **Objects Panel** - Add items, set properties
- **Rules Panel** - Build game logic with visual rules
- **Flags Panel** - Create variables for game state
- **Messages Panel** - Write game text and dialogue

### 3. Edit Properties ✨ NEW!
- Click any flag, message, or object to edit
- Use the **Property Editor** panel that appears on the right
- Type directly into text fields
- Click "Save Changes" when done

### 4. Preview Your Game
- Press **F5** to toggle preview mode
- Test gameplay in real-time
- Use commands: LOOK, GO [direction], GET [object], etc.

### 5. Export Your Game
- Press **Ctrl+S** to save project as JSON
- Press **Ctrl+E** to export DAAD source code (.sce)
- Files save to `exports/` directory

### 6. Distribute to Players ✨ NEW!
Give players two files:
1. `daad-player` (or `daad-player.exe` on Windows)
2. Your game's `.json` file

**Windows Distribution Example:**
```batch
REM play.bat
@echo off
daad-player.exe myadventure.json
pause
```

## 🎮 Player Commands

### Movement
- `NORTH` / `N`, `SOUTH` / `S`, `EAST` / `E`, `WEST` / `W`
- `UP` / `U`, `DOWN` / `D`
- `NORTHEAST` / `NE`, `NORTHWEST` / `NW`, `SOUTHEAST` / `SE`, `SOUTHWEST` / `SW`
- `IN`, `OUT`

### Actions
- `LOOK` / `L` - Examine current location
- `INVENTORY` / `INV` / `I` - Check inventory
- `EXAMINE [object]` / `X [object]` - Inspect an object
- `GET [object]` / `TAKE [object]` - Pick up an object
- `DROP [object]` - Drop an object

### System
- `QUIT` / `EXIT` - Exit game

## 📁 Project Structure

```
DAADDAH/
├── daad-bevy-builder/      # Visual game builder (Rust/Bevy)
│   ├── src/
│   │   ├── builder/        # UI and editors
│   │   │   ├── ui/
│   │   │   │   ├── text_input.rs  ✨ NEW! Text input system
│   │   │   │   └── ...
│   │   │   └── editors/
│   │   │       ├── property_forms.rs  ✨ ENHANCED! Property editors
│   │   │       ├── location_editor.rs
│   │   │       ├── object_editor.rs
│   │   │       └── rule_editor.rs
│   │   ├── daad/           # DAAD data structures
│   │   ├── viewer/         # Code viewer
│   │   └── preview/        # Game interpreter
│   ├── Cargo.toml
│   └── README.md
│
├── daad-player/            ✨ NEW! Standalone player
│   ├── src/
│   │   ├── main.rs
│   │   ├── types.rs
│   │   └── interpreter.rs
│   ├── Cargo.toml
│   └── README.md
│
├── js/                     # JavaScript web modules
│   └── modules/
│       ├── module-vocabulary-builder-enhanced.js
│       ├── module-synonym-system-enhanced.js
│       ├── module-visual-process-flow.js
│       └── module-maluva-extensions-enhanced.js
│
├── exports/                # Generated game files (auto-created)
│
├── build.sh                ✨ NEW! macOS/Linux build script
├── build.bat               ✨ NEW! Windows build script
├── README.md               ✨ NEW! This file
├── DAAD_USER_GUIDE.md      # Comprehensive user guide
├── MISSING_FEATURES_ANALYSIS.md
└── DAAD_MODULES_COMPLETE_ANALYSIS.md
```

## 🆕 What's New in This Update

### ✅ Property Editing Forms
- **Full text input system** for Bevy UI
- **Edit flags** with name, description, and initial value fields
- **Edit messages** with multi-line text input
- **Real-time updates** with visual feedback
- **Keyboard input handling** with focus management

### ✅ Standalone Game Player
- **Cross-platform executable** for game distribution
- **No dependencies** - single file execution
- **Drag-and-drop support** for game files
- **Full DAAD interpreter** with all commands
- **Beautiful console UI** with box drawing characters

### ✅ Build System
- **One-command builds** for all platforms
- **Automated distribution** packaging
- **Build scripts** for Windows, macOS, and Linux

## 🔧 Requirements

### Development
- **Rust 1.70+** (install from [rustup.rs](https://rustup.rs))
- **Cargo** (included with Rust)

### Runtime
- **Builder**: Native windowing support (included in OS)
- **Player**: Console/terminal (included in OS)

## 📚 Documentation

- **[DAAD_USER_GUIDE.md](DAAD_USER_GUIDE.md)** - Complete 637-line user guide
- **[daad-bevy-builder/README.md](daad-bevy-builder/README.md)** - Builder-specific docs
- **[daad-player/README.md](daad-player/README.md)** - Player usage and distribution
- **[MISSING_FEATURES_ANALYSIS.md](MISSING_FEATURES_ANALYSIS.md)** - Feature completeness analysis
- **[DAAD_MODULES_COMPLETE_ANALYSIS.md](DAAD_MODULES_COMPLETE_ANALYSIS.md)** - Module documentation

## 🎯 Project Status

### ✅ Completed (95%)
- ✅ Core DAAD data structures
- ✅ Visual location editor with drag-and-drop
- ✅ Object management system
- ✅ Visual rule builder
- ✅ Property editing forms (flags, messages) ✨
- ✅ Live game preview
- ✅ DAAD source code generation
- ✅ JSON save/load
- ✅ Standalone player executable ✨
- ✅ Build automation ✨

### 🚧 In Progress
- ⏳ Object property editing forms
- ⏳ Location property editing forms
- ⏳ Enhanced drag-and-drop with visual feedback

### 📋 Planned
- 🔮 Undo/redo system
- 🔮 Import existing DAAD games
- 🔮 Game templates and examples
- 🔮 DDB binary file export
- 🔮 GUI version of player (with images/sounds)

## 🎮 Example Workflow

1. **Create a game**
   ```bash
   ./dist/daad-bevy-builder
   ```

2. **Add content** using visual editors

3. **Test** with F5 preview mode

4. **Save** project with Ctrl+S
   - Creates `exports/yourgame.json`

5. **Export** DAAD source with Ctrl+E
   - Creates `exports/yourgame.sce`

6. **Distribute** to players:
   ```bash
   # Give players these files:
   - daad-player (or .exe)
   - yourgame.json
   ```

7. **Players run:**
   ```bash
   ./daad-player yourgame.json
   ```

## 🤝 Contributing

This is a comprehensive game development system. Areas for contribution:

- **Builder UI/UX** - Improve visual editors
- **Player Features** - Save states, hints, transcripts
- **Documentation** - Tutorials, examples
- **Testing** - Game creation workflows
- **Platforms** - Additional target platforms

## 📄 License

Part of the DAADDAH project - DAAD Adventure Creator

## 🙏 Acknowledgments

- **DAAD System** - Classic text adventure engine from the 1980s
- **Bevy Engine** - Modern game engine for Rust
- **Rust Community** - Amazing tools and libraries

## 🔗 Related Tools

- **Original DAAD** - Classic compiler for retro platforms
- **Maluva** - Graphics/sound extensions for DAAD
- **JavaScript Modules** - Web-based game creation tools (in `js/` directory)

---

**Happy Adventure Creating!** 🎮✨
