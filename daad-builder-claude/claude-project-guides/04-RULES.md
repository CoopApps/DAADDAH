# Creating Rules (Responses)

## What is a Rule?

Rules define game logic - what happens when the player does something. They use CONDITIONS to check the game state and ACTIONS to change it.

In DAAD terminology, rules are called "Responses" or "Entries".

## Rule Structure

```json
{
  "id": 0,
  "name": "EXAMINE KEY",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "PRESENT", "params": { "objno": 0 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 5 } },
    { "type": "DONE", "params": {} }
  ]
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique rule ID |
| name | string | Yes | Descriptive name (for editor) |
| process | string | Yes | "PRO0", "PRO1", "PRO2", or "PRO3" |
| enabled | boolean | Yes | Whether rule is active |
| conditions | array | Yes | Conditions to check (all must pass) |
| actions | array | Yes | Actions to execute |

## Process Tables

| Table | When It Runs | Common Uses |
|-------|--------------|-------------|
| PRO0 | Every turn, for player commands | Main game responses |
| PRO1 | After PRO0 | Extended logic, NPC actions |
| PRO2 | Before describing location | Room entry effects |
| PRO3 | After describing location | Ambient events |

Most rules go in **PRO0**.

## Conditions

Conditions check if something is true. All conditions must pass for actions to execute.

### Location Conditions
```json
// Player is at location 5
{ "type": "AT", "params": { "locno": 5 } }

// Player is NOT at location 5
{ "type": "NOTAT", "params": { "locno": 5 } }
```

### Object Conditions
```json
// Object 3 is present (at location, carried, or worn)
{ "type": "PRESENT", "params": { "objno": 3 } }

// Object 3 is absent
{ "type": "ABSENT", "params": { "objno": 3 } }

// Object 3 is carried
{ "type": "CARRIED", "params": { "objno": 3 } }

// Object 3 is NOT carried
{ "type": "NOTCARR", "params": { "objno": 3 } }

// Object 3 is worn
{ "type": "WORN", "params": { "objno": 3 } }

// Object 3 is at location 2
{ "type": "ISAT", "params": { "objno": 3, "locno": 2 } }
```

### Flag Conditions
```json
// Flag 38 is zero
{ "type": "ZERO", "params": { "flagno": 38 } }

// Flag 38 is not zero
{ "type": "NOTZERO", "params": { "flagno": 38 } }

// Flag 38 equals 5
{ "type": "EQ", "params": { "flagno": 38, "value": 5 } }

// Flag 38 does not equal 5
{ "type": "NOTEQ", "params": { "flagno": 38, "value": 5 } }

// Flag 38 is greater than 3
{ "type": "GT", "params": { "flagno": 38, "value": 3 } }

// Flag 38 is less than 10
{ "type": "LT", "params": { "flagno": 38, "value": 10 } }
```

### Random/Chance
```json
// 50% chance of passing
{ "type": "CHANCE", "params": { "percent": 50 } }
```

## Actions

Actions change the game state.

### Messages
```json
// Display message 10
{ "type": "MESSAGE", "params": { "mesno": 10 } }

// Display object description
{ "type": "DESC", "params": {} }
```

### Player Movement
```json
// Move player to location 5
{ "type": "GOTO", "params": { "locno": 5 } }
```

### Object Manipulation
```json
// Get object 3 (add to inventory)
{ "type": "GET", "params": { "objno": 3 } }

// Drop object 3
{ "type": "DROP", "params": { "objno": 3 } }

// Move object 3 to location 2
{ "type": "PLACE", "params": { "objno": 3, "locno": 2 } }

// Create object 3 (move from limbo to current location)
{ "type": "CREATE", "params": { "objno": 3 } }

// Destroy object 3 (move to limbo)
{ "type": "DESTROY", "params": { "objno": 3 } }

// Wear object 3
{ "type": "WEAR", "params": { "objno": 3 } }

// Remove worn object 3
{ "type": "REMOVE", "params": { "objno": 3 } }
```

### Flag Manipulation
```json
// Set flag 38 to 255 (true)
{ "type": "SET", "params": { "flagno": 38 } }

// Set flag 38 to 0 (false)
{ "type": "CLEAR", "params": { "flagno": 38 } }

// Set flag 38 to specific value
{ "type": "LET", "params": { "flagno": 38, "value": 5 } }

// Add value to flag
{ "type": "PLUS", "params": { "flagno": 38, "value": 1 } }

// Subtract from flag
{ "type": "MINUS", "params": { "flagno": 38, "value": 1 } }
```

### Control Flow
```json
// Stop processing more rules (success)
{ "type": "DONE", "params": {} }

// Continue to next rule
{ "type": "NOTDONE", "params": {} }

// End the game (victory)
{ "type": "END", "params": {} }

