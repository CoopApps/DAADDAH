# DAAD Builder - User Manual

**Version 1.0**
A modern visual editor for creating DAAD (Diseño de Aventuras AD) text adventure games for retro platforms.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Game Info Panel](#game-info-panel)
4. [Locations (Rooms)](#locations-rooms)
5. [Objects (Items)](#objects-items)
6. [Characters (NPCs)](#characters-npcs)
7. [Vocabulary (Words)](#vocabulary-words)
8. [Rules (Responses)](#rules-responses)
9. [Flags (Variables)](#flags-variables)
10. [Messages](#messages)
11. [Music & Sound Effects](#music--sound-effects)
12. [Compiling Your Game](#compiling-your-game)
13. [Tips & Best Practices](#tips--best-practices)
14. [Troubleshooting](#troubleshooting)

---

## Introduction

### What is DAAD?

DAAD (Diseño de Aventuras AD) is a classic adventure game creation system from the 1980s and 1990s, originally designed for creating text adventure games on retro platforms like:

- ZX Spectrum 48K/128K
- Commodore 64
- Amstrad CPC
- MSX
- Amiga
- Atari ST
- MS-DOS

### What is DAAD Builder?

DAAD Builder is a modern **visual editor** that makes creating DAAD games easy:

- **No coding required** - Visual editors for all game elements
- **Live preview** - See your game as you build it
- **Native compiler** - Built-in Rust compiler generates platform binaries
- **Cross-platform** - Runs on Windows, Mac, and Linux
- **Music library** - 50 pre-composed sound effects and music tracks

---

## Getting Started

### Creating Your First Game

1. **Launch DAAD Builder**
2. **Game Info panel** opens by default
3. **Enter your game title** (required)
4. **Set author name** (optional)
5. **Start adding content** using the panels on the left

### Interface Overview

```
┌─────────────────────────────────────────┐
│  [Game Info] [Locations] [Objects]...   │  ← Panel Tabs
├─────────────┬───────────────────────────┤
│             │                           │
│  Item List  │   Editor Area            │
│  (sidebar)  │   (main content)         │
│             │                           │
│  - Room 0   │   [Edit fields here]     │
│  - Room 1   │                          │
│  - Room 2   │                          │
│             │                           │
└─────────────┴───────────────────────────┘
```

### Quick Actions

From the **Game Info** panel, you can quickly create:
- **+ New Room** - Creates a location and opens Locations panel
- **+ New Item** - Creates an object and opens Objects panel
- **+ New Response** - Creates a rule and opens Rules panel
- **+ New Variable** - Creates a flag and opens Flags panel

---

## Game Info Panel

The Game Info panel contains your game's metadata and statistics.

### Required Fields

- **Game Title** - The name of your adventure (required, shown in red if empty)

### Optional Fields

- **Author** - Your name
- **Version** - Version number (default: "1.0")
- **Part Number** - For multi-part games like "PART1", "PART2" (default: 1)

### Game Limits

- **Max Carry Objects (Flag 37)** - How many items the player can carry at once (1-255, default: 4)
- **Max Carry Weight (Flag 52)** - Maximum total weight the player can carry (1-255, default: 10)

### Intro Text

Optional text displayed when the game starts, before the first room description. Maximum 1024 characters.

### Statistics

The top of the panel shows:
- **Rooms** - Total locations in your game
- **Items** - Total objects
- **Responses** - Total rules
- **Variables** - Total flags
- **Messages** - Total messages

---

## Locations (Rooms)

Locations are the rooms/places in your adventure game.

### Creating a Location

1. Click **+ New Room** button
2. Edit the **Name** (e.g., "Dark Forest")
3. Write a **Description** (what the player sees)
4. Set **Exits** to connect rooms

### Location Properties

**Basic Info:**
- **ID** - Unique number (auto-assigned)
- **Name** - Short name for the room
- **Description** - What the player sees when entering
- **Dark** - If checked, room is dark unless player has light source

**Exits:**
Connect to other rooms using compass directions:
- **Cardinal**: North, South, East, West
- **Diagonal**: Northeast, Northwest, Southeast, Southwest
- **Vertical**: Up, Down
- **Other**: In, Out

**Visual Map:**
- **X, Y coordinates** - Position on the map (for visual reference only)

### Example Location

```
Name: Entrance Hall
Description: A grand entrance hall with marble floors.
            A chandelier hangs overhead. Passages lead
            north and east.

Exits:
  North → Kitchen (Room 1)
  East → Library (Room 2)
```

### Tips

- Use **evocative descriptions** - "A musty library filled with ancient tomes" not just "Library"
- Connect rooms **logically** - If north leads to the kitchen, south from kitchen should return
- Mark rooms **dark** where appropriate - caves, nighttime outdoor areas
- Use **diagonal exits** sparingly - they can confuse players

---

## Objects (Items)

Objects are items the player can interact with.

### Creating an Object

1. Click **+ New Item** button
2. Set **Noun** and optionally **Adjective**
3. Write a **Description**
4. Set **Location** (where it starts)
5. Configure **Properties**

### Object Properties

**Identification:**
- **ID** - Unique number
- **Noun** - The main word (e.g., "sword", "key")
- **Adjective** - Optional descriptor (e.g., "rusty", "golden")
- **Description** - What appears in inventory/on ground
- **Icon** - Emoji to represent the object (optional)

**Physical Properties:**
- **Weight** - How heavy (affects carrying capacity)
- **Takeable** - Can the player pick it up?
- **Wearable** - Can the player wear it?
- **Container** - Can hold other objects?

**Special Properties:**
- **Light Source** - Illuminates dark rooms
- **PSI** (Proper Name) - Doesn't need article ("Get Excalibur" not "Get the Excalibur")

**Location:**
Where the object starts:
- **Limbo** - Not in game world (created by rules)
- **Room X** - Specific location
- **Carried** - Player starts with it
- **Worn** - Player starts wearing it
- **Container X** - Inside another object

### Example Objects

```
Object 0: Golden Key
  Noun: "key"
  Adjective: "golden"
  Description: "a golden key"
  Icon: 🔑
  Weight: 1
  Location: Room 5 (Dungeon)
  Takeable: Yes

Object 1: Magic Sword
  Noun: "sword"
  Adjective: "magic"
  Description: "a gleaming magic sword"
  Icon: ⚔️
  Weight: 5
  Location: Limbo
  Takeable: Yes
  Light Source: Yes (glows!)
```

### Tips

- Use **clear nouns** players will type - "sword" not "blade"
- Add **adjectives** for similar items - "brass key", "iron key"
- Set **realistic weights** - coin=1, sword=5, boulder=50
- Use **icons** for visual appeal
- **Light sources** make dark room puzzles interesting

---

## Characters (NPCs)

Characters are non-player characters the player can interact with.

### Creating a Character

1. Click **+ New Character** button
2. Select the **Object** that represents this character
3. Add **Dialogue** options

### Character Properties

**Identity:**
- **Object** - Which object represents this NPC (must have NOUN set)
- **Name** - Display name (taken from object description)

**Dialogue:**
Characters can have multiple dialogue options. Each has:
- **Trigger** - What the player says/does
- **Response** - What the character says back
- **Conditions** - Optional requirements (has item, flag set, etc.)

### Example Character

```
Character: Wizard (Object 10)
  Object: "wizard"
  Icon: 🧙

  Dialogue 1:
    Trigger: "hello"
    Response: "Greetings, traveler. Seek you the Crystal of Power?"

  Dialogue 2:
    Trigger: "quest"
    Response: "Find the three keys and I shall reward you."

  Dialogue 3:
    Trigger: "keys" (requires CARRIED key1, key2, key3)
    Response: "Well done! Here is the Crystal of Power."
    Action: CREATE crystal, DESTROY key1, DESTROY key2, DESTROY key3
```

### Tips

- Create the **object first**, then the character
- Use **varied dialogue** for different triggers
- Add **conditional dialogue** based on game progress
- Give **helpful hints** without giving away solutions

---

## Vocabulary (Words)

Vocabulary defines the words the player can type.

### Word Types

**Verbs** - Actions (VERB)
- Examples: EXAMINE, TAKE, DROP, OPEN, CLOSE, ATTACK

**Nouns** - Objects (NOUN)
- Examples: SWORD, KEY, DOOR, WIZARD

**Adjectives** - Descriptors (ADJECT)
- Examples: GOLDEN, RUSTY, OLD, MAGIC

**Adverbs** - Action modifiers (ADVERB)
- Examples: CAREFULLY, QUICKLY, SLOWLY

**Prepositions** - Relationships (PREP)
- Examples: WITH, TO, FROM, UNDER

**Conjunctions** - Connectors (CONJUNC)
- Examples: AND, THEN, BUT

### Built-in Words

DAAD includes common words by default:
- Verbs: NORTH, SOUTH, EAST, WEST, UP, DOWN, GET, DROP, EXAMINE, etc.
- Nouns: ALL, EVERYTHING
- Words like THE, A, AN (ignored automatically)

### Adding Custom Words

1. Go to **Vocabulary** panel
2. Click **+ Add Word**
3. Enter the **word**
4. Select **type** (VERB, NOUN, etc.)
5. Optional: Add **synonym ID** (for multiple words meaning the same thing)

### Example Vocabulary

```
Verbs:
  - UNLOCK (custom action)
  - BURN (custom action)
  - CAST (for magic spells)

Nouns:
  - TORCH (for "torch" object)
  - MATCHES (for "matches" object)
  - SPELL (for magic system)

Adjectives:
  - MAGIC (for "magic sword", "magic wand")
  - RUSTY (for "rusty key")
```

### Tips

- Add words **players will naturally type**
- Use **synonyms** - "GET" and "TAKE" should do the same thing
- Test with **friends** - they'll try words you didn't think of
- **Don't over-define** - DAAD handles common words already

---

## Rules (Responses)

Rules define what happens when the player does something. They're the "programming" of your game.

### Creating a Rule

1. Click **+ New Response**
2. Add **Conditions** (what must be true)
3. Add **Actions** (what happens)
4. Choose **Process** (when it runs)

### Rule Structure

```
IF <conditions are true>
THEN <perform actions>
```

### Process Tables

Rules run in one of 4 processes:

**PRO0** - User input
- Runs when player types a command
- Most game logic goes here

**PRO1** - After every turn
- Runs after player's command finishes
- Good for: time-based events, automatic descriptions

**PRO2** - After successful command
- Only runs if PRO0 returned DONE/OK
- Good for: consequences, follow-up events

**PRO3** - System process
- Internal DAAD use
- Rarely used in custom games

### Common Conditions

**Player Location:**
- `AT <location>` - Player is in room X
- `NOTAT <location>` - Player is NOT in room X

**Object Location:**
- `PRESENT <object>` - Object is in same room as player
- `ABSENT <object>` - Object is NOT in room
- `CARRIED <object>` - Player is carrying object
- `NOTCARR <object>` - Player is NOT carrying object
- `WORN <object>` - Player is wearing object
- `NOTWORN <object>` - Player is NOT wearing object

**Player Input:**
- `VERB "<verb>"` - Player typed this verb
- `NOUN1 "<noun>"` - First noun matches
- `ADJECT1 "<adj>"` - First adjective matches

**Flags (Variables):**
- `ZERO <flag>` - Flag equals 0
- `NOTZERO <flag>` - Flag is not 0
- `GT <flag> <value>` - Flag greater than value
- `LT <flag> <value>` - Flag less than value
- `EQ <flag> <value>` - Flag equals value

**Probability:**
- `CHANCE <percent>` - Random chance (0-100%)

### Common Actions

**Messages:**
- `MES <id>` - Display message
- `DESC` - Describe current location
- `ANYKEY` - Wait for keypress

**Object Manipulation:**
- `GET <object>` - Player picks up object
- `DROP <object>` - Player drops object
- `WEAR <object>` - Player wears object
- `REMOVE <object>` - Player removes worn object
- `CREATE <object>` - Bring object into existence
- `DESTROY <object>` - Remove object from game
- `PLACE <object> <location>` - Put object in room

**Player Movement:**
- `GOTO <location>` - Move player to room

**Flag Manipulation:**
- `LET <flag> <value>` - Set flag to value
- `PLUS <flag> <value>` - Add to flag
- `MINUS <flag> <value>` - Subtract from flag

**Control Flow:**
- `DONE` - End processing (success)
- `OK` - Success (continue to PRO2)
- `END` - End game
- `QUIT` - Quit game

**Music:**
- `XPLAY <music>` - Play music/sound effect

### Example Rules

**Basic interaction:**
```
Rule: "Unlock door with key"
Process: PRO0
Conditions:
  - VERB "unlock"
  - NOUN1 "door"
  - CARRIED key
Actions:
  - XPLAY 10 (door open sound)
  - MES 5 ("You unlock the door")
  - DESTROY door_locked
  - CREATE door_open
  - DONE
```

**Time-based event:**
```
Rule: "Lamp burns out"
Process: PRO1 (runs every turn)
Conditions:
  - CARRIED lamp
  - GT flag_turns_with_lamp 50
Actions:
  - MES 99 ("The lamp flickers and dies")
  - DESTROY lamp
  - CREATE dead_lamp
  - DONE
```

**Victory condition:**
```
Rule: "Win game"
Process: PRO0
Conditions:
  - CARRIED treasure
  - AT exit
Actions:
  - XPLAY 30 (victory music)
  - MES 100 ("You escape with the treasure!")
  - MES 101 ("You won!")
  - END
```

### Tips

- **Test frequently** - Rules can have unexpected interactions
- **Use DONE** - Prevents other rules from running afterward
- **Order matters** - Rules run in ID order, put specific rules before general ones
- **Debug with messages** - Add temporary MES to see what's happening
- **Use flags for state** - Track puzzle progress, quest status, etc.

---

## Flags (Variables)

Flags are variables that store numbers (0-255). Use them to track game state.

### System Flags (Read-Only)

These are automatically managed by DAAD:

**Flag 1** - Objects Carried
- Automatically counts how many objects player carries
- Used by GET/DROP to enforce carry limit

**Flag 37** - Max Carry Objects
- How many objects player can carry (default: 4)
- You can change this in Game Info panel

**Flag 52** - Max Carry Weight
- Maximum total weight player can carry (default: 10)
- You can change this in Game Info panel

### Creating Custom Flags

1. Click **+ New Variable**
2. Enter a **name** (e.g., "torch_turns_remaining")
3. Set **initial value** (default: 0)
4. Add a **description** (optional, but recommended)

### Using Flags

**Check flag value:**
```
Conditions:
  - GT flag_score 100  (if score > 100)
  - ZERO flag_wizard_talked  (if never talked to wizard)
```

**Modify flag:**
```
Actions:
  - LET flag_score 0  (set score to 0)
  - PLUS flag_score 10  (add 10 points)
  - MINUS flag_health 5  (lose 5 health)
```

### Example Flags

```
Flag 10: torch_fuel
  Description: "Turns remaining before torch burns out"
  Initial Value: 50

Flag 11: quest_stage
  Description: "0=not started, 1=accepted, 2=complete"
  Initial Value: 0

Flag 12: dragon_health
  Description: "Dragon's remaining health points"
  Initial Value: 100

Flag 13: player_score
  Description: "Player's current score"
  Initial Value: 0
```

### Tips

- Use **meaningful names** - "quest_stage" not "flag10"
- Add **descriptions** - your future self will thank you
- **Document ranges** - "0-3 for difficulty level"
- **Initialize properly** - Set starting values carefully
- Use for **counters, timers, scores, quest states**

---

## Messages

Messages are text displayed to the player. Centralizing them makes translation and editing easier.

### Creating Messages

1. Go to **Messages** panel
2. Click **+ New Message**
3. Enter the **text**
4. Note the **ID** assigned

### Using Messages

In rules, use the `MES` action:

```
Actions:
  - MES 5  (displays message 5)
```

### Example Messages

```
Message 0: "It's too dark to see anything."
Message 1: "You can't carry any more items."
Message 2: "The door is locked."
Message 3: "You don't have the key."
Message 4: "The door creaks open."
Message 5: "Nothing happens."
```

### Tips

- Keep messages **under 255 characters**
- Use **consistent tone** - formal or casual, not mixed
- Add **color with adjectives** - "rusty key" not just "key"
- **Number logically** - group related messages (0-9 system, 10-19 doors, etc.)
- **Test readability** - read them out loud

---

## Music & Sound Effects

DAAD Builder includes a comprehensive music library with 50 pre-composed tracks.

### Importing from Library

1. Open the **Music** panel
2. Click **📚 Library** button
3. **Preview tracks** - Click the ▶ play button on any track to hear it before importing
4. Select a **category**:
   - All Tracks (50)
   - UI & Feedback (10) - Item pickup, success, errors, achievements
   - Doors & Objects (5) - Door sounds, chest opening, switches
   - Movement & Environment (5) - Footsteps, water, wind
   - Combat & Danger (5) - Sword swings, hits, enemy sounds
   - Magic & Special (5) - Spells, teleport, power up/down
   - Victory & Success (3) - Victory fanfares, completion music
   - Defeat & Game Over (2) - Death, game over themes
   - Ambient & Atmosphere (5) - Mystery, danger, peaceful, suspense
   - Clock & Time (2) - Ticking, bell chimes
   - Title & Intro (3) - Title screen, game start, cutscenes
   - Special Events (5) - Boss battles, treasure, secrets
4. **Check boxes** to select tracks you want
5. **Preview before importing** - Use the ▶ button to listen to each track
6. Click **Import X Track(s)**
7. Tracks are added with new unique IDs

### Creating Custom Music

1. Click **+ New Music**
2. Set **name, tempo, shape, volume**
3. Use the **piano keyboard** to add notes
4. Click **▶ Play** to preview
5. Adjust **duration** and **dotted** for note timing

### Music Properties

**Tempo** - Speed in BPM (40-240)
- 60 = slow, 120 = moderate, 180 = fast

**Shape** - Waveform (0-7)
- 0-3: Square waves with different duty cycles
- 4-7: Platform-specific complex waveforms

**Volume** - Loudness (0-15000)
- 5000 = quiet, 10000 = normal, 15000 = loud

**Notes** - Musical sequence
- **Pitch**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B, R (rest)
- **Octave**: 3 (low) to 6 (high), 4 is middle
- **Duration**: 1 (whole), 2 (half), 4 (quarter), 8 (eighth), 16, 32
- **Dotted**: Extends note by 50%

### Using Music in Rules

Use the **XPLAY** action:

```
Rule: "Open door"
Conditions:
  - VERB "open"
  - NOUN1 "door"
  - CARRIED key
Actions:
  - XPLAY 10  (plays music track 10 - "Door Open")
  - MES 15
  - DONE
```

### Cross-Platform Compatibility

Music compiles to platform-specific formats:
- **ZX Spectrum** - Beeper (square wave)
- **Commodore 64** - SID chip
- **Amstrad CPC** - AY-3-8912 PSG
- **MSX** - PSG
- **Amiga** - Paula audio chip
- **PC** - PC speaker / Sound Blaster

You compose once, it plays everywhere!

### Example Music Usage

```
Rule: "Game start"
  XPLAY 42  (Title Screen Theme)

Rule: "Player picks up item"
  XPLAY 0  (Item Pickup sound)

Rule: "Unlock puzzle"
  XPLAY 6  (Unlock/Solve Puzzle)

Rule: "Victory"
  XPLAY 30  (Victory Fanfare)

Rule: "Game over"
  XPLAY 33  (Game Over theme)

Rule: "Walking"
  XPLAY 16  (Footsteps Walking)

Rule: "Enemy appears"
  XPLAY 22  (Enemy Appear sound)
```

### Tips

- **Import selectively** - Only add tracks you'll use
- **Consistent volume** - Keep similar loudness across tracks
- **Preview before use** - Play tracks to ensure they fit
- **Document in rules** - Add comments showing which music plays when
- **Test on target platform** - Different platforms sound slightly different

For complete music library documentation, see [MUSIC_LIBRARY.md](MUSIC_LIBRARY.md).

---

## Compiling Your Game

Once your game is complete, compile it to run on retro platforms.

### Compilation Steps

1. Go to **Compile** panel
2. Select **target platform**:
   - ZX Spectrum 48K (.TAP)
   - ZX Spectrum 128K (.TAP)
   - Commodore 64 (.PRG)
   - Amstrad CPC (.DSK)
   - MSX (.ROM)
   - Amiga (.ADF)
   - Atari ST (.ST)
   - MS-DOS (.EXE)
3. Click **Compile**
4. Choose **save location**
5. Wait for compilation
6. Your game file is ready!

### Testing Your Game

**On Emulator:**
1. Download appropriate emulator:
   - **ZX Spectrum**: Fuse, ZEsarUX
   - **C64**: VICE
   - **Amstrad CPC**: WinAPE
   - **MSX**: openMSX
2. Load your compiled file
3. Play and test!

**On Real Hardware:**
1. Transfer file to appropriate media:
   - **Spectrum**: Load via tape interface or SD card
   - **C64**: Copy to disk image
2. Load on real machine
3. Experience authentic retro gaming!

### Common Compilation Errors

**"Game title is required"**
- Fix: Enter a title in Game Info panel

**"Object X has no noun defined"**
- Fix: Give all takeable objects a NOUN

**"Location X has invalid exit"**
- Fix: Ensure all exits point to valid room IDs

**"Flag numbering gap"**
- Fix: DAAD requires consecutive flag numbering

### Output Files

Different platforms create different file types:

- **.TAP** - ZX Spectrum tape image
- **.PRG** - C64 program file
- **.DSK** - Amstrad CPC disk image
- **.ROM** - MSX cartridge image
- **.ADF** - Amiga floppy disk image
- **.ST** - Atari ST disk image
- **.EXE** - MS-DOS executable

For technical compiler details, see [COMPILER_README.md](COMPILER_README.md).

---

## Tips & Best Practices

### Game Design

**Start Small**
- Begin with 5-10 rooms
- Add more once core gameplay works
- Don't overwhelm yourself

**Test Frequently**
- Compile and test every few hours
- Catch bugs early
- Get friend feedback

**Write Down Puzzles**
- Plan on paper first
- Ensure solutions are logical
- Avoid "guess the verb" puzzles

**Use Flags for State**
- Track quest progress
- Remember player actions
- Enable/disable features

### Writing Style

**Be Descriptive**
- Paint word pictures
- Engage the senses (sounds, smells)
- Create atmosphere

**Be Clear**
- Avoid ambiguity
- Give subtle hints
- Don't frustrate players

**Be Consistent**
- Use same tone throughout
- Keep vocabulary consistent
- Maintain logical world rules

### Technical Tips

**Organize Your IDs**
- Keep related items sequential
- Document in comments
- Use meaningful flag names

**Optimize for Memory**
- Retro platforms have limited RAM
- Keep descriptions concise
- Don't create unused objects

**Test Edge Cases**
- Try typing unusual commands
- Test with full/empty inventory
- Try doing things out of order

### Common Pitfalls

**Don't:**
- Create objects without nouns
- Make puzzles with only one solution
- Forget to test on actual platform
- Use extremely long descriptions
- Create unwinnable states without warning

**Do:**
- Add lots of vocabulary
- Provide multiple ways to solve puzzles
- Give helpful error messages
- Test with fresh players
- Save frequently during development

---

## Troubleshooting

### Game Won't Compile

**Check:**
- Game title is set
- All objects have nouns (if takeable)
- All room exits point to valid rooms
- No missing required fields

### Music Won't Play

**Check:**
- Music track ID exists
- XPLAY action is in rule's action list
- Rule conditions are being met
- Platform supports music (all do, but volume varies)

### Objects Won't Appear

**Check:**
- Object location is set correctly
- Object hasn't been DESTROYed
- Player is in same room (use PRESENT condition)
- Object noun is in vocabulary

### Player Can't Move

**Check:**
- Room exits are defined
- Exits point to valid room IDs
- No rule blocking movement
- Using correct direction names

### Rule Not Triggering

**Check:**
- Conditions are all true
- Words are in vocabulary
- Rule is in correct process (usually PRO0)
- Rule is enabled
- No earlier rule using DONE

### Game Crashes on Platform

**Check:**
- All IDs are consecutive
- No extremely long text strings
- Memory limits for platform
- Valid DAAD bytecode (compile should validate)

### Getting Help

**Resources:**
- Original DAAD manual: [DAAD docs](https://github.com/daad-adventure-writer/daad)
- DAAD community: Retro adventure game forums
- This builder's GitHub: [Issues](https://github.com/your-repo/issues)

**Debug Tips:**
- Add MES actions to see rule flow
- Check flag values during play
- Simplify complex conditions
- Test one feature at a time

---

## Keyboard Shortcuts

### Global
- **Ctrl+S** - Save game
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z** - Redo
- **Ctrl+F** - Search (in lists)

### Music Panel
- **Space** - Play/Stop music
- **Delete** - Remove selected note
- **Arrow Keys** - Navigate piano keyboard

### Rule Editor
- **Tab** - Next field
- **Enter** - Add condition/action

---

## Appendix: DAAD Limits

### Platform Constraints

**All Platforms:**
- Max locations: 252
- Max objects: 255
- Max flags: 255
- Max messages: 255
- Max vocabulary: ~200 words
- Max processes: 255 per table

**Text Limits:**
- Room description: ~255 chars
- Message: ~255 chars
- Object description: ~80 chars

**Memory Limits (approximate):**
- ZX Spectrum 48K: ~40KB for game
- Commodore 64: ~45KB for game
- Others: Varies

### Best Practices

- Keep total game under 40KB for maximum compatibility
- Test on ZX Spectrum 48K (most constrained platform)
- Use concise descriptions
- Reuse messages where possible

---

## Credits & License

**DAAD Builder** - Modern visual editor
**DAAD System** - Andrés Samudio (public domain)
**Official Interpreters** - DAAD Adventure Writer team
**Music Library** - Original compositions for DAAD Builder

### License

See LICENSE file for details.

---

## Version History

**1.0** (2026)
- Initial release
- Visual editors for all game elements
- Native Rust compiler
- 50-track music library
- 9 platform targets

---

**Happy Adventuring!** 🎮

For the latest updates and community support, visit:
https://github.com/your-repo/daad-builder
