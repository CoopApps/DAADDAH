# DAAD Adventure Creator - User Guide

## Welcome to DAAD Adventure Creator! 🎮

A complete, professional-grade development environment for creating text adventure games using the DAAD (Diseñador de Aventuras AD) system.

---

## Quick Start in 5 Minutes

### 1. Launch the Enhanced Editor
Open the **Enhanced DAAD Editor** to access all 35 modules through a modern, intuitive interface.

### 2. Follow the Quick Start Workflow
The dashboard provides 6 essential tasks to get you started:

1. **🔍 Build Conditions** - Define when things happen
2. **⚡ Add Actions** - Define what happens
3. **📋 Create Rules** - Combine conditions and actions
4. **🎯 Visual Flow** - See your logic visually
5. **🎮 Test Game** - Play and debug your adventure
6. **💾 Export Game** - Create playable files

---

## Module Overview

### 🎮 Start Here: Core Systems

#### Conditions Module
**What it does**: Create logical tests that control when rules fire
**Examples**:
- Is the player in the kitchen?
- Does the player have the key?
- Is the score greater than 50?

**How to use**:
1. Select from 50+ condition types
2. Configure parameters (location, object, flag, etc.)
3. Add to your rule

#### Actions Module
**What it does**: Define what happens when conditions are met
**Examples**:
- Display a message
- Move an object
- Change a flag value
- Jump to a different location

**How to use**:
1. Choose from 60+ action types
2. Set parameters
3. Add to your rule

#### Process Tables
**What it does**: Organize your game logic into 4 execution phases
**The 4 Processes**:
- **PRO 0**: Parse player commands
- **PRO 1**: Respond to matched commands
- **PRO 2**: Automatic actions every turn
- **PRO 3**: Display location descriptions

---

### 🌍 World Building

#### Locations & Objects
**Create your game world**:
- Define locations (rooms, areas, scenes)
- Create objects (items, props, treasures)
- Set object properties (weight, location, description)

**Special Locations**:
- **252**: Carried by player
- **253**: Limbo (removed from game)
- **254**: Worn by player

#### Location Connections
**Connect your world**:
- Define exits (north, south, east, west, up, down)
- Create custom connections
- Visual connection editor

#### Inventory System
**Player item management**:
- GET - Pick up items
- DROP - Put down items
- WEAR - Put on wearable items
- REMOVE - Take off worn items

#### Weight System
**Realistic carrying limits**:
- Set object weights
- Configure max carrying capacity
- Encumbrance levels
- Strength-based limits

---

### 💬 Player Communication

#### Display & Formatting
**Screen control**:
- **CLS** - Clear screen
- **NEWLINE** - Add blank line
- **TAB** - Align text to column
- **ANYKEY** - Wait for player keypress

**Professional formatting**:
```daad
CLS
MESSAGE "THE CASTLE THRONE ROOM"
NEWLINE
DESC
NEWLINE
MESSAGE "Score: "
SCORE
TAB 40
MESSAGE "Turns: "
TURNS
```

#### Message Systems
**Text output**:
- Display custom messages
- Use pre-written message tables
- System message integration
- Dynamic text generation

---

### 🏆 Advanced Features

#### Combat Systems
**Create battles**:
- Turn-based combat
- Health/damage system
- Special abilities
- Status effects
- Enemy AI

#### Puzzle Mechanics
**Engaging challenges**:
- Logic puzzles
- Inventory puzzles
- Environmental puzzles
- Timed challenges
- Progressive hints

#### Character Interaction
**NPCs and dialogue**:
- Conversation trees
- Character states
- Relationship tracking
- Dynamic responses
- Quest management

#### Graphics & Sound
**Multimedia enhancement**:
- **PICTURE** command for graphics
- Sound effects via Maluva
- Background music
- Animations
- Visual storytelling

---

### 🔧 Development Tools

#### Game Testing Tools
**Built-in testing**:
- Interactive interpreter
- Command testing
- State inspection
- Step-by-step execution
- Debug mode

#### Debugging Tools
**Find and fix issues**:
- **Breakpoints** - Pause at specific conditions
- **Watchpoints** - Monitor variable changes
- **Step debugging** - Execute line by line
- **State inspector** - See all game state
- **Automated tests** - Run test suites

#### Visual Process Flow
**Understand your logic**:
- Interactive flowchart view
- Rule relationships
- Dependency visualization
- Execution path analysis
- Optimization suggestions

#### Code Generation
**Multi-platform export**:
- ZX Spectrum (48K, 128K)
- Amstrad CPC
- PC/DOS
- Web (JavaScript)
- Modern interpreters

---

## Creating Your First Adventure