// Restart the game
{ "type": "RESTART", "params": {} }
```

## Common Rule Patterns

### Examining an Object
```json
{
  "id": 0,
  "name": "EXAMINE KEY",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "PRESENT", "params": { "objno": 0 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Unlocking Something
```json
{
  "id": 1,
  "name": "UNLOCK DOOR with key",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 3 } },
    { "type": "CARRIED", "params": { "objno": 0 } },
    { "type": "ZERO", "params": { "flagno": 38 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 1 } },
    { "type": "SET", "params": { "flagno": 38 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Revealing a Hidden Object
```json
{
  "id": 2,
  "name": "SEARCH RUG reveals key",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 2 } },
    { "type": "ZERO", "params": { "flagno": 39 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 2 } },
    { "type": "CREATE", "params": { "objno": 3 } },
    { "type": "SET", "params": { "flagno": 39 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Giving Object to NPC
```json
{
  "id": 3,
  "name": "GIVE COIN to guard",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 4 } },
    { "type": "CARRIED", "params": { "objno": 5 } },
    { "type": "PRESENT", "params": { "objno": 6 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 3 } },
    { "type": "DESTROY", "params": { "objno": 5 } },
    { "type": "SET", "params": { "flagno": 40 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Random Event
```json
{
  "id": 4,
  "name": "Random creak sound",
  "process": "PRO3",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 5 } },
    { "type": "CHANCE", "params": { "percent": 25 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 10 } }
  ]
}
```

### Conditional Exit
```json
{
  "id": 5,
  "name": "Block north if door locked",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 3 } },
    { "type": "ZERO", "params": { "flagno": 38 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 5 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Win Condition
```json
{
  "id": 6,
  "name": "Win - escape with treasure",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "CARRIED", "params": { "objno": 10 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 20 } },
    { "type": "END", "params": {} }
  ]
}
```

## Example: Creating a Complete Puzzle

Prompt to Claude:
```
Create rules for a key-and-lock puzzle:
1. A brass key (object 0) is hidden under a rug in location 2
2. The player must SEARCH RUG to find it (use flag 38 to track)
3. A locked door blocks north exit from location 3 (flag 39)
4. Player must UNLOCK DOOR while carrying key to proceed
5. Include messages for all outcomes
```

Expected output:
```json
{
  "rules": [
    {
      "id": 0,
      "name": "SEARCH RUG - find key",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "ZERO", "params": { "flagno": 38 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 0 } },
        { "type": "CREATE", "params": { "objno": 0 } },
        { "type": "SET", "params": { "flagno": 38 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 1,
      "name": "SEARCH RUG - already searched",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "NOTZERO", "params": { "flagno": 38 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 1 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 2,
      "name": "GO NORTH - door locked",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 3 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 2 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 3,
      "name": "UNLOCK DOOR - success",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 3 } },
        { "type": "CARRIED", "params": { "objno": 0 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 3 } },
        { "type": "SET", "params": { "flagno": 39 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 4,
      "name": "UNLOCK DOOR - already unlocked",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 3 } },
        { "type": "NOTZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 4 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 5,
      "name": "UNLOCK DOOR - no key",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 3 } },
        { "type": "NOTCARR", "params": { "objno": 0 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 5 } },
        { "type": "DONE", "params": {} }
      ]
    }
  ],
  "messages": [
    "You lift the edge of the rug and find a brass key hidden underneath!",
    "You've already searched under the rug.",
    "The door to the north is locked.",
    "You insert the key and unlock the door with a satisfying click.",
    "The door is already unlocked.",
    "You don't have anything to unlock the door with."
  ],
  "flags": [
    { "id": 38, "name": "rug_searched", "description": "Player has searched under the rug", "initialValue": 0 },
    { "id": 39, "name": "door_unlocked", "description": "The locked door has been unlocked", "initialValue": 0 }
  ],
  "vocabulary": [
    { "id": 0, "word": "search", "wordType": "verb" },
    { "id": 1, "word": "unlock", "wordType": "verb" },
    { "id": 2, "word": "rug", "wordType": "noun" },
    { "id": 3, "word": "door", "wordType": "noun" }
  ]
}
```

## Important: DONE vs NOTDONE

- **DONE** - Stop processing rules. Use when your rule handled the command.
- **NOTDONE** - Continue to next rule. Use when you want multiple rules to fire.

Always end successful rules with DONE, or the parser may produce unexpected output.

## Rule Order Matters

Rules are checked in order. More specific rules should come before general ones:

```
1. UNLOCK DOOR - success (specific: has key)
2. UNLOCK DOOR - no key (general: doesn't have key)
3. UNLOCK - wrong item (catch-all)
```

## Checklist

Before finalizing rules:
- [ ] All rules have unique IDs
- [ ] Object/location/flag IDs reference existing items
- [ ] Message IDs reference existing messages
- [ ] Successful rules end with DONE
- [ ] Conditions cover all edge cases
- [ ] Rule names are descriptive
- [ ] Process table is appropriate

## Next Steps

After creating rules:
1. Verify all referenced vocabulary exists (see `05-VOCABULARY.md`)
2. Write messages for all mesno references (see `06-MESSAGES.md`)
3. Test rules in Play Test mode
