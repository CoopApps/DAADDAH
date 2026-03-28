# DAAD Builder AI Prompt Guide

## Purpose

This guide helps you create effective prompts when working with AI assistants (like Claude) to develop DAAD adventure games. It explains how to structure requests for best results.

## Understanding the System

Before prompting, understand these key concepts:

### DAAD is Simple But Limited
- Two-word parser (VERB NOUN)
- Integer math only (0-255)
- No strings manipulation
- No arrays or complex data structures
- Turn-based, not real-time
- Response-based logic (IF/THEN)

### The Builder's Scope
This implementation provides:
- Visual editors for all game elements
- Location mapper with drag-and-drop
- Integrated play testing
- Export to DAAD source format
- Compilation to retro platforms
- Modern development workflow

## Effective Prompting Strategies

### 1. Be Specific About Game Type

**Good Prompts:**
```
"Create a mystery adventure game where the player investigates a
haunted mansion. Include 15 rooms, 10 objects, and 3 puzzles
involving keys, a portrait, and a secret passage."
```

**Poor Prompts:**
```
"Make an adventure game"
```

**Why:** Specificity helps AI understand scope, theme, and requirements.

### 2. Describe Locations Clearly

**Good Prompts:**
```
"Create a location called 'Dusty Library' with exits north to
'Main Hall' and east to 'Secret Study'. Description should mention
old books, a fireplace, and a mysterious painting. Make it dark
and require a candle to see."
```

**Poor Prompts:**
```
"Add a library room"
```

**Why:** Details help create atmosphere and logical connections.

### 3. Define Objects With Purpose

**Good Prompts:**
```
"Create a 'rusty key' object that weighs 1, starts in the 'Garden',
and is used to unlock the door to the basement. It should be
takeable and have the noun 'key' and adjective 'rusty'."
```

**Poor Prompts:**
```
"Add a key"
```

**Why:** Specifies all necessary properties and gameplay purpose.

### 4. Explain Puzzle Logic Step-by-Step

**Good Prompts:**
```
"Create a puzzle where:
1. Player must GET CANDLE from Kitchen (object 5)
2. Player must GET MATCHES from Bedroom (object 6)
3. In the Dark Cellar, player types LIGHT CANDLE
4. This sets flag 40 to 1 (candle lit)
5. While flag 40 is 1, player can see in dark rooms
6. After 20 turns, flag 40 becomes 0 (candle burns out)
7. Display message 'The candle flickers out' when this happens"
```

**Poor Prompts:**
```
"Make a puzzle with a candle"
```

**Why:** Step-by-step logic ensures correct response implementation.

### 5. Request Complete Response Definitions

**Good Prompts:**
```
"Create a PRO1 response that:
- Triggers on: UNLOCK DOOR (verb 15, noun 12)
- Requires: Player is carrying key (object 3)
- Requires: Player is at location 5 (Basement Door)
- Requires: Door is locked (flag 38 equals 0)
- Actions:
  1. Display message 55 ('You unlock the door')
  2. Set flag 38 to 1 (door unlocked)
  3. DONE"
```

**Poor Prompts:**
```
"Add a response for unlocking the door"
```

**Why:** Complete specification prevents errors and ambiguity.

## Common Prompt Patterns

### Creating a New Game
```
"I want to create a [genre] adventure game with [theme].
The game should have:
- [N] locations in a [layout description]
- [N] objects that [purpose]
- [N] puzzles involving [mechanics]
- Story: [brief plot summary]
- Difficulty: [easy/medium/hard]
- Target platform: [platform]

Start by creating the basic location structure."
```

### Adding a Location
```
"Create location [ID]: '[Name]'
- Description: [full text]
- Dark: [yes/no]
- Exits: [direction] to [location name/ID]
- Objects here: [list]
- Position on map: [x, y] or [relative description]"
```

### Creating an Object
```
"Create object [ID]: [adjective] [noun]
- Description: [exam text]
- Initial location: [where]
- Weight: [number]
- Properties: [takeable/container/wearable/light/character]
- Purpose: [gameplay role]"
```

### Implementing a Puzzle
```
"Implement puzzle: [puzzle name]
1. Setup: [initial state]
2. Requirements: [what player needs]
3. Action: [what player does]
4. Success: [what happens]
5. Failure: [error messages]
6. Flags used: [flag numbers and meanings]"
```

### Adding Vocabulary
```
"Add vocabulary for [purpose]:
Verbs: [list with IDs if specific]
Nouns: [list matching objects]
Adjectives: [list matching object modifiers]"
```

### Creating Responses
```
"Create a [PRO0/PRO1/PRO2] response:
Description: [what it does]
Conditions:
- [condition type]: [parameters]
- [condition type]: [parameters]
Actions:
- [action type]: [parameters]
- [action type]: [parameters]
- DONE"
```

### Debugging Issues
```
"I have a problem with [feature]:
Current behavior: [what happens]
Expected behavior: [what should happen]
Game state when occurs: [location, flags, inventory]
Relevant responses: [list IDs if known]
Console errors: [paste errors]"
```

## Domain-Specific Vocabulary

Use these terms when prompting:

### Locations
- Location, Room, Place
- Exit, Connection, Path
- Two-way link, One-way exit
- Dark room, Lit room

### Objects
- Object, Item, Thing
- Noun, Adjective
- Takeable, Container, Wearable
- Light source, Character, PSI
- Location: at/carried/worn/limbo/inside

### Logic
- Response, Rule, Entry
- Condition, Action
- Process table: PRO0/PRO1/PRO2
- Flag, Variable
- Done, Not done

