# Creating Flags

## What are Flags?

Flags are variables that track game state. They store numbers (0-255) that represent conditions like "door is unlocked" or "player has talked to guard".

## Flag Structure

```json
{
  "id": 38,
  "name": "door_unlocked",
  "description": "Whether the main door has been unlocked",
  "initialValue": 0
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Flag number (1-255) |
| name | string | Yes | Short identifier |
| description | string | Yes | What this flag tracks |
| initialValue | number | Yes | Starting value (0-255) |

## Reserved System Flags

These flags are used by DAAD automatically:

| ID | Name | Purpose |
|----|------|---------|
| 1 | objects_carried | Number of objects player is carrying |
| 37 | max_carry_objects | Maximum objects allowed (default: 4) |
| 52 | max_carry_weight | Maximum weight allowed (default: 10) |

**Don't use flags 1-36 for custom purposes** - many are reserved.

## Safe Flag Range

Use flags **38-255** for your game logic.

## Common Flag Patterns

### Boolean (Yes/No)
```json
// 0 = false, non-zero = true
{ "id": 38, "name": "door_unlocked", "description": "Door has been unlocked", "initialValue": 0 }
```

Check with:
```json
{ "type": "ZERO", "params": { "flagno": 38 } }      // Is locked
{ "type": "NOTZERO", "params": { "flagno": 38 } }  // Is unlocked
```

Set with:
```json
{ "type": "SET", "params": { "flagno": 38 } }      // Set to 255 (true)
{ "type": "CLEAR", "params": { "flagno": 38 } }    // Set to 0 (false)
```

### Counter
```json
{ "id": 40, "name": "gems_collected", "description": "Number of gems found", "initialValue": 0 }
```

Modify with:
```json
{ "type": "PLUS", "params": { "flagno": 40, "value": 1 } }   // Add 1
{ "type": "MINUS", "params": { "flagno": 40, "value": 1 } }  // Subtract 1
```

Check with:
```json
{ "type": "EQ", "params": { "flagno": 40, "value": 5 } }     // Has exactly 5
{ "type": "GT", "params": { "flagno": 40, "value": 2 } }     // Has more than 2
```

### State Machine
```json
{ "id": 42, "name": "guard_state", "description": "Guard behavior state", "initialValue": 0 }
// 0 = blocking, 1 = bribed, 2 = sleeping, 3 = gone
```

Check with:
```json
{ "type": "EQ", "params": { "flagno": 42, "value": 0 } }     // Guard blocking
{ "type": "EQ", "params": { "flagno": 42, "value": 1 } }     // Guard bribed
```

Set with:
```json
{ "type": "LET", "params": { "flagno": 42, "value": 1 } }    // Set to bribed
```

### Timer
```json
{ "id": 45, "name": "candle_timer", "description": "Turns until candle burns out", "initialValue": 0 }
```

Decrement each turn (in PRO2 or PRO3):
```json
{
  "conditions": [
    { "type": "GT", "params": { "flagno": 45, "value": 0 } }
  ],
  "actions": [
    { "type": "MINUS", "params": { "flagno": 45, "value": 1 } }
  ]
}
```

Check if expired:
```json
{
  "conditions": [
    { "type": "ZERO", "params": { "flagno": 45 } },
    { "type": "NOTZERO", "params": { "flagno": 46 } }  // Candle was lit
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 50 } },  // "The candle burns out"
    { "type": "CLEAR", "params": { "flagno": 46 } }    // No longer lit
  ]
}
```

## Example: Flags for a Mystery Game

Prompt to Claude:
```
Create flags for a mystery game with:
- Tracking if player has questioned each of 3 suspects
- Tracking which clues have been found (5 clues)
- A flag for when all evidence is gathered
- A timer for when the murderer escapes (20 turns after certain event)
```

Expected output:
```json
{
  "flags": [
    { "id": 1, "name": "objects_carried", "description": "Number of objects carried (system)", "initialValue": 0 },
    { "id": 37, "name": "max_carry_objects", "description": "Max carry limit (system)", "initialValue": 4 },
    { "id": 52, "name": "max_carry_weight", "description": "Max carry weight (system)", "initialValue": 10 },

    { "id": 38, "name": "questioned_butler", "description": "Has questioned the butler", "initialValue": 0 },
    { "id": 39, "name": "questioned_maid", "description": "Has questioned the maid", "initialValue": 0 },
    { "id": 40, "name": "questioned_gardener", "description": "Has questioned the gardener", "initialValue": 0 },

    { "id": 41, "name": "found_bloody_knife", "description": "Found the bloody knife", "initialValue": 0 },
    { "id": 42, "name": "found_torn_letter", "description": "Found the torn letter", "initialValue": 0 },
    { "id": 43, "name": "found_footprints", "description": "Found the muddy footprints", "initialValue": 0 },
    { "id": 44, "name": "found_poison_bottle", "description": "Found the poison bottle", "initialValue": 0 },
    { "id": 45, "name": "found_will", "description": "Found the hidden will", "initialValue": 0 },

    { "id": 46, "name": "all_evidence", "description": "All evidence has been gathered", "initialValue": 0 },

    { "id": 47, "name": "escape_timer", "description": "Turns until murderer escapes (0=not started)", "initialValue": 0 },
    { "id": 48, "name": "timer_active", "description": "Whether escape timer is running", "initialValue": 0 }
  ]
}
```

## Checking Multiple Flags

To check if multiple conditions are met:

```json
{
  "conditions": [
    { "type": "NOTZERO", "params": { "flagno": 38 } },
    { "type": "NOTZERO", "params": { "flagno": 39 } },
    { "type": "NOTZERO", "params": { "flagno": 40 } }
  ],
  "actions": [
    { "type": "SET", "params": { "flagno": 46 } },
    { "type": "MESSAGE", "params": { "mesno": 100 } }
  ]
}
```

## Flag Organization

### By Category
```
38-49: Puzzle state (doors, locks, switches)
50-59: NPC interactions
60-69: Item discovery
70-79: Story progression
80-89: Counters
90-99: Timers
100+: Misc
```

### By Area
```
38-49: House area flags
50-59: Garden area flags
60-69: Cellar area flags
```

## Common Mistakes

### 1. Using Reserved Flags
```
Bad: Using flag 1 for custom purpose
Result: Breaks inventory system
```

### 2. Flag Value Overflow
```
Flag max: 255
PLUS 1 when at 255 = 0 (wraps around)
Result: Unexpected behavior
```

### 3. Forgetting Initial Values
```
Bad: Forgetting to set timer initial value
Result: Timer starts at wrong value
```

### 4. Not Checking Both States
```
Bad: Only checking flag == 0
Missing: What happens when flag != 0
Result: Logic gaps
```

## Debugging Flags

When testing, track flag values:
- Note which flags should change
- Verify they change correctly
- Check edge cases (what if already set?)

## Checklist

Before finalizing flags:
- [ ] Using flag IDs 38-255 (avoiding reserved)
- [ ] All flags have meaningful names
- [ ] All flags have descriptions
- [ ] Initial values are correct
- [ ] Counters won't overflow
- [ ] Timers are properly initialized
- [ ] Boolean flags use consistent convention

## Next Steps

After creating flags:
1. Create rules that check and modify flags (see `04-RULES.md`)
2. Test flag logic in Play Test mode
3. Verify all edge cases are handled
