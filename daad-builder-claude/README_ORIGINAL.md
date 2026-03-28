# 🎮 DAAD Builder

**A modern visual editor for creating retro text adventure games**

[![Platform](https://img.shields.io/badge/platforms-ZX%20Spectrum%20%7C%20C64%20%7C%20Amstrad%20%7C%20MSX%20%7C%20Amiga-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

Create classic text adventures for ZX Spectrum, Commodore 64, and other retro platforms using a modern visual interface. No coding required!

![DAAD Builder Screenshot](screenshot.png)

---

## 🌟 Features

### Visual Game Creation
- **No coding required** - Build games with visual editors
- **Live preview** - See your game as you create it
- **Drag & drop** - Easy room connections and object placement
- **Syntax-free** - Point, click, type descriptions

### Rich Content Tools
- **Location Editor** - Create rooms with descriptions and exits
- **Object Editor** - Design items with properties and behaviors
- **Character System** - Add NPCs with dialogue
- **Rule Editor** - Define game logic visually
- **Flag System** - Track game state with variables
- **Music Library** - 50 pre-composed sound effects and music tracks

### Native Compiler
- **Built-in Rust compiler** - No external tools needed
- **9 target platforms** - Compile to multiple retro systems
- **Instant builds** - Fast compilation
- **Better error messages** - Clear, helpful validation

### Supported Platforms
1. 🖥️ **ZX Spectrum** 48K/128K (.TAP)
2. 💾 **Commodore 64** (.PRG)
3. 🎮 **Amstrad CPC** (.DSK)
4. 🕹️ **MSX** (.ROM)
5. 🖱️ **Amiga** (.ADF)
6. ⌨️ **Atari ST** (.ST)
7. 💻 **MS-DOS** (.EXE)
8. 📠 **Amstrad PCW** (.PCW)
9. 🎯 **Commodore Plus/4** (.PRG)

---

## 🚀 Quick Start

### Installation

**Windows:**
```bash
# Download latest release
# Run daad-builder-setup.exe
```

**Mac:**
```bash
# Download latest release
# Open daad-builder.dmg
```

**Linux:**
```bash
# Download latest release
# chmod +x daad-builder.AppImage
# ./daad-builder.AppImage
```

### Create Your First Game

1. **Launch DAAD Builder**
2. **Enter game title** in Game Info panel
3. **Create a room**: Click "+ New Room"
   - Name: "Forest Clearing"
   - Description: "You stand in a sun-dappled forest clearing."
4. **Add an object**: Click "+ New Item"
   - Noun: "sword"
   - Description: "a shining sword"
   - Location: Room 0
5. **Add a rule**: Click "+ New Response"
   - Condition: VERB "take", NOUN1 "sword"
   - Action: GET sword, MES "You take the sword"
6. **Compile**: Go to Compile panel, select "ZX Spectrum 48K", click Compile
7. **Test**: Load the .TAP file in a Spectrum emulator!

---

## 📚 Documentation

- **[User Manual](USER_MANUAL.md)** - Complete guide to creating games
- **[Music Library](MUSIC_LIBRARY.md)** - 50 pre-composed tracks documentation
- **[Compiler Guide](COMPILER_README.md)** - Technical compilation details

### Quick Links

- [Game Design Tips](USER_MANUAL.md#tips--best-practices)
- [Rule Examples](USER_MANUAL.md#example-rules)
- [Music Import Guide](USER_MANUAL.md#music--sound-effects)
- [Troubleshooting](USER_MANUAL.md#troubleshooting)

---

## 🎵 Music Library

DAAD Builder includes **50 pre-composed music tracks** organized in 11 categories:

- **UI & Feedback** (10) - Item pickup, success, menu sounds
- **Doors & Objects** (5) - Door sounds, chest opening
- **Movement** (5) - Footsteps, water, wind
- **Combat** (5) - Sword swings, hits, enemy sounds
- **Magic** (5) - Spells, teleport, power-up
- **Victory** (3) - Fanfares, completion music
- **Defeat** (2) - Game over, death
- **Ambient** (5) - Mystery, danger, peaceful
- **Time** (2) - Clock ticking, bells
- **Title/Intro** (3) - Title screen, game start
- **Special Events** (5) - Boss battles, treasure, secrets

### Importing Music

1. Open **Music** panel
2. Click **📚 Library** button
3. Browse by category
4. Select tracks
5. Click **Import**
6. Use in rules with `XPLAY {id}`

Music compiles to platform-specific formats automatically!

---

## 🎯 Example Game

Here's a simple treasure hunt game:

### Rooms
```
Room 0: Forest Path
  "A winding path through dark woods."
  North → Cave Entrance

Room 1: Cave Entrance
  "A dark cave mouth yawns before you."
  South → Forest Path
  In → Dark Cave (if carrying torch)
```

### Objects
```
Object 0: Torch
  Noun: "torch"
  Location: Room 0
  Light Source: Yes

Object 1: Treasure
  Noun: "treasure"
  Location: Room 2
```

### Rules
```
Rule: "Take torch"
  VERB "take", NOUN1 "torch", AT 0
  → GET torch, XPLAY 0, MES "You take the torch"

Rule: "Enter dark cave"
  VERB "in", AT 1, NOTCARR torch
  → XPLAY 8, MES "Too dark to enter!"

Rule: "Find treasure"
  VERB "take", NOUN1 "treasure", AT 2
  → GET treasure, XPLAY 46, MES "You found the treasure!"

Rule: "Win game"
  CARRIED treasure, AT 0
  → XPLAY 30, MES "You won!", END
```

Compile and play on any supported platform!

---

## 🛠️ Building from Source

### Prerequisites

- **Node.js** 18+
- **Rust** 1.70+
- **Tauri CLI**

### Development

```bash
# Clone repository
git clone https://github.com/your-repo/daad-builder
cd daad-builder

# Install dependencies
npm install

# Run development server
npm run tauri dev

# Build production binary
npm run tauri build
```

---

## 🤝 Contributing

Contributions welcome! Areas to help:

- **Music tracks** - Compose more sound effects
- **Templates** - Create game templates
- **Documentation** - Improve guides
- **Translations** - Translate to other languages
- **Bug reports** - Test and report issues

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📖 Resources

### DAAD System
- [Original DAAD Manual](https://github.com/daad-adventure-writer/daad)
- [DAAD Interpreters](https://github.com/daad-adventure-writer/daad/tree/master/Interpreters)
- [PCDAAD Source](https://github.com/daad-adventure-writer/PCDAAD)

### Emulators
- **ZX Spectrum**: [Fuse](http://fuse-emulator.sourceforge.net/), [ZEsarUX](https://github.com/chernandezba/zesarux)
- **C64**: [VICE](https://vice-emu.sourceforge.io/)
- **Amstrad CPC**: [WinAPE](http://www.winape.net/)
- **MSX**: [openMSX](https://openmsx.org/)

### Community
- [Retro Adventure Games Forum](https://example.com)
- [DAAD Discord](https://example.com)

---

## 📜 License

**DAAD Builder** - MIT License (see [LICENSE](LICENSE))

**DAAD System** - Public Domain (Andrés Samudio)

**Embedded Interpreters** - Original DAAD license

**Music Library** - Free to use in DAAD games

---

## 🙏 Credits

- **Andrés Samudio** - Original DAAD system creator
- **DAAD Adventure Writer Team** - Interpreters and documentation
- **Gilsoft International** - Original DAAD publishers
- **Community Contributors** - Bug reports, features, translations

---

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/your-repo/daad-builder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/daad-builder/discussions)
- **Email**: your-email@example.com

---

## 🎮 Happy Adventuring!

Create amazing retro text adventures and share them with the world!

**Version 1.0** | Built with ❤️ for retro gaming enthusiasts
