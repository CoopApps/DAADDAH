# DAAD Builder User Manual

## Introduction

DAAD Builder is a modern, visual development environment for creating DAAD (Dizzy's Adventure Designer) adventure games. This manual covers all features and workflows.

## Getting Started

### Installation

1. Ensure Node.js is installed (includes npm)
2. Clone or download the project
3. Run `npm install` to install dependencies
4. Run `npm run tauri dev` to start the application

### First Launch

On first launch, you'll see the Welcome Screen with two options:
- **New Project**: Start a fresh game
- **Load Project**: Open an existing .daad file

## Main Interface

The application has several key areas:

### Header Bar
- **Project Title**: Shows current game name and dirty state (*)
- **Undo/Redo**: Navigate edit history (Ctrl+Z / Ctrl+Shift+Z)
- **Search**: Global search across all game content (Ctrl+F)
- **Load**: Open existing project (Ctrl+O)
- **Save**: Save current project (Ctrl+S)
- **Export**: Export to DAAD format (Ctrl+E)

### Sidebar Navigation

**World Section:**
- Story Info: Game metadata and settings
- Rooms: Location editor and mapper
- Items: Object definitions
- Characters: NPC/character objects

**Logic Section:**
- Responses: Game logic and rules
- Words: Vocabulary management
- Variables: Flag definitions
- Text: Message database
- Music: Music track composer

**Build Section:**
- Play Test: In-browser game testing
- Export: Generate DAAD source files
- Compile: Build platform-specific binaries

## Creating Your First Game

### 1. Game Information

Start in the **Story Info** panel:

- **Title**: Your game's name (max 30 characters)
- **Author**: Your name
- **Version**: Version number
- **Copyright**: Copyright year
- **Company**: Publisher name
- **Intro Text**: Opening text displayed before game starts
- **Max Objects**: Maximum items player can carry (Flag 37)
- **Max Weight**: Maximum weight carried (Flag 52)

### 2. Creating Locations

Navigate to **Rooms** panel:

**Adding a Room:**
1. Click "Add Room" button
2. Room appears in list and on map
3. Click room to select and edit

**Room Properties:**
- **ID**: Automatic, sequential (0, 1, 2...)
- **Name**: Short title (e.g., "Dark Forest")
- **Description**: Full text shown when entering
- **Is Dark**: Check if requires light source
- **Image**: Optional location graphic

**Setting Up Exits:**
1. Select a room from the list
2. Scroll to "Exits" section
3. For each direction, select destination room
4. Click "Create two-way connection?" if you want reverse exit

**Map View:**
- Drag rooms to organize visually
- Zoom with mouse wheel
- Pan by dragging background
- Green lines = two-way connections
- Blue lines = one-way exits

**Best Practices:**
- Start with room 0 (player start location)
- Create logical layouts (map matches description)
- Use two-way exits for most corridors
- One-way exits for traps or special passages

### 3. Adding Objects

Navigate to **Items** panel:

**Creating an Object:**
1. Click "Add Object"
2. Set properties in right panel

**Object Properties:**
- **ID**: Automatic sequential number
- **Noun**: Object name (e.g., "lamp", "key", "sword")
- **Adjective**: Optional descriptor (e.g., "rusty", "golden")
- **Description**: Text shown when examined
- **Weight**: How heavy (affects carrying)
- **Initial Location**: Where object starts
  - At Location: In a specific room
  - Carried: In player's inventory
  - Worn: Being worn by player
  - Limbo: Hidden/not in game yet
  - Inside: In a container object

**Object Flags:**
- **Takeable**: Player can pick up
- **Container**: Can hold other objects
- **Wearable**: Can be worn
- **Light Source**: Illuminates dark rooms
- **Character (PSI)**: Represents an NPC

**Container Properties:**
- Set "Is Container" to true
- Set capacity (weight limit)
- Other objects can be placed inside

**Character Objects:**
- Set "Is Character" to true
- These represent NPCs
- Shown separately in location descriptions

### 4. Building Vocabulary

Navigate to **Words** panel:

**Adding Words:**
1. Click "Add Verb/Noun/Adjective"
2. Enter the word
3. System assigns ID automatically

**Word Types:**

**Verbs (Actions):**
- GET, TAKE, DROP, EXAMINE, OPEN, CLOSE
- USE, PUSH, PULL, TALK, ATTACK
- READ, LIGHT, EXTINGUISH, WEAR, REMOVE

**Nouns (Objects/Things):**
- Must match object nouns
- Also add locations, NPCs, scenery
- Include synonyms (LAMP and LANTERN)

**Adjectives (Descriptors):**
- Must match object adjectives
- Colors, materials, sizes
- RED, WOODEN, SMALL, ANCIENT

**Special ID Ranges:**
- 0-13: Direction verbs (reserved)
- 14-19: Standard verbs
- 20-49: Proper nouns (don't affect IT pronoun)
- 50+: Regular nouns

**Tips:**
- Add all object nouns/adjectives
- Include common synonyms
- Add verbs for all actions you'll handle
- Test parser with vocabulary

### 5. Creating Messages

Navigate to **Text** panel:

**Adding Messages:**
1. Click "Add Message"
2. Enter text content
3. Note the message ID

**Message Types:**

**System Messages (0-53):**
Reserved for DAAD system:
- 0: "OK"
- 1: "I don't understand"
- 2: "I can't do that"
- etc.

**Custom Messages (54+):**
Your game messages:
- Object descriptions
- Puzzle feedback
- Story narration
- NPC dialogue

**Message Formatting:**
- Use \n for line breaks
- Keep messages concise
- Consider screen size (40 columns on 8-bit)
- Test on target platform

**Best Practices:**
- Group related messages
- Use consistent tone
- Number sequentially by game section
- Document message purpose

### 6. Programming Responses

Navigate to **Responses** panel:

**Creating a Response:**
1. Click "Add Response"
2. Choose Process Table (PRO0/PRO1/PRO2)
3. Add Conditions
4. Add Actions
5. Enable/disable as needed

**Process Tables:**
- **PRO0**: Runs every turn (timers, events)
- **PRO1**: High priority player commands
- **PRO2**: Low priority player commands

**Adding Conditions:**
1. Click "Add Condition"
2. Select condition type
3. Fill in parameters
4. Add more conditions (all must be true)

**Adding Actions:**
1. Click "Add Action"
2. Select action type
3. Fill in parameters
4. Actions execute in order

**Example: Taking a Lamp**
```
Process: PRO1
Conditions:
  - AT: GET, LAMP (verb ID 10, noun ID 1)
  - PRESENT: 1 (object 1 is here)
Actions:
  - GET: 1 (take object 1)
  - MESSAGE: 54 ("You take the lamp")
  - DONE (stop processing)
```

**Example: Using Key**
```
Process: PRO1
Conditions:
  - AT: USE, KEY
  - CARRIED: 2 (have key)
  - NOTZERO: 40 (door locked flag)
Actions:
  - MESSAGE: 60 ("Door unlocked")
  - CLEAR: 40 (unlock door)
  - DONE
```

### 7. Managing Flags

Navigate to **Variables** panel:

**System Flags (0-37):**
Pre-defined, don't modify:
- 37: Max objects carried
- 52: Max weight carried
- Others: Internal DAAD use

**Custom Flags (38-255):**
Your game variables:
1. Click "Add Flag"
2. Set ID (38-255)
3. Name it (e.g., "Door Unlocked")
4. Add description
5. Set initial value (0-255)

**Common Uses:**
- Puzzle state (0=locked, 1=unlocked)
- NPC relationships (0-100 scale)
- Turn counters
- Quest progress
- Game endings unlocked

**Flag Best Practices:**
- Document each flag's purpose
- Use 0 for "off/false/not done"
- Use 1+ for "on/true/done"
- Reserve ranges (38-50 for puzzles, etc.)
- Comment your flag usage

### 8. Adding Music

Navigate to **Music** panel:

**Creating a Track:**
1. Click "Add Track"
2. Set name and tempo (BPM)
3. Add notes one by one

**Note Properties:**
- **Note**: C, C#, D, D#, E, F, F#, G, G#, A, A#, B, R (rest)
- **Octave**: 3, 4, 5, 6
- **Duration**: Whole, half, quarter, eighth, sixteenth
- **Dotted**: Extends duration by 50%

**Playing Music:**
Use XPLAY action in responses:
```
Actions:
  - XPLAY: 1 (play track 1)
```

**Platform Notes:**
- Music plays differently on each platform
- Test on target system
- Keep tracks short (memory limited)
- Simple melodies work best

## Testing Your Game

Navigate to **Play Test** panel:

**Starting Test:**
1. Click "Restart Game" to begin
2. Game shows intro and first location
3. Type commands in input box

**Commands:**
- Movement: NORTH, SOUTH, EAST, WEST (or N, S, E, W)
- Actions: GET LAMP, DROP KEY, EXAMINE DOOR
- System: INVENTORY (I), LOOK (L), HELP

**Testing Tips:**
- Test every puzzle thoroughly
- Try wrong solutions
- Check edge cases
- Verify all messages display
- Test with and without objects
- Try all locations
- Test flag conditions

**Debug Mode:**
- Open browser console (F12)
- See location IDs and exit data
- Check response execution
- Verify flag values

## Exporting Your Game

Navigate to **Export** panel:

**Validation:**
System checks for:
- At least one location
- Game title set
- Vocabulary defined
- No circular object references
- Container capacities
- Unreachable locations
- Objects without vocabulary

**Fix Errors:**
Address any red error messages before exporting

**Export Process:**
1. Fix all errors
2. Click "Export DAAD Game"
3. Choose save location
4. Generates .dsf file (DAAD Source Format)

**Export Contents:**
- All locations with exits and descriptions
- All objects with properties
- Complete vocabulary
- All messages
- All responses (rules)
- All flags
- Music tracks
- Platform-specific graphics

## Compiling Your Game

Navigate to **Compile** panel:

**Selecting Platform:**
1. Filter by era (All/Retro/Modern)
2. Click desired platform card
3. View platform details

**Available Platforms:**

**8-bit Retro:**
- ZX Spectrum 48K/128K (.tap)
- Commodore 64 (.prg)
- Amstrad CPC (.dsk)
- MSX (.rom)
- Commodore Plus/4 (.prg)
- Amstrad PCW (.pcw)

**16-bit & Modern:**
- Commodore Amiga (.adf)
- Atari ST (.st)
- MS-DOS (.exe)

**Compilation:**
1. Select target platform
2. Click "Compile to [Platform]"
3. Choose save location
4. Wait for compilation
5. Generated file can run on emulator or real hardware

**Testing Compiled Games:**
- Use appropriate emulator
- Test all platforms you're targeting
- Graphics differ per platform
- Sound/music varies
- Some platforms have more memory

## Keyboard Shortcuts

- **Ctrl+N**: New project
- **Ctrl+O**: Load project
- **Ctrl+S**: Save project
- **Ctrl+E**: Export game
- **Ctrl+Z**: Undo
- **Ctrl+Shift+Z**: Redo
- **Ctrl+F**: Search

## Tips for Success

### Planning
1. **Design on Paper**: Map locations, list objects, outline puzzles
2. **Write Story First**: Know your beginning, middle, end
3. **Keep It Simple**: Start small, expand later
4. **Test Early**: Regular testing prevents big problems

### Building
1. **Create Core Loop**: Make basic movement work first
2. **Add Objects**: Place essential items
3. **Implement Puzzles**: One at a time, test each
4. **Write Responses**: Cover all player actions
5. **Polish Messages**: Improve text quality
6. **Add Flavor**: Music, descriptions, atmosphere

### Testing
1. **Play Through**: Complete game start to finish
2. **Try Everything**: Test all objects, all actions
3. **Break It**: Try to cause errors
4. **Get Feedback**: Have others play
5. **Iterate**: Fix issues, improve experience

### Common Pitfalls
1. **Unreachable Locations**: Ensure all rooms connected
2. **Missing Vocabulary**: Add words for all objects
3. **No DONE Actions**: Remember to end responses
4. **Unclear Puzzles**: Provide hints, test difficulty
5. **Too Complex**: Start simple, add complexity gradually

## Advanced Features

### Container Objects
1. Mark object as container
2. Set capacity
3. Place objects inside using "Inside" location
4. Players can GET objects from containers

### Dark Locations
1. Mark location as "Is Dark"
2. Create light source object
3. Add logic to handle darkness
4. Display "It's too dark" message

### Character NPCs
1. Mark object as Character
2. Place in locations
3. Create dialogue responses
4. Implement NPC movement in PRO0

### Time-Based Events
1. Create counter flag
2. Increment in PRO0 each turn
3. Check threshold in responses
4. Trigger events when reached

### Multiple Endings
1. Use flags to track player choices
2. Check flags at end game
3. Display different end messages
4. Use different END conditions

## Troubleshooting

### Game Won't Load
- Check file format (.daad extension)
- Verify file not corrupted
- Check console for errors

### Movement Not Working
- Verify exits are set correctly
- Check two-way connections
- Ensure destination rooms exist
- Test in Play Test panel

### Objects Not Appearing
- Check object location
- Verify room ID correct
- Ensure not in limbo
- Check visibility conditions

### Responses Not Firing
- Verify vocabulary IDs match
- Check all conditions can be met
- Ensure response is enabled
- Check process table (PRO1 vs PRO2)
- Add DONE to prevent fall-through

### Export Fails
- Fix all validation errors
- Ensure title is set
- Check no empty required fields
- Verify object references valid

### Compilation Errors
- Export successfully first
- Check target platform supported
- Verify game within size limits
- Check console for error details

## Getting Help

1. Read this manual thoroughly
2. Check DAAD_OVERVIEW.md for system details
3. Read DAAD_RESPONSE_SYSTEM.md for rules help
4. Check PROMPT_GUIDE.md for AI assistance
5. Study example games
6. Test frequently in Play Test

## Project File Format

DAAD Builder saves games as .daad files (JSON format) containing:
- All game data
- Location positions on map
- Response configurations
- Flag definitions
- Music data
- Metadata

**File Management:**
- Save regularly (Ctrl+S)
- Keep backups
- Use version numbers in filename
- Export before major changes

## Performance Considerations

**8-bit Platform Limits:**
- Keep object count reasonable (<250)
- Limit active responses
- Simple logic is faster
- Compress messages
- Optimize graphics

**Modern Play Test:**
- No performance concerns
- Full debugging available
- Instant compilation
- Fast iteration

## Final Notes

DAAD Builder provides a complete environment for adventure game creation. Take time to learn each panel, experiment with features, and most importantly, have fun creating your adventure!

For more detailed information on specific topics, refer to:
- DAAD_OVERVIEW.md - System architecture
- DAAD_RESPONSE_SYSTEM.md - Programming guide
- PROMPT_GUIDE.md - AI-assisted development

Happy adventuring!
