# DAAD Game Data Structure Reference

## Complete DaadGame Type

```typescript
interface DaadGame {
  partNumber: number;          // Usually 1
  title: string;               // Game title
  author: string;              // Author name
  version: string;             // Version string
  introText?: string;          // Optional intro text shown at start
  locations: Location[];       // Array of rooms
  objects: GameObject[];       // Array of items
  rules: Rule[];              // Array of Responses (game logic)
  flags: Flag[];              // Array of variables
  messages: string[];         // Array of text strings
  vocabulary: VocabEntry[];   // Array of words
  music: Music[];            // Array of music tracks
}
```

## Location Structure

```typescript
interface Location {
  id: number;                 // Unique location ID (0-based)
  name: string;               // Room name
  description: string;        // Room description text
  isDark: boolean;           // Whether room is dark
  exits: {                   // Directional exits
    north: number | null,
    south: number | null,
    east: number | null,
    west: number | null,
    northeast: number | null,
    northwest: number | null,
    southeast: number | null,
    southwest: number | null,
    up: number | null,
    down: number | null,
    in: number | null,
    out: number | null
  };
  x: number;                 // Editor X position
  y: number;                 // Editor Y position
  image?: {                  // Optional location image
    sourceData: string;      // Base64 image data
    yPosition: number;
    height: number;
    platformImages?: {...}   // Platform-specific versions
  };
}
```

## GameObject Structure

```typescript
interface GameObject {
  id: number;                 // Unique object ID (0-based)
  noun: string;              // Object noun (e.g., "key")
  adjective: string;         // Object adjective (e.g., "brass")
  description: string;       // Object description
  icon: string;             // Display icon (emoji or text)
  weight: number;           // Object weight
  location: ObjectLocation; // Where object is located
  isContainer: boolean;     // Can hold other objects
  isWearable: boolean;      // Can be worn
  isTakeable: boolean;      // Can be picked up
  isLightSource: boolean;   // Provides light
  isPSI: boolean;           // Is a character (Person/Special Item)
  containerCapacity?: number; // Max items if container
}

// ObjectLocation types:
type ObjectLocation =
  | { type: "at"; locationId: number }      // At a location
  | { type: "carried" }                      // In player inventory
  | { type: "worn" }                         // Worn by player
  | { type: "limbo" }                        // Nowhere (removed)
  | { type: "inside"; containerId: number }; // Inside container
```

## Rule (Response) Structure

```typescript
interface Rule {
  id: number;              // Unique rule ID
  name: string;            // Descriptive name
  process: ProcessTable;   // "PRO0" | "PRO1" | "PRO2" | "PRO3"
  enabled: boolean;        // Whether rule is active
  conditions: Condition[]; // Conditions that must be met
  actions: Action[];      // Actions to execute
}

// Process tables:
// PRO0 = Parser table (main responses)
// PRO1 = Response table
// PRO2 = Before description
// PRO3 = After description
```

## Condition Structure

```typescript
interface Condition {
  type: ConditionType;
  params: Record<string, unknown>;
}

// Common conditions:
{type: "AT", params: {locno: 5}}              // Player at location 5
{type: "PRESENT", params: {objno: 3}}         // Object 3 is present
{type: "CARRIED", params: {objno: 3}}         // Object 3 is carried
{type: "NOTZERO", params: {flagno: 38}}       // Flag 38 is not zero
{type: "ZERO", params: {flagno: 38}}          // Flag 38 is zero
{type: "EQ", params: {flagno: 38, value: 5}}  // Flag 38 equals 5
{type: "GT", params: {flagno: 38, value: 3}}  // Flag 38 > 3
```

## Action Structure

