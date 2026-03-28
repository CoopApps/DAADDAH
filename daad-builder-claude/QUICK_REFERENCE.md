# DAAD Builder - Quick Reference

Fast lookup guide for common tasks and commands.

---

## 🎯 Common Tasks

### Creating Game Elements

| Task | Steps |
|------|-------|
| **New Room** | Game Info → "+ New Room" button |
| **New Item** | Game Info → "+ New Item" button |
| **New Character** | Characters panel → "+ New Character" |
| **New Rule** | Rules panel → "+ New Response" |
| **New Flag** | Flags panel → "+ New Variable" |
| **New Message** | Messages panel → "+ New Message" |
| **New Music** | Music panel → "+ New Music" or "📚 Library" |

### Connecting Rooms

1. Select room in Locations panel
2. Find "Exits" section
3. Choose direction (North, South, East, etc.)
4. Select destination room from dropdown

### Importing Music

1. Music panel → **📚 Library** button
2. Select category or browse "All Tracks"
3. Check boxes for desired tracks
4. Click **Import X Track(s)**
5. Use in rules with `XPLAY {id}`

---

## 📝 Rule Syntax Quick Reference

### Common Conditions

| Condition | Description | Example |
|-----------|-------------|---------|
| `AT <loc>` | Player is in room | `AT 5` |
| `NOTAT <loc>` | Player NOT in room | `NOTAT 5` |
| `PRESENT <obj>` | Object in same room | `PRESENT sword` |
| `ABSENT <obj>` | Object NOT in room | `ABSENT key` |
| `CARRIED <obj>` | Player carrying object | `CARRIED torch` |
| `NOTCARR <obj>` | Player NOT carrying | `NOTCARR gold` |
| `WORN <obj>` | Player wearing object | `WORN armor` |
| `NOTWORN <obj>` | Player NOT wearing | `NOTWORN helmet` |
| `VERB "word"` | Player typed verb | `VERB "unlock"` |
| `NOUN1 "word"` | First noun | `NOUN1 "door"` |
| `ADJECT1 "word"` | First adjective | `ADJECT1 "rusty"` |
| `ZERO <flag>` | Flag equals 0 | `ZERO flag_score` |
| `NOTZERO <flag>` | Flag not 0 | `NOTZERO flag_timer` |
| `GT <flag> <val>` | Flag greater than | `GT flag_health 50` |
| `LT <flag> <val>` | Flag less than | `LT flag_fuel 10` |
| `EQ <flag> <val>` | Flag equals | `EQ flag_stage 3` |
| `CHANCE <percent>` | Random chance | `CHANCE 50` (50%) |

### Common Actions

| Action | Description | Example |
|--------|-------------|---------|
| `MES <id>` | Display message | `MES 42` |
| `DESC` | Describe location | `DESC` |
| `GET <obj>` | Pick up object | `GET sword` |
| `DROP <obj>` | Drop object | `DROP torch` |
| `WEAR <obj>` | Wear object | `WEAR armor` |
| `REMOVE <obj>` | Remove worn item | `REMOVE helmet` |
| `CREATE <obj>` | Create object | `CREATE ghost` |
| `DESTROY <obj>` | Destroy object | `DESTROY key` |
| `PLACE <obj> <loc>` | Put in room | `PLACE treasure 10` |
| `GOTO <loc>` | Move player | `GOTO 5` |
| `LET <flag> <val>` | Set flag | `LET flag_score 100` |
| `PLUS <flag> <val>` | Add to flag | `PLUS flag_points 10` |
| `MINUS <flag> <val>` | Subtract from flag | `MINUS flag_health 5` |
| `XPLAY <music>` | Play music/sound | `XPLAY 30` |
| `ANYKEY` | Wait for key | `ANYKEY` |
| `DONE` | End processing | `DONE` |
| `OK` | Success, continue | `OK` |
| `END` | End game | `END` |
| `QUIT` | Quit game | `QUIT` |

---

## 🎵 Music Library Categories

| ID Range | Category | Count | Examples |
|----------|----------|-------|----------|
| 0-9 | UI & Feedback | 10 | Item pickup, success, menu sounds |
| 10-14 | Doors & Objects | 5 | Door open/close, chest, switch |
| 15-19 | Movement | 5 | Footsteps, splash, wind |
| 20-24 | Combat | 5 | Sword swing, hit, enemy sounds |
| 25-29 | Magic | 5 | Spell, teleport, power up/down |
| 30-32 | Victory | 3 | Victory fanfare, level complete |
| 33-34 | Defeat | 2 | Game over, death |
| 35-39 | Ambient | 5 | Mystery, danger, peaceful, suspense |
| 40-41 | Time | 2 | Clock ticking, bell chimes |
| 42-44 | Title/Intro | 3 | Title screen, game start, cutscene |
| 45-49 | Special Events | 5 | Boss, treasure, secrets |

### Popular Tracks

| ID | Name | Use Case |
|----|------|----------|
| 0 | Item Pickup | When player gets an item |
| 2 | Success/Confirm | Puzzle solved, door unlocked |
| 3 | Error/Deny | Invalid action, locked door |
| 10 | Door Open | Opening doors |
| 16 | Footsteps (Walking) | Movement sound |
| 22 | Enemy Appear | Monster encounters |
| 30 | Victory Fanfare | Winning the game |
| 33 | Game Over | Player dies |
| 42 | Title Screen Theme | Game intro |
| 46 | Treasure Found | Finding valuable items |

---

## 🎹 Music Properties

