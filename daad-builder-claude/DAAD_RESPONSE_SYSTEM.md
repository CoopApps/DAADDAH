# DAAD Response System Guide

## Understanding Responses (Rules)

Responses are the core logic of your DAAD game. They define how the game reacts to player commands.

## Response Structure

Every response consists of:
1. **Process Table**: Which table it belongs to (PRO0, PRO1, PRO2)
2. **Conditions**: What must be true for the response to execute
3. **Actions**: What happens when conditions are met

```
IF <conditions> THEN <actions>
```

## Process Tables

### PRO0 - Interrupt Table
- Runs **before** player input each turn
- Used for:
  - Time-based events
  - Automatic messages
  - NPC movement
  - Environmental changes
  - Game state updates

**Example PRO0 Uses:**
- Increment turn counter
- Check if lamp runs out of oil
- Move wandering NPCs
- Display recurring messages

### PRO1 - High Priority Responses
- Runs **first** when processing player commands
- Used for:
  - Game-specific verb implementations
  - Override standard actions
  - Complex puzzles
  - Special object interactions

**Example PRO1 Uses:**
- Custom GET/DROP logic
- Puzzle solutions
- Magic spells
- Special commands

### PRO2 - Low Priority Responses
- Runs **after** PRO1
- Used for:
  - General responses
  - Default messages
  - Fallback actions
  - Standard verb responses

**Example PRO2 Uses:**
- Generic object descriptions
- Standard inventory messages
- Common error messages
- Default action results

## Conditions

Conditions determine when a response executes. **ALL** conditions must be true.

### Location Conditions

**AT (verb, noun)**
- Matches player command
- Use 255 for "any" verb or noun
- Example: `AT GET LAMP` - triggers when "GET LAMP" typed

**NOTAT (location)**
- True if player NOT at specified location
- Example: `NOTAT 5` - player not in room 5

**ATGT (location)**
- True if current location ID > specified
- Example: `ATGT 10` - player in room 11 or higher

**ATLT (location)**
- True if current location ID < specified
- Example: `ATLT 5` - player in room 0-4

### Object Conditions

**PRESENT (object)**
- Object is at current location OR in inventory
- Most commonly used object condition
- Example: `PRESENT 1` - lamp is available

**ABSENT (object)**
- Object is NOT present (not here or carried)
- Example: `ABSENT 1` - lamp is elsewhere

**CARRIED (object)**
- Object is in player's inventory
- Example: `CARRIED 1` - carrying lamp

**NOTCARR (object)**
- Object is NOT in inventory
- Example: `NOTCARR 1` - not carrying lamp

**WORN (object)**
- Object is being worn
- Example: `WORN 5` - wearing cloak

**NOTWORN (object)**
- Object is not being worn
- Example: `NOTWORN 5` - not wearing cloak

**ISAT (object, location)**
- Object is at specific location
- Example: `ISAT 1 5` - lamp is in room 5

**ISNOTAT (object, location)**
- Object is NOT at specific location
- Example: `ISNOTAT 1 5` - lamp is not in room 5

### Flag Conditions

**ZERO (flag)**
- Flag equals 0
- Example: `ZERO 38` - flag 38 is zero

**NOTZERO (flag)**
- Flag is not 0
- Example: `NOTZERO 38` - flag 38 has value

**EQ (flag, value)**
- Flag equals specific value
- Example: `EQ 38 5` - flag 38 equals 5

**NOTEQ (flag, value)**
- Flag does not equal value
- Example: `NOTEQ 38 5` - flag 38 is not 5

**GT (flag, value)**
- Flag greater than value
- Example: `GT 38 5` - flag 38 is more than 5

**LT (flag, value)**
- Flag less than value
- Example: `LT 38 5` - flag 38 is less than 5

**SAME (flag1, flag2)**
- Two flags have same value
- Example: `SAME 38 39` - flags match