### Step 1: Plan Your Game
**Decide on**:
- Story and setting
- Main locations (5-10 to start)
- Key objects and puzzles
- Win/lose conditions

### Step 2: Build the World
1. Open **Locations & Objects** module
2. Create your starting location
3. Add 3-4 connected locations
4. Create 2-3 objects
5. Use **Location Connections** to link rooms

### Step 3: Add Basic Interaction
1. Open **Conditions** module
2. Create a simple condition: "AT starting_room"
3. Open **Actions** module
4. Add action: "MESSAGE 'Welcome to the adventure!'"
5. Open **Process Tables** module
6. Create rule in PRO 2 (auto actions)

### Step 4: Test It!
1. Open **Game Testing Tools**
2. Click "Start Testing"
3. Try commands
4. Check for errors
5. Iterate and improve

### Step 5: Add Depth
1. Create inventory puzzles (key opens door)
2. Add NPCs with **Character Interaction**
3. Implement scoring system with flags
4. Add atmospheric descriptions
5. Create multiple solutions to puzzles

### Step 6: Export and Share
1. Open **Code Generation** module
2. Select target platform
3. Configure optimization level
4. Export game files
5. Test on actual platform/interpreter

---

## Understanding DAAD Basics

### Rules = Conditions + Actions
Every rule follows this pattern:
```daad
IF (conditions are true)
THEN (perform actions)
```

**Example**:
```daad
; If player types "EXAMINE DOOR" while in the hall
AT hall
PRESENT door
VERB examine
NOUN door
THEN
MESSAGE "An old wooden door with iron hinges."
DONE
```

### The 4 Process Tables

**PRO 0 - Parsing**:
- Intercept commands before normal processing
- Custom command handling
- Override default behavior

**PRO 1 - Response**:
- Main game logic
- Respond to player commands
- Most rules go here

**PRO 2 - Automatic Actions**:
- Runs every turn
- Time-based events
- Automatic consequences
- Status updates

**PRO 3 - Descriptions**:
- Location descriptions
- Conditional descriptions
- Enhanced text output

### Flags (Variables)
- **256 flags** numbered 0-255
- Store numbers (0-255)
- Use for: score, health, states, counters, switches
- Operations: SET, CLEAR, PLUS, MINUS, LET

### Special Concepts

**DONE vs NOTDONE**:
- **DONE**: Stop processing, turn is over
- **NOTDONE**: Continue to next rule

**SKIP**:
- Skip the next N rules

**PROCESS**:
- Jump to different process table

---

## Pro Tips for Success

### 1. Start Simple, Add Complexity
Begin with basic rooms and objects. Add advanced features once you understand the basics.

### 2. Test Early and Often
Use the testing tools after every major change. Catch bugs early!

### 3. Use Visual Tools
The Visual Process Flow module helps you understand complex rule interactions.

### 4. Organize Your Rules
Group related rules together in process tables. Use comments to explain logic.

### 5. Plan Your Flags
Document what each flag represents:
```
Flag 0: Player health
Flag 1: Puzzle 1 solved
Flag 2: Dragon defeated
Flag 10-19: Location visited flags
```

### 6. Reuse Message Tables
Store commonly-used text in message tables rather than repeating it.

### 7. Watch Encumbrance
Use the weight system to prevent players from carrying everything.

### 8. Provide Feedback
Always respond to player actions with appropriate messages.

### 9. Allow Multiple Solutions
Give players different ways to solve puzzles (builds replayability).

### 10. Playtest with Others
Fresh eyes will find issues you missed!

---

## Common Patterns and Recipes

### Pattern: Door Lock System
```daad
; Check if door is locked
AT hallway
VERB open
NOUN door
LT door_locked_flag 1
THEN
MESSAGE "The door is locked."
DONE

; Unlock with key
AT hallway
VERB unlock
NOUN door
CARRIED key
THEN
SET door_locked_flag 0
MESSAGE "You unlock the door with the key."
DONE

; Open unlocked door
AT hallway
VERB open
NOUN door
GT door_locked_flag 0
THEN
GOTO throne_room
MESSAGE "You open the door and enter."
DONE
```

### Pattern: NPC Conversation
```daad
; First conversation
AT village
VERB talk
NOUN wizard
LT wizard_talked_flag 1
THEN
SET wizard_talked_flag 1
MESSAGE "The wizard tells you about the quest."
DONE

; Second conversation
AT village
VERB talk
NOUN wizard
EQ wizard_talked_flag 1
THEN
MESSAGE "The wizard says 'Good luck on your quest!'"
DONE
```

### Pattern: Timed Puzzle
```daad
; PRO 2 (runs every turn)
GT timer_active 0
THEN
MINUS timer_active 1
MESSAGE "Time remaining: "
MES timer_active
DONE

; Timer expires
EQ timer_active 0
THEN
MESSAGE "Too late! The bomb explodes!"
; Handle failure
DONE
```

