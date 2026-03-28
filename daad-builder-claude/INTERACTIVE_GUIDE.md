# Interactive DAAD Game Creation Guide

## How This Works

When creating a game with AI assistance, follow this interactive workflow. The AI will guide you step-by-step through each phase.

## Phase 1: Game Concept (5 minutes)

**AI will ask you:**
1. What type of game? (mystery, fantasy, sci-fi, horror, etc.)
2. What's the basic story/goal?
3. How many rooms roughly? (Start with 5-10)
4. Main puzzles? (2-3 for first game)

**You provide:**
- Brief description
- Core idea
- Approximate scope

**Example:**
```
You: "I want a mystery game in a mansion with 8 rooms where you
     find clues to solve a murder"

AI: "Great! Let's start. First, we'll create 8 locations representing
     the mansion. I'll guide you through each step."
```

## Phase 2: Create Locations (10-15 minutes)

**AI guides you through:**

### Step 1: Create Starting Location
```
AI: "Let's create Room 0 (the starting location).

     1. Click 'Rooms' in the sidebar
     2. Click 'Add Room' button
     3. Click the new room in the list to select it
     4. In the right panel, set:
        - Name: 'Main Entrance Hall'
        - Description: 'A grand entrance with a marble floor...'

     Have you created Room 0? Reply 'done' when ready."
```

### Step 2: Create Connected Rooms
```
AI: "Now let's add Room 1 and connect it.

     1. Click 'Add Room' again
     2. Name it: 'Drawing Room'
     3. Description: 'An elegant room with...'
     4. Now connect them:
        - With Room 0 selected, scroll to 'Exits'
        - Click 'Show All Directions'
        - Find 'north' exit
        - Select 'Room 1 - Drawing Room' from dropdown
        - Click 'Yes' when asked about two-way connection

     Type 'done' when Room 1 is created and connected."
```

### Repeat for Each Room
AI will guide you through all rooms one at a time, ensuring proper connections.

## Phase 3: Add Objects (10-15 minutes)

**AI guides you through:**

### Step 1: First Object
```
AI: "Let's add your first object - a key.

     1. Click 'Items' in the sidebar
     2. Click 'Add Object' button
     3. In the right panel, set:
        - Noun: 'key'
        - Adjective: 'rusty'
        - Description: 'An old rusty key with an ornate handle'
        - Weight: 1
        - Location: Select 'At Location' → 'Room 3 - Library'
        - Check 'Takeable'

     Type 'done' when the key is created."
```

### Step 2: More Objects
AI guides you through each object needed for your puzzles.

## Phase 4: Add Vocabulary (5-10 minutes)

**AI guides you through:**

### Step 1: Add Verbs
```
AI: "Now we need to add the verbs (actions) players can use.

     1. Click 'Words' in the sidebar
     2. Click 'Add Verb'
     3. Type: 'examine'
     4. Click 'Add Verb' again
     5. Type: 'get'
     6. Add these verbs one at a time:
        - take
        - drop
        - use
        - open
        - unlock

     Type 'done' when all verbs are added."
```

### Step 2: Add Nouns
```
AI: "Add nouns for all your objects:

     1. Click 'Add Noun'
     2. Type: 'key' (matches your object)
     3. Add these nouns:
        - door
        - lamp
        - book
        [... matches your objects ...]

     Type 'done' when complete."
```

### Step 3: Add Adjectives
```
AI: "Add adjectives that match your objects:

     1. Click 'Add Adjective'
     2. Type: 'rusty' (matches rusty key)
     3. Add any other adjectives you used

     Type 'done' when complete."
```

## Phase 5: Add Messages (5-10 minutes)

**AI guides you through:**

```
AI: "Let's add the text messages for your game.

     1. Click 'Text' in the sidebar
     2. Click 'Add Message'
     3. For message 54, type: 'You pick up the rusty key.'
     4. Add Message 55: 'The key fits perfectly in the lock.'
     5. Add Message 56: 'You unlock the door. It creaks open.'

     I'll tell you which messages to create as we build responses.
     Type 'done' when these first 3 are added."
```

## Phase 6: Create First Puzzle (15-20 minutes)

**AI guides you through puzzle logic:**

### Example: Key and Locked Door Puzzle