**NOTSAME (flag1, flag2)**
- Two flags have different values
- Example: `NOTSAME 38 39` - flags differ

**BIGGER (flag1, flag2)**
- First flag > second flag
- Example: `BIGGER 38 39` - flag 38 > flag 39

**SMALLER (flag1, flag2)**
- First flag < second flag
- Example: `SMALLER 38 39` - flag 38 < flag 39

### Special Conditions

**CHANCE (percentage)**
- Random chance (0-100%)
- Example: `CHANCE 50` - 50% probability

**ADJECT1 (adjective)**
- Player typed specific adjective
- Example: `ADJECT1 3` - typed "RED"

**NOUN2 (noun)**
- Player typed second noun
- For complex commands
- Example: `NOUN2 5` - second object mentioned

## Actions

Actions define what happens when conditions are met.

### Output Actions

**MESSAGE (message_id)**
- Display a message
- Example: `MESSAGE 10` - show message 10

**DESC**
- Redescribe current location
- Shows full location description
- Example: Just `DESC`

**OK**
- Print "OK"
- Standard acknowledgment
- Example: Just `OK`

### Movement Actions

**GOTO (location)**
- Move player to location
- Does NOT describe location automatically
- Example: `GOTO 5` - go to room 5

### Object Actions

**GET (object)**
- Put object in inventory
- Example: `GET 1` - take lamp

**DROP (object)**
- Remove from inventory, place at current location
- Example: `DROP 1` - drop lamp here

**WEAR (object)**
- Mark object as worn
- Must be in inventory first
- Example: `WEAR 5` - wear cloak

**REMOVE (object)**
- Remove worn object
- Stays in inventory
- Example: `REMOVE 5` - remove cloak

**DESTROY (object)**
- Delete object from game
- Removes from inventory and world
- Example: `DESTROY 1` - lamp vanishes

**CREATE (object, location)**
- Place object at location
- Can create objects in limbo
- Example: `CREATE 1 5` - put lamp in room 5

### Flag Actions

**SET (flag, value)**
- Set flag to value (0-255)
- Example: `SET 38 5` - flag 38 = 5

**CLEAR (flag)**
- Set flag to 0
- Example: `CLEAR 38` - flag 38 = 0

**PLUS (flag, value)**
- Add to flag value
- Wraps at 256
- Example: `PLUS 38 1` - increment flag 38

**MINUS (flag, value)**
- Subtract from flag value
- Cannot go below 0
- Example: `MINUS 38 1` - decrement flag 38

**LET (flag1, flag2)**
- Copy flag2 value to flag1
- Example: `LET 38 39` - flag 38 = flag 39

**ADD (flag1, flag2)**
- Add flag2 to flag1
- Example: `ADD 38 39` - flag 38 += flag 39

**SUB (flag1, flag2)**
- Subtract flag2 from flag1
- Example: `SUB 38 39` - flag 38 -= flag 39

### Control Actions

**DONE**
- Stop processing responses
- No further responses checked
- Important for efficiency!
- Example: Just `DONE`

**NOTDONE**
- Continue processing responses
- Rarely needed (default behavior)
- Example: Just `NOTDONE`

**SKIP (count)**
- Skip next N responses
- For conditional logic
- Example: `SKIP 2` - skip 2 responses

### Game State Actions

**QUIT**
- End game (player quits)
- Example: Just `QUIT`

**END**
- End game (game over)
- Example: Just `END`

**SAVE**
- Save game state
- In builder: shows message
- Example: Just `SAVE`

**LOAD**
- Load game state
- In builder: shows message
- Example: Just `LOAD`

### Multimedia Actions

**BEEP (duration, frequency)**
- Play beep sound
- Duration in ms, frequency in Hz
- Example: `BEEP 100 440` - 100ms A note

**XPLAY (music_id)**
- Play music track
- Non-blocking (continues in background)
- Example: `XPLAY 1` - play track 1

## Response Examples

