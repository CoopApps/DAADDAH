# Full Example: Mini Adventure Game

This is a complete, importable mini-game demonstrating all DAAD Builder features.

## Game Overview

**Title:** The Lost Key
**Theme:** Find a key to escape a locked room
**Locations:** 3 rooms
**Objects:** 4 items
**Puzzles:** 1 (find hidden key, unlock door)

## Complete Game JSON

Copy this entire JSON and import into DAAD Builder:

```json
{
  "partNumber": 1,
  "title": "The Lost Key",
  "author": "Claude Assistant",
  "version": "1.0",
  "introText": "You wake up in a strange room. The door is locked, and you need to find a way out.",

  "locations": [
    {
      "id": 0,
      "name": "Bedroom",
      "description": "A dusty bedroom with an old bed and a wooden wardrobe. A door leads east, and stairs go down to the north.",
      "isDark": false,
      "exits": {
        "north": 2,
        "south": null,
        "east": 1,
        "west": null,
        "northeast": null,
        "northwest": null,
        "southeast": null,
        "southwest": null,
        "up": null,
        "down": null,
        "in": null,
        "out": null
      },
      "x": 200,
      "y": 200
    },
    {
      "id": 1,
      "name": "Study",
      "description": "A small study with bookshelves and a writing desk. An old rug covers part of the floor. The bedroom is west.",
      "isDark": false,
      "exits": {
        "north": null,
        "south": null,
        "east": null,
        "west": 0,
        "northeast": null,
        "northwest": null,
        "southeast": null,
        "southwest": null,
        "up": null,
        "down": null,
        "in": null,
        "out": null
      },
      "x": 300,
      "y": 200
    },
    {
      "id": 2,
      "name": "Hallway",
      "description": "A narrow hallway with peeling wallpaper. The front door is to the north, but it's locked. Stairs lead up to the south.",
      "isDark": false,
      "exits": {
        "north": null,
        "south": 0,
        "east": null,
        "west": null,
        "northeast": null,
        "northwest": null,
        "southeast": null,
        "southwest": null,
        "up": null,
        "down": null,
        "in": null,
        "out": null
      },
      "x": 200,
      "y": 100
    }
  ],

  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "A small brass key. It looks like it fits a door lock.",
      "icon": "🔑",
      "weight": 1,
      "location": { "type": "limbo" },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 1,
      "noun": "rug",
      "adjective": "old",
      "description": "A faded Persian rug. One corner is curled up.",
      "icon": "🟫",
      "weight": 10,
      "location": { "type": "at", "locationId": 1 },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": false,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 2,
      "noun": "book",
      "adjective": "dusty",
      "description": "An old book titled 'Secrets of the House'. The pages are brittle with age.",
      "icon": "📕",
      "weight": 2,
      "location": { "type": "at", "locationId": 1 },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 3,
      "noun": "door",
      "adjective": "front",
      "description": "A heavy wooden door with a brass lock. This is the way out.",
      "icon": "🚪",
      "weight": 100,
      "location": { "type": "at", "locationId": 2 },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": false,
      "isLightSource": false,
      "isPSI": false
    }
  ],

  "rules": [
    {
      "id": 0,
      "name": "SEARCH RUG - find key",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 1 } },
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
        { "type": "AT", "params": { "locno": 1 } },
        { "type": "NOTZERO", "params": { "flagno": 38 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 1 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 2,
      "name": "EXAMINE RUG",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "PRESENT", "params": { "objno": 1 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 2 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 3,
      "name": "EXAMINE KEY",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "PRESENT", "params": { "objno": 0 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 3 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 4,
      "name": "EXAMINE DOOR",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 4 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 5,
      "name": "READ BOOK",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "PRESENT", "params": { "objno": 2 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 5 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 6,
      "name": "GO NORTH - door locked",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 6 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 7,
      "name": "UNLOCK DOOR - success",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "CARRIED", "params": { "objno": 0 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 7 } },
        { "type": "SET", "params": { "flagno": 39 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 8,
      "name": "UNLOCK DOOR - already unlocked",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "NOTZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 8 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 9,
      "name": "UNLOCK DOOR - no key",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "NOTCARR", "params": { "objno": 0 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 9 } },
        { "type": "DONE", "params": {} }
      ]
    },
    {
      "id": 10,
      "name": "OPEN DOOR - win game",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "NOTZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 10 } },
        { "type": "END", "params": {} }
      ]
    },
    {
      "id": 11,
      "name": "OPEN DOOR - still locked",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        { "type": "AT", "params": { "locno": 2 } },
        { "type": "ZERO", "params": { "flagno": 39 } }
      ],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 11 } },
        { "type": "DONE", "params": {} }
      ]
    }
  ],

  "flags": [
    { "id": 1, "name": "objects_carried", "description": "Objects currently carried", "initialValue": 0 },
    { "id": 37, "name": "max_carry_objects", "description": "Maximum objects to carry", "initialValue": 4 },
    { "id": 52, "name": "max_carry_weight", "description": "Maximum weight to carry", "initialValue": 10 },
    { "id": 38, "name": "rug_searched", "description": "Player has searched under the rug", "initialValue": 0 },
    { "id": 39, "name": "door_unlocked", "description": "The front door has been unlocked", "initialValue": 0 }
  ],

  "messages": [
    "You lift the corner of the rug and find a small brass key hidden underneath!",
    "You've already searched under the rug. There's nothing else there.",
    "A faded Persian rug. One corner is curled up, as if something is hidden beneath.",
    "A small brass key. It looks like it might fit the front door lock.",
    "A heavy wooden door with a brass lock. This is the way out of this place.",
    "The book reads: 'The old master always hid his key beneath the study rug.'",
    "The front door is locked. You need to find a key.",
    "You insert the brass key into the lock. It turns with a satisfying click!",
    "The door is already unlocked.",
    "You don't have anything to unlock the door with.",
    "You open the front door and step outside into the fresh air. Freedom at last! Congratulations, you've escaped!",
    "The door is locked. You can't open it without a key."
  ],

  "vocabulary": [
    { "id": 0, "word": "north", "wordType": "verb" },
    { "id": 0, "word": "n", "wordType": "verb" },
    { "id": 1, "word": "south", "wordType": "verb" },
    { "id": 1, "word": "s", "wordType": "verb" },
    { "id": 2, "word": "east", "wordType": "verb" },
    { "id": 2, "word": "e", "wordType": "verb" },
    { "id": 3, "word": "west", "wordType": "verb" },
    { "id": 3, "word": "w", "wordType": "verb" },
    { "id": 4, "word": "examine", "wordType": "verb" },
    { "id": 4, "word": "x", "wordType": "verb" },
    { "id": 4, "word": "look", "wordType": "verb" },
    { "id": 5, "word": "take", "wordType": "verb" },
    { "id": 5, "word": "get", "wordType": "verb" },
    { "id": 6, "word": "drop", "wordType": "verb" },
    { "id": 7, "word": "inventory", "wordType": "verb" },
    { "id": 7, "word": "i", "wordType": "verb" },
    { "id": 8, "word": "search", "wordType": "verb" },
    { "id": 9, "word": "unlock", "wordType": "verb" },
    { "id": 10, "word": "open", "wordType": "verb" },
    { "id": 11, "word": "read", "wordType": "verb" },

    { "id": 0, "word": "key", "wordType": "noun" },
    { "id": 1, "word": "rug", "wordType": "noun" },
    { "id": 1, "word": "carpet", "wordType": "noun" },
    { "id": 2, "word": "book", "wordType": "noun" },
    { "id": 3, "word": "door", "wordType": "noun" },

    { "id": 0, "word": "brass", "wordType": "adjective" },
    { "id": 1, "word": "old", "wordType": "adjective" },
    { "id": 2, "word": "dusty", "wordType": "adjective" },
    { "id": 3, "word": "front", "wordType": "adjective" }
  ],

  "music": []
}
```

## How to Play (Walkthrough)

1. Start in Bedroom
2. GO EAST (to Study)
3. EXAMINE RUG (hints at hidden item)
4. READ BOOK (gives hint about key)
5. SEARCH RUG (finds the key)
6. TAKE KEY
7. GO WEST (back to Bedroom)
8. GO NORTH (to Hallway)
9. UNLOCK DOOR (with the key)
10. OPEN DOOR (win!)

## What This Example Demonstrates

- **Locations:** 3 connected rooms with navigation
- **Objects:** Takeable item (book), scenery (rug, door), hidden item (key)
- **Rules:** Examine commands, search action, lock/unlock puzzle, win condition
- **Flags:** Tracking search state and door state
- **Messages:** Varied responses for different situations
- **Vocabulary:** Movement, examine, manipulation verbs with synonyms

## Expanding This Game

Ideas to practice:
- Add a dark basement that needs a lantern
- Add an NPC who gives a hint
- Add a second puzzle (combination lock?)
- Add more rooms and items
- Add a time limit before "something bad happens"

Use the other guides to implement these features!