### Pattern: Progressive Hints
```daad
AT puzzle_room
VERB hint
LT hint_level 1
THEN
PLUS hint_level 1
MESSAGE "Try examining the objects carefully."
DONE

AT puzzle_room
VERB hint
EQ hint_level 1
THEN
PLUS hint_level 1
MESSAGE "The book might contain useful information."
DONE

AT puzzle_room
VERB hint
GT hint_level 1
THEN
MESSAGE "Look at page 42 of the book."
DONE
```

---

## Troubleshooting

### Problem: Rules don't fire
**Check**:
- Are conditions correct?
- Is rule in right process table?
- Is earlier rule blocking with DONE?
- Are objects/locations defined correctly?

### Problem: Objects don't appear
**Check**:
- Object location is correct
- Object is not in limbo (253)
- DESC command shows objects
- Object name matches exactly

### Problem: Flags not working
**Check**:
- Flag number is 0-255
- Using correct comparison (EQ, GT, LT)
- Flag value is 0-255
- Flag is initialized properly

### Problem: Movement doesn't work
**Check**:
- GOTO has correct location
- Location exists and is defined
- No blocking conditions
- Location connections are set up

---

## Module Reference Quick Guide

### When to Use Each Module

**Building game world**:
- Locations & Objects
- Location Connections
- Inventory System
- Weight System

**Creating game logic**:
- Conditions
- Actions
- Process Tables
- Flag Management
- Control Flow

**Player interaction**:
- Display & Formatting
- Message Systems
- Character Interaction

**Advanced features**:
- Combat Systems
- Puzzle Mechanics
- Graphics Integration
- Sound (Maluva)

**Testing & debugging**:
- Game Testing Tools
- Debugging Tools
- Visual Process Flow
- Rule Dependencies

**Publishing**:
- Code Generation
- Export Optimization
- Import/Export Tools

---

## Learning Path

### Beginner (Week 1)
1. Enhanced Editor overview
2. Create simple 3-room adventure
3. Basic conditions and actions
4. Simple inventory (get/drop)
5. Test your game

### Intermediate (Week 2-3)
1. Process tables (all 4)
2. Flag system for puzzles
3. Character interaction
4. Graphics and sound
5. More complex puzzles

### Advanced (Week 4+)
1. Combat systems
2. Visual process flow analysis
3. Rule dependencies
4. Export optimization
5. Multi-platform testing

---

## Resources

### In the Editor
- **Quick Start Guide** - Dashboard overview
- **Pro Tips** - Context-sensitive help
- **Examples** - Each module has examples
- **Parameter Help** - Tooltips on every field

### Module Documentation
Each module includes:
- Operation descriptions
- Use case examples
- Code samples
- Best practices

### Community
- Share your adventures
- Get feedback
- Learn from others
- Collaborate on projects

---

## Frequently Asked Questions

### Q: Can I import old DAAD games?
**A**: Yes! Use the Import/Export Tools module to load .SCE or .DDB files.

### Q: Which platform should I target?
**A**: Start with web/JavaScript for widest compatibility. Add retro platforms later.

### Q: How many locations can I have?
**A**: DAAD supports 252 locations (0-251), with special locations at 252-254.

### Q: How do I add graphics?
**A**: Use the Graphics Integration module and the PICTURE command.

### Q: Can I make a combat-heavy game?
**A**: Yes! The Combat Systems module provides comprehensive battle mechanics.

### Q: Is there a limit to rules?
**A**: Practical limit depends on target platform. Modern systems can handle thousands.

### Q: Can I make a commercial game?
**A**: Check DAAD licensing. The creator is for educational/hobbyist use primarily.

### Q: How do I debug complex issues?
**A**: Use the Debugging Tools module with breakpoints and state inspection.

---

## Next Steps

1. **Explore the Enhanced Editor** - Familiarize yourself with the interface
2. **Try the Quick Start** - Follow the 6-step workflow
3. **Study Examples** - Each module has working code samples
4. **Build Something Small** - 3-5 rooms, 1 puzzle, 1 goal
5. **Test and Iterate** - Use testing tools to refine
6. **Share Your Work** - Get feedback and improve

---

## Support

### Getting Help
- Check module documentation (built-in)
- Review code examples in each module
- Use Visual Process Flow to understand logic
- Test frequently with debugging tools

### Reporting Issues
- Use Debug Features to capture state
- Export game for sharing
- Document steps to reproduce
- Check Rule Dependencies for conflicts

---

**Happy Adventure Creating! 🎮✨**

*Created with DAAD Adventure Creator*
*Version 1.0 - Complete System with 35 Modules*