```typescript
interface Action {
  type: ActionType;
  params: Record<string, unknown>;
}

// Common actions:
{type: "MESSAGE", params: {mesno: 10}}        // Display message 10
{type: "GOTO", params: {locno: 5}}            // Move to location 5
{type: "GET", params: {objno: 3}}             // Get object 3
{type: "DROP", params: {objno: 3}}            // Drop object 3
{type: "SET", params: {flagno: 38}}           // Set flag 38 to 1
{type: "CLEAR", params: {flagno: 38}}         // Set flag 38 to 0
{type: "LET", params: {flagno: 38, value: 5}} // Set flag 38 to 5
{type: "DONE", params: {}}                    // Stop processing rules
{type: "DESC", params: {}}                    // Describe location
{type: "END", params: {}}                     // End game (win)
```

## Flag Structure

```typescript
interface Flag {
  id: number;            // Flag ID (1-255)
  name: string;          // Descriptive name
  description: string;   // What this flag tracks
  initialValue: number;  // Starting value (0-255)
}

// Reserved flags:
// 1 = objects_carried (auto-updated)
// 37 = max_carry_objects (default: 4)
// 52 = max_carry_weight (default: 10)
```

## VocabEntry Structure

```typescript
interface VocabEntry {
  id: number;              // Unique vocab ID
  word: string;            // The word (max 20 chars)
  wordType: VocabType;     // "verb" | "noun" | "adjective"
}

// Examples:
{id: 0, word: "examine", wordType: "verb"}
{id: 1, word: "take", wordType: "verb"}
{id: 2, word: "key", wordType: "noun"}
{id: 3, word: "brass", wordType: "adjective"}
```

## Music Structure

```typescript
interface Music {
  id: number;
  name: string;
  tempo: number;        // BPM (40-240)
  shape: number;        // Waveform (0-7)
  volume: number;       // 0-15000
  notes: MusicNote[];
}

interface MusicNote {
  note: NoteName;      // "C" | "C#" | "D" | ... | "B" | "R" (rest)
  octave: number;      // 3-6
  duration: number;    // 1, 2, 4, 8, 16, 32
  dotted: boolean;     // Extends duration by 50%
}
```

## Complete Example

```json
{
  "partNumber": 1,
  "title": "Mystery at Knight's Cross",
  "author": "Claude",
  "version": "1.0",
  "introText": "You are Max Carrados, the blind detective...",
  "locations": [
    {
      "id": 0,
      "name": "Study",
      "description": "Your private study.",
      "isDark": false,
      "exits": {
        "north": null, "south": null, "east": 1, "west": null,
        "northeast": null, "northwest": null, "southeast": null,
        "southwest": null, "up": null, "down": null,
        "in": null, "out": null
      },
      "x": 100,
      "y": 100
    }
  ],
  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "A small brass key.",
      "icon": "🔑",
      "weight": 1,
      "location": {"type": "at", "locationId": 0},
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    }
  ],
  "rules": [
    {
      "id": 0,
      "name": "EXAMINE KEY",
      "process": "PRO0",
      "enabled": true,
      "conditions": [
        {"type": "PRESENT", "params": {"objno": 0}}
      ],
      "actions": [
        {"type": "MESSAGE", "params": {"mesno": 0}},
        {"type": "DONE", "params": {}}
      ]
    }
  ],
  "flags": [
    {"id": 1, "name": "objects_carried", "description": "Auto-updated", "initialValue": 0},
    {"id": 37, "name": "max_carry_objects", "description": "Max objects", "initialValue": 4},
    {"id": 38, "name": "key_found", "description": "Player found key", "initialValue": 0}
  ],
  "messages": [
    "The key has strange markings on it."
  ],
  "vocabulary": [
    {"id": 0, "word": "examine", "wordType": "verb"},
    {"id": 1, "word": "x", "wordType": "verb"},
    {"id": 2, "word": "key", "wordType": "noun"}
  ],
  "music": []
}
```

## Notes

- IDs should be unique within each category
- IDs are typically 0-based sequential
- Location/object/flag references must point to existing IDs
- Exits with `null` mean no connection in that direction
- Messages are referenced by array index (0-based)
- All condition/action params use lowercase parameter names
- ObjectLocation type must match exactly ("at", "carried", "worn", "limbo", "inside")