### Example 1: Basic Object Pickup
```
Process: PRO1
Conditions:
  - AT GET LAMP
  - PRESENT 1
  - NOTCARR 1
Actions:
  - GET 1
  - MESSAGE 10 ("You take the lamp")
  - DONE
```

### Example 2: Using Key on Door
```
Process: PRO1
Conditions:
  - AT USE KEY
  - CARRIED 2
  - AT 5
  - ZERO 40
Actions:
  - MESSAGE 15 ("You unlock the door")
  - SET 40 1
  - DONE
```

### Example 3: Time-Based Event
```
Process: PRO0
Conditions:
  - GT 38 10
  - ZERO 41
Actions:
  - MESSAGE 20 ("The lamp flickers and dies")
  - SET 41 1
  - DESTROY 1
```

### Example 4: Complex Puzzle
```
Process: PRO1
Conditions:
  - AT PUT COIN
  - PRESENT 5
  - CARRIED 3
  - AT 8
  - ZERO 42
Actions:
  - DROP 3
  - MESSAGE 25 ("You insert the coin")
  - SET 42 1
  - CREATE 6 8
  - MESSAGE 26 ("A secret door opens!")
  - DONE
```

## Best Practices

### 1. Always Use DONE
- Add DONE to end of most PRO1/PRO2 responses
- Prevents unnecessary processing
- Improves performance

### 2. Order Conditions Efficiently
- Put most restrictive conditions first
- Check flags before complex conditions
- AT condition usually first

### 3. Test Systematically
- Test each response individually
- Try edge cases
- Verify DONE placement

### 4. Use Flags for State
- Don't rely only on object locations
- Track puzzle progress with flags
- Use flags for one-time events

### 5. Provide Feedback
- Always give player a message
- Use OK for simple confirmations
- Write descriptive messages

### 6. Handle Failure Cases
- Create responses for wrong actions
- Give hints when stuck
- Prevent impossible actions

### 7. Group Related Responses
- Keep puzzle responses together
- Comment your logic
- Use consistent naming

## Common Patterns

### One-Time Event
```
Conditions: ZERO 40
Actions: MESSAGE, SET 40 1, DONE
```

### Counter Increment
```
Conditions: [trigger]
Actions: PLUS 38 1, [other actions], DONE
```

### Flag-Based Gate
```
Conditions: NOTZERO 40
Actions: [unlocked actions], DONE
```

### Random Event
```
Conditions: CHANCE 25
Actions: MESSAGE, DONE
```

### NPC Conversation
```
Process: PRO1
Conditions: AT TALK WIZARD, PRESENT 10
Actions: MESSAGE, SET 45 1, DONE
```

## Debugging Responses

1. **Use Play Test**: Test immediately after creating response
2. **Check Conditions**: Verify all conditions can be met
3. **Verify IDs**: Ensure object/location/message IDs are correct
4. **Test Priority**: Remember PRO1 runs before PRO2
5. **Watch for DONE**: Missing DONE causes fall-through
6. **Flag Values**: Use flags to track execution
7. **Console Logs**: Check browser console for errors

## Advanced Techniques

### State Machines
Use flags to track multi-step puzzles:
- Flag 40 = 0: Puzzle not started
- Flag 40 = 1: First step complete
- Flag 40 = 2: Second step complete
- Flag 40 = 3: Puzzle solved

### Timers
Increment counter in PRO0, check threshold:
```
PRO0: PLUS 38 1
PRO0: GT 38 10, MESSAGE "Time's up!", END
```

### Object Combinations
Require multiple objects for action:
```
CARRIED 1, CARRIED 2, CARRIED 3, MESSAGE "Success!"
```

### Location Sequences
Use ATGT/ATLT for region-specific behavior:
```
ATGT 20, ATLT 30, MESSAGE "You're in the castle"
```

This response system is powerful despite its simplicity. Master these concepts and you can create complex, engaging adventure games!