### Vocabulary
- Verb, Noun, Adjective
- Parser, Command
- Word ID, Vocabulary entry

### Game Flow
- Turn, Game loop
- Player input, Command
- Message, Text, Description
- Game state, Save state

## Example Full Game Prompt

```
"Create a short fantasy adventure game called 'The Wizard's Tower':

STORY:
The player is an apprentice wizard who must reach the top of
their master's tower to retrieve a magic spell book. Three
puzzle rooms block the way.

LOCATIONS (8 total):
0. Tower Entrance - Starting point, exits north
1. Guard Room - Has a sleeping guard (character), exits north and south
2. Library - Contains spell book (goal), exits south and up
3. Spiral Stairs - Connects floors, exits down and up
4. Locked Door - Needs key, exits down and up (when unlocked)
5. Magic Circle - Teleportation puzzle, exits down
6. Treasure Room - Contains key, exits east
7. Secret Passage - Hidden exit from Guard Room, exits west and north

OBJECTS (6 total):
0. rusty key - In Treasure Room, unlocks door, weight 1
1. spell book - In Library, goal item, weight 2
2. magic wand - Starts in inventory, used for spells, weight 1
3. silver coin - In entrance, used in guard room, weight 1
4. torch - In entrance, light source for dark rooms, weight 1
5. guard - Character, blocks north exit, can be bribed

PUZZLES:
1. Bribe Guard: Give coin to guard to pass (room 1)
2. Unlock Door: Find key in treasure room to unlock door (room 4)
3. Magic Circle: Use wand on circle to teleport (room 5)

FLAGS:
38. Guard bribed (0=no, 1=yes)
39. Door unlocked (0=locked, 1=unlocked)
40. Circle activated (0=no, 1=yes)

Start by creating all locations with their connections,
then add the objects, then implement the puzzle logic
with responses."
```

## Tips for Iterative Development

### Start Small
1. First prompt: Basic structure (locations only)
2. Second prompt: Add objects
3. Third prompt: Add vocabulary
4. Fourth prompt: Implement first puzzle
5. Continue adding features incrementally

### Test Between Prompts
After each AI response:
1. Test in Play Test panel
2. Identify issues
3. Prompt for fixes specifically
4. Re-test to verify

### Request Explanations
```
"After creating that response, explain:
- Why those specific conditions?
- What does each action do?
- What flags are involved?
- How does it fit with other responses?"
```

### Ask for Alternatives
```
"That puzzle works, but can you suggest:
- An easier version for beginners?
- A more complex variant?
- A different approach using flags differently?
- A more elegant solution?"
```

## Common Pitfalls to Avoid

### Don't Assume AI Knows Current State
**Bad:** "Add the key to that room"
**Good:** "Add object 3 (rusty key) to location 6 (Treasure Room)"

### Don't Mix Multiple Complex Requests
**Bad:** "Create 5 rooms, 10 objects, all vocabulary, and 20 responses"
**Good:** "First, create these 5 rooms: [details for each]"

### Don't Omit Critical Details
**Bad:** "Make a response for getting the sword"
**Good:** "Make a PRO1 response for GET SWORD (verb 10, noun 5)
that requires player is at location 8 and sword is present
(object 7), then adds sword to inventory and displays message
20 and ends with DONE"

### Don't Forget DONE Actions
**Bad:** "Create response that displays a message"
**Good:** "Create response that displays message 50 and DONE"

### Don't Request Impossible Features
**Bad:** "Make real-time combat system"
**Good:** "Make turn-based combat using flag counters and
random CHANCE conditions"

## Troubleshooting Prompts

### Movement Issues
```
"The movement from [location] to [location] isn't working.
Current exits for location [ID]: [list]
Expected: typing [direction] should move to [destination]
Actual: [what happens]
Check exit configuration and help fix it."
```

### Response Not Firing
```
"Response [ID] isn't triggering. It should fire when:
- Player types: [command]
- Player is at: [location]
- Player has: [objects]
- Flags: [values]
Help diagnose why conditions aren't met."
```

### Object Problems
```
"Object [ID] ([name]) isn't working correctly:
Issue: [describe problem]
Current properties: [list]
Expected behavior: [what should happen]
Suggest fixes."
```

### Flag Logic Errors
```
"Flag [ID] is behaving incorrectly:
Initial value: [value]
Expected changes: [when and how]
Actual behavior: [what happens]
Responses that modify it: [list]
Help debug the flag logic."
```

## Advanced Prompt Techniques

### Request Optimization
```
"I have 5 responses that all check [similar conditions].
Can you combine or optimize them for better performance?"
```

### Request Documentation
```
"Document this game's flag usage:
- List all flags
- Explain each purpose
- Show where they're used
- Suggest organization improvements"
```

### Request Testing Plans
```
"Create a testing checklist for this game covering:
- All puzzles
- All object interactions
- Edge cases
- Win/lose conditions"
```

### Request Refactoring
```
"This puzzle works but is messy. Refactor it to:
- Use fewer flags
- Simplify logic
- Improve message clarity
- Make it more maintainable"
```

## Conclusion

Effective prompting for DAAD Builder requires:
1. Understanding DAAD's capabilities and limits
2. Being specific about requirements
3. Providing complete information
4. Testing and iterating
5. Using clear domain terminology

By following these guidelines, you can efficiently create adventure games with AI assistance while maintaining full creative control over your project.

Remember: The AI is a tool to help implement your vision. The better you explain that vision, the better the results!