### Tempo (BPM)
- **40-80** - Very slow (sad, suspenseful)
- **80-120** - Moderate (walking, ambient)
- **120-180** - Fast (action, excitement)
- **180-240** - Very fast (panic, chase)

### Shape (Waveform)
- **0-1** - Square wave (pure, retro sound)
- **2-3** - Softer square wave
- **4-5** - Triangle-like (mellower)
- **6-7** - Complex (platform-specific)

### Volume
- **0-5000** - Quiet (background, ambient)
- **5000-10000** - Normal (most effects)
- **10000-15000** - Loud (emphasis, alerts)

### Duration
- **1** - Whole note (longest)
- **2** - Half note
- **4** - Quarter note (standard beat)
- **8** - Eighth note
- **16** - Sixteenth note
- **32** - Thirty-second note (shortest)

### Octave
- **3** - Low (bass, rumble)
- **4** - Middle (standard melody)
- **5** - High (emphasis, bright)
- **6** - Very high (sparkle, alert)

---

## 🚀 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+S** | Save game |
| **Ctrl+Z** | Undo |
| **Ctrl+Shift+Z** | Redo |
| **Ctrl+F** | Search/Filter |
| **Space** | Play/Stop music (Music panel) |
| **Delete** | Delete selected item |

---

## 🎮 Process Tables

| Process | When It Runs | Common Use |
|---------|--------------|------------|
| **PRO0** | User input | Most game logic, verbs |
| **PRO1** | After every turn | Time-based events, auto-descriptions |
| **PRO2** | After success | Consequences, follow-up events |
| **PRO3** | System | Internal DAAD use (rarely used) |

---

## 🔢 System Flags

| Flag | Name | Purpose | Editable |
|------|------|---------|----------|
| **1** | Objects Carried | Auto-counts carried items | No (auto) |
| **37** | Max Carry Objects | Carry limit (default: 4) | Yes (Game Info) |
| **52** | Max Carry Weight | Weight limit (default: 10) | Yes (Game Info) |

---

## 📊 Platform Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Max Locations | 252 | Rooms in game |
| Max Objects | 255 | Items, characters |
| Max Flags | 255 | Variables |
| Max Messages | 255 | Text strings |
| Max Vocabulary | ~200 | Custom words |
| Max Processes/Table | 255 | Rules per process |
| Room Description | ~255 chars | Per location |
| Message Length | ~255 chars | Per message |
| Object Description | ~80 chars | Inventory text |

---

## 🎯 Common Patterns

### Basic Interaction
```
Conditions:
  - VERB "take"
  - NOUN1 "sword"
  - PRESENT sword

Actions:
  - GET sword
  - XPLAY 0  (item pickup sound)
  - MES 10  ("You take the sword")
  - DONE
```

### Locked Door
```
# With key
VERB "unlock", NOUN1 "door", CARRIED key
  → XPLAY 10, MES 20, DESTROY door_locked, CREATE door_open, DONE

# Without key
VERB "unlock", NOUN1 "door", NOTCARR key
  → XPLAY 3, MES 21, DONE
```

### Quest Tracking
```
# Start quest
VERB "help", NOUN1 "wizard", ZERO flag_quest
  → MES 50, LET flag_quest 1, DONE

# Complete quest
CARRIED magic_gem, VERB "give", EQ flag_quest 1
  → XPLAY 30, MES 51, LET flag_quest 2, DONE
```

### Timed Events
```
Process: PRO1 (runs every turn)

Conditions:
  - CARRIED torch
  - NOTZERO flag_fuel

Actions:
  - MINUS flag_fuel 1  (reduce fuel)
  - GT flag_fuel 0
  - DONE

# Torch burns out
CARRIED torch, ZERO flag_fuel
  → XPLAY 28, MES 99, DESTROY torch, DONE
```

### Victory Condition
```
Conditions:
  - CARRIED treasure
  - AT exit_location

Actions:
  - XPLAY 30  (victory music)
  - MES 100  ("You won!")
  - END
```

---

## 🛠️ Compilation

### Platforms & File Types

| Platform | File Extension | Emulator |
|----------|----------------|----------|
| ZX Spectrum 48K/128K | .TAP | Fuse, ZEsarUX |
| Commodore 64 | .PRG | VICE |
| Amstrad CPC | .DSK | WinAPE |
| MSX | .ROM | openMSX |
| Amiga | .ADF | FS-UAE |
| Atari ST | .ST | Hatari |
| MS-DOS | .EXE | DOSBox |

### Compile Checklist

✅ Game title set
✅ All objects have nouns (if takeable)
✅ All room exits valid
✅ Test on emulator
✅ No console errors

---

## 🐛 Debugging Tips

### Rule Not Working?
1. Check conditions are ALL true
2. Verify words in vocabulary
3. Check rule is in PRO0
4. Check rule is enabled
5. Look for earlier rule with DONE

### Music Not Playing?
1. Verify music ID exists
2. Check XPLAY in actions list
3. Test conditions are met
4. Verify volume > 0

### Object Not Appearing?
1. Check object location
2. Verify not DESTROYed
3. Use PRESENT condition
4. Check noun in vocabulary

### Can't Move?
1. Check exits defined
2. Verify destination valid
3. Check no blocking rule
4. Use correct direction

---

## 📚 For More Information

- **Full Manual**: [USER_MANUAL.md](USER_MANUAL.md)
- **Music Library**: [MUSIC_LIBRARY.md](MUSIC_LIBRARY.md)
- **Compiler**: [COMPILER_README.md](COMPILER_README.md)
- **GitHub**: [Issues & Discussions](https://github.com/your-repo/daad-builder)

---

**Quick Reference v1.0** | Last updated: 2026-02-04