```
AI: "Let's create a puzzle where you use a key to unlock a door.
     We need 3 responses for this:

     RESPONSE 1: Picking up the key

     1. Click 'Responses' in the sidebar
     2. Click 'Add Response'
     3. Set Process Table: 'PRO1' (high priority)
     4. Click 'Add Condition'
        - Type: 'AT'
        - Verb: Find 'get' in the dropdown (write down its ID)
        - Noun: Find 'key' in the dropdown
     5. Click 'Add Condition' again
        - Type: 'PRESENT'
        - Object: Select 'rusty key'
     6. Click 'Add Action'
        - Type: 'GET'
        - Object: Select 'rusty key'
     7. Click 'Add Action'
        - Type: 'MESSAGE'
        - Message: Select message 54
     8. Click 'Add Action'
        - Type: 'DONE'
     9. Make sure 'Enabled' is checked

     Type 'done' when Response 1 is created."
```

Then guide through Response 2, Response 3, etc.

## Phase 7: Test the Game (5-10 minutes)

**AI guides testing:**

```
AI: "Let's test what we've built so far.

     1. Click 'Play Test' in the sidebar
     2. Click 'Restart Game'
     3. Try these commands:
        - Type 'n' (should go north)
        - Type 'look' (describe room)
        - Type 'get key' (if key is here)
        - Type 'inventory' (check what you have)

     Tell me what happens and if anything doesn't work."
```

## Phase 8: Add More Features

**AI continues guiding:**
- Adding more puzzles
- Creating flags for game state
- Adding NPCs/characters
- Creating time-based events
- Adding music

**Each feature follows the same pattern:**
1. AI explains what we're adding
2. AI gives step-by-step instructions
3. You complete each step
4. You say "done"
5. AI moves to next step
6. Test regularly

## Phase 9: Polish (10-15 minutes)

**AI helps with:**
```
AI: "Let's polish your game:

     1. Review all room descriptions - make them more vivid
     2. Add more messages for failed actions
     3. Test all puzzles thoroughly
     4. Add hints for difficult puzzles
     5. Check all exits work correctly

     Which area should we polish first?"
```

## Phase 10: Export and Compile

**AI guides final steps:**
```
AI: "Ready to export your game?

     1. Click 'Export' in the sidebar
     2. Check for validation errors
     3. Fix any red errors I'll help you with
     4. Click 'Export DAAD Game'
     5. Save the .dsf file

     Then we can compile it:
     1. Click 'Compile' in the sidebar
     2. Choose your target platform
     3. Click 'Compile to [Platform]'
     4. Save the game file

     Type 'done' after export succeeds."
```

## Communication Protocol

**You say:**
- "done" - completed current step, ready for next
- "help" - need more explanation
- "stuck" - something's not working
- "skip" - want to skip this step
- "back" - want to redo previous step
- "test" - want to test current progress

**AI responds:**
- Next instruction
- More detailed help
- Debugging assistance
- Confirmation to skip
- Previous step instructions
- Testing guidance

## Example Session Flow

```
You: "I want to make a simple fantasy game"

AI: "Great! Let's create a fantasy adventure. First question:
     What's the basic story? (e.g., 'Find the magic sword to
     defeat the dragon')"

You: "Rescue the princess from the tower"

AI: "Perfect! How many rooms do you want? I suggest 6-8 for
     your first game."

You: "8 rooms"

AI: "Excellent. Let's start building. Step 1: Create the starting
     location.

     1. Click 'Rooms' in the left sidebar
     2. Click the 'Add Room' button
     3. Click the new 'Room 0' in the list

     Done? Type 'done' when ready."

You: "done"

AI: "Great! Now let's set up Room 0:

     1. In the Name field, type: 'Castle Courtyard'
     2. In Description, type: 'You stand in a grand courtyard...'
     3. Leave 'Is Dark' unchecked

     Type 'done' when finished."

You: "done"

AI: "Perfect! Now let's create Room 1 and connect it..."

[continues step by step through entire game creation]
```

## Tips for Success

1. **Take it slow** - Don't rush, each step builds on the last
2. **Test often** - After every 2-3 changes, test in Play Test
3. **Ask questions** - If unclear, ask AI to explain more
4. **Save frequently** - Use Ctrl+S after major changes
5. **Have fun** - This is creative, enjoy the process!

## Red Flags (Tell AI Immediately)

- Error messages in the app
- Can't find a button/option mentioned
- Test behavior is wrong
- Don't understand why something is needed
- Want to do something different than suggested

## Remember

The AI is your guide and assistant. It will:
- ✅ Give you step-by-step instructions
- ✅ Explain why each step matters
- ✅ Help debug problems
- ✅ Adapt to your creative ideas
- ✅ Suggest improvements

You are the creator. You:
- ✅ Make all creative decisions
- ✅ Decide the story and puzzles
- ✅ Control the pace
- ✅ Say when to move on or go back
- ✅ Own the final game

Let's build something amazing together!
