# JSON Reference and Templates

Quick reference templates for copy-paste use.

## Complete Game Template

```json
{
  "partNumber": 1,
  "title": "Game Title",
  "author": "Author Name",
  "version": "1.0",
  "introText": "Optional introduction text shown at game start.",
  "locations": [],
  "objects": [],
  "rules": [],
  "flags": [
    { "id": 1, "name": "objects_carried", "description": "System flag", "initialValue": 0 },
    { "id": 37, "name": "max_carry_objects", "description": "System flag", "initialValue": 4 },
    { "id": 52, "name": "max_carry_weight", "description": "System flag", "initialValue": 10 }
  ],
  "messages": [],
  "vocabulary": [],
  "music": []
}
```

## Location Template

```json
{
  "id": 0,
  "name": "Room Name",
  "description": "Room description text.",
  "isDark": false,
  "exits": {
    "north": null, "south": null, "east": null, "west": null,
    "northeast": null, "northwest": null, "southeast": null, "southwest": null,
    "up": null, "down": null, "in": null, "out": null
  },
  "x": 200,
  "y": 200
}
```

## Object Templates

### Basic Takeable Object
```json
{
  "id": 0,
  "noun": "item",
  "adjective": "",
  "description": "Description when examined.",
  "icon": "📦",
  "weight": 1,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

### Container Object
```json
{
  "id": 0,
  "noun": "box",
  "adjective": "wooden",
  "description": "A wooden box with a lid.",
  "icon": "📦",
  "weight": 3,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": true,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false,
  "containerCapacity": 5
}
```

### Light Source
```json
{
  "id": 0,
  "noun": "lantern",
  "adjective": "",
  "description": "An oil lantern that provides light.",
  "icon": "🏮",
  "weight": 2,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": true,
  "isPSI": false
}
```

### Wearable Object
```json
{
  "id": 0,
  "noun": "coat",
  "adjective": "warm",
  "description": "A warm winter coat.",
  "icon": "🧥",
  "weight": 2,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": false,
  "isWearable": true,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

### NPC/Character
```json
{
  "id": 0,
  "noun": "guard",
  "adjective": "",
  "description": "A burly guard in uniform.",
  "icon": "💂",
  "weight": 100,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": false,
  "isLightSource": false,
  "isPSI": true
}
```

### Scenery (Non-takeable)
```json
{
  "id": 0,
  "noun": "painting",
  "adjective": "old",
  "description": "An old oil painting of a landscape.",
  "icon": "🖼️",
  "weight": 10,
  "location": { "type": "at", "locationId": 0 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": false,
  "isLightSource": false,
  "isPSI": false
}
```

### Hidden Object (In Limbo)
```json
{
  "id": 0,
  "noun": "key",
  "adjective": "hidden",
  "description": "A key that was hidden.",
  "icon": "🔑",
  "weight": 1,
  "location": { "type": "limbo" },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

## Object Location Types

```json
// At a room
{ "type": "at", "locationId": 0 }

// Carried by player
{ "type": "carried" }

// Worn by player
{ "type": "worn" }

// Hidden/removed
{ "type": "limbo" }

// Inside a container
{ "type": "inside", "containerId": 5 }
```

## Rule Template

```json
{
  "id": 0,
  "name": "Rule Description",
  "process": "PRO0",
  "enabled": true,
  "conditions": [],
  "actions": []
}
```

## Common Conditions

```json
// Location checks
{ "type": "AT", "params": { "locno": 0 } }
{ "type": "NOTAT", "params": { "locno": 0 } }

// Object presence
{ "type": "PRESENT", "params": { "objno": 0 } }
{ "type": "ABSENT", "params": { "objno": 0 } }
{ "type": "CARRIED", "params": { "objno": 0 } }
{ "type": "NOTCARR", "params": { "objno": 0 } }
{ "type": "WORN", "params": { "objno": 0 } }
{ "type": "ISAT", "params": { "objno": 0, "locno": 1 } }

// Flag checks
{ "type": "ZERO", "params": { "flagno": 38 } }
{ "type": "NOTZERO", "params": { "flagno": 38 } }
{ "type": "EQ", "params": { "flagno": 38, "value": 5 } }
{ "type": "NOTEQ", "params": { "flagno": 38, "value": 5 } }
{ "type": "GT", "params": { "flagno": 38, "value": 3 } }
{ "type": "LT", "params": { "flagno": 38, "value": 10 } }

// Random
{ "type": "CHANCE", "params": { "percent": 50 } }
```

## Common Actions

```json
// Messages
{ "type": "MESSAGE", "params": { "mesno": 0 } }

// Movement
{ "type": "GOTO", "params": { "locno": 0 } }

// Object manipulation
{ "type": "GET", "params": { "objno": 0 } }
{ "type": "DROP", "params": { "objno": 0 } }
{ "type": "PLACE", "params": { "objno": 0, "locno": 1 } }
{ "type": "CREATE", "params": { "objno": 0 } }
{ "type": "DESTROY", "params": { "objno": 0 } }
{ "type": "WEAR", "params": { "objno": 0 } }
{ "type": "REMOVE", "params": { "objno": 0 } }

// Flag manipulation
{ "type": "SET", "params": { "flagno": 38 } }
{ "type": "CLEAR", "params": { "flagno": 38 } }
{ "type": "LET", "params": { "flagno": 38, "value": 5 } }
{ "type": "PLUS", "params": { "flagno": 38, "value": 1 } }
{ "type": "MINUS", "params": { "flagno": 38, "value": 1 } }

// Control flow
{ "type": "DONE", "params": {} }
{ "type": "NOTDONE", "params": {} }
{ "type": "END", "params": {} }
{ "type": "RESTART", "params": {} }
```

## Flag Template

```json
{
  "id": 38,
  "name": "flag_name",
  "description": "What this flag tracks",
  "initialValue": 0
}
```

## Vocabulary Templates

```json
// Verb
{ "id": 0, "word": "examine", "wordType": "verb" }

// Noun
{ "id": 0, "word": "key", "wordType": "noun" }

// Adjective
{ "id": 0, "word": "brass", "wordType": "adjective" }

// Synonym (same ID as related word)
{ "id": 0, "word": "x", "wordType": "verb" }
```

## Standard Vocabulary Set

```json
{
  "vocabulary": [
    { "id": 0, "word": "north", "wordType": "verb" },
    { "id": 0, "word": "n", "wordType": "verb" },
    { "id": 1, "word": "south", "wordType": "verb" },
    { "id": 1, "word": "s", "wordType": "verb" },
    { "id": 2, "word": "east", "wordType": "verb" },
    { "id": 2, "word": "e", "wordType": "verb" },
    { "id": 3, "word": "west", "wordType": "verb" },
    { "id": 3, "word": "w", "wordType": "verb" },
    { "id": 4, "word": "up", "wordType": "verb" },
    { "id": 4, "word": "u", "wordType": "verb" },
    { "id": 5, "word": "down", "wordType": "verb" },
    { "id": 5, "word": "d", "wordType": "verb" },
    { "id": 6, "word": "examine", "wordType": "verb" },
    { "id": 6, "word": "x", "wordType": "verb" },
    { "id": 6, "word": "look", "wordType": "verb" },
    { "id": 7, "word": "take", "wordType": "verb" },
    { "id": 7, "word": "get", "wordType": "verb" },
    { "id": 8, "word": "drop", "wordType": "verb" },
    { "id": 9, "word": "inventory", "wordType": "verb" },
    { "id": 9, "word": "i", "wordType": "verb" },
    { "id": 10, "word": "open", "wordType": "verb" },
    { "id": 11, "word": "close", "wordType": "verb" },
    { "id": 12, "word": "use", "wordType": "verb" },
    { "id": 13, "word": "give", "wordType": "verb" },
    { "id": 14, "word": "read", "wordType": "verb" },
    { "id": 15, "word": "wear", "wordType": "verb" },
    { "id": 16, "word": "remove", "wordType": "verb" },
    { "id": 17, "word": "unlock", "wordType": "verb" },
    { "id": 18, "word": "search", "wordType": "verb" },
    { "id": 19, "word": "push", "wordType": "verb" },
    { "id": 20, "word": "pull", "wordType": "verb" }
  ]
}
```

## Common Rule Patterns

### Examine Object
```json
{
  "id": 0,
  "name": "EXAMINE item",
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

### Search and Find
```json
{
  "id": 0,
  "name": "SEARCH location - find item",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "ZERO", "params": { "flagno": 38 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "CREATE", "params": { "objno": 0 } },
    { "type": "SET", "params": { "flagno": 38 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Unlock with Key
```json
{
  "id": 0,
  "name": "UNLOCK door",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "CARRIED", "params": { "objno": 0 } },
    { "type": "ZERO", "params": { "flagno": 38 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "SET", "params": { "flagno": 38 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Block Exit Until Condition
```json
{
  "id": 0,
  "name": "Block north - door locked",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "ZERO", "params": { "flagno": 38 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Give Object to NPC
```json
{
  "id": 0,
  "name": "GIVE item to NPC",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "PRESENT", "params": { "objno": 1 } },
    { "type": "CARRIED", "params": { "objno": 0 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "DESTROY", "params": { "objno": 0 } },
    { "type": "SET", "params": { "flagno": 38 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Win Condition
```json
{
  "id": 0,
  "name": "Win - escape with treasure",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "CARRIED", "params": { "objno": 0 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } },
    { "type": "END", "params": {} }
  ]
}
```

### Random Event (in PRO3)
```json
{
  "id": 0,
  "name": "Random ambient sound",
  "process": "PRO3",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 0 } },
    { "type": "CHANCE", "params": { "percent": 20 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } }
  ]
}
```

## Quick Validation Checklist

- [ ] All location IDs unique and sequential from 0
- [ ] All object IDs unique and sequential from 0
- [ ] All rule IDs unique
- [ ] All flag IDs 38-255 (avoiding reserved)
- [ ] All exits reference valid location IDs
- [ ] Object locations reference valid location IDs
- [ ] All MESSAGE actions reference valid message indices
- [ ] All vocabulary words are max 10 characters
- [ ] All object nouns have vocabulary entries
- [ ] Successful rules end with DONE
