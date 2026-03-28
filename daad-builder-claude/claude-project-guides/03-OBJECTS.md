# Creating Objects

## What is an Object?

Objects are items the player can interact with - things they can take, examine, use, and manipulate. Objects include physical items, containers, wearables, light sources, and NPCs (characters).

## Object Structure

```json
{
  "id": 0,
  "noun": "key",
  "adjective": "brass",
  "description": "A small brass key with an ornate handle.",
  "icon": "🔑",
  "weight": 1,
  "location": { "type": "at", "locationId": 2 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Unique ID (0-based, sequential) |
| noun | string | Yes | Main word to identify object (max 10 chars) |
| adjective | string | Yes | Modifier to distinguish similar objects (max 10 chars, use "" if none) |
| description | string | Yes | Text shown when examining |
| icon | string | Yes | Emoji or character for UI display |
| weight | number | Yes | How heavy (affects carry limit) |
| location | object | Yes | Where the object is (see below) |
| isContainer | boolean | Yes | Can hold other objects |
| isWearable | boolean | Yes | Can be worn |
| isTakeable | boolean | Yes | Can be picked up |
| isLightSource | boolean | Yes | Provides light in dark rooms |
| isPSI | boolean | Yes | Is a character/NPC |
| containerCapacity | number | No | Max items if container (default: 5) |

## Location Types

Objects can be in different states:

```json
// At a specific room
{ "type": "at", "locationId": 2 }

// Carried by player
{ "type": "carried" }

// Worn by player
{ "type": "worn" }

// Not in game (hidden/removed)
{ "type": "limbo" }

// Inside a container object
{ "type": "inside", "containerId": 5 }
```

## Object Types

### Basic Takeable Item
```json
{
  "id": 0,
  "noun": "book",
  "adjective": "red",
  "description": "A leather-bound book with gold lettering.",
  "icon": "📕",
  "weight": 2,
  "location": { "type": "at", "locationId": 1 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

### Non-Takeable Scenery
```json
{
  "id": 1,
  "noun": "painting",
  "adjective": "old",
  "description": "A dusty oil painting of a stern-looking gentleman.",
  "icon": "🖼️",
  "weight": 10,
  "location": { "type": "at", "locationId": 3 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": false,
  "isLightSource": false,
  "isPSI": false
}
```

### Light Source
```json
{
  "id": 2,
  "noun": "lantern",
  "adjective": "",
  "description": "An old oil lantern. It casts a warm glow.",
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

### Wearable Item
```json
{
  "id": 3,
  "noun": "coat",
  "adjective": "heavy",
  "description": "A thick wool coat that will keep you warm.",
  "icon": "🧥",
  "weight": 3,
  "location": { "type": "at", "locationId": 2 },
  "isContainer": false,
  "isWearable": true,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false
}
```

### Container
```json
{
  "id": 4,
  "noun": "box",
  "adjective": "wooden",
  "description": "A small wooden box with a hinged lid.",
  "icon": "📦",
  "weight": 3,
  "location": { "type": "at", "locationId": 1 },
  "isContainer": true,
  "isWearable": false,
  "isTakeable": true,
  "isLightSource": false,
  "isPSI": false,
  "containerCapacity": 3
}
```

### Character/NPC
```json
{
  "id": 5,
  "noun": "guard",
  "adjective": "sleepy",
  "description": "A guard in a rumpled uniform. He looks half-asleep.",
  "icon": "💂",
  "weight": 100,
  "location": { "type": "at", "locationId": 4 },
  "isContainer": false,
  "isWearable": false,
  "isTakeable": false,
  "isLightSource": false,
  "isPSI": true
}
```

## Example: Creating Objects for a Mystery Game

Prompt to Claude:
```
Create objects for a mystery game:
1. A magnifying glass (starting item, carried)
2. A torn letter found in the study (location 2)
3. A locked safe that can't be moved (location 3)
4. A key hidden under a rug (limbo - will be revealed by rule)
5. A detective's hat that can be worn (location 0)
```

Expected output:
```json
{
  "objects": [
    {
      "id": 0,
      "noun": "glass",
      "adjective": "magnifying",
      "description": "Your trusty magnifying glass. Essential for any detective.",
      "icon": "🔍",
      "weight": 1,
      "location": { "type": "carried" },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 1,
      "noun": "letter",
      "adjective": "torn",
      "description": "A letter torn in half. The visible text reads: 'Meet me at midnight...'",
      "icon": "📜",
      "weight": 0,
      "location": { "type": "at", "locationId": 2 },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 2,
      "noun": "safe",
      "adjective": "locked",
      "description": "A heavy wall safe with a combination lock. It's firmly anchored to the wall.",
      "icon": "🔐",
      "weight": 100,
      "location": { "type": "at", "locationId": 3 },
      "isContainer": true,
      "isWearable": false,
      "isTakeable": false,
      "isLightSource": false,
      "isPSI": false,
      "containerCapacity": 5
    },
    {
      "id": 3,
      "noun": "key",
      "adjective": "small",
      "description": "A small brass key. It looks like it fits a desk drawer.",
      "icon": "🔑",
      "weight": 0,
      "location": { "type": "limbo" },
      "isContainer": false,
      "isWearable": false,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    },
    {
      "id": 4,
      "noun": "hat",
      "adjective": "detective",
      "description": "A classic deerstalker hat. Makes you look properly detective-ish.",
      "icon": "🎩",
      "weight": 1,
      "location": { "type": "at", "locationId": 0 },
      "isContainer": false,
      "isWearable": true,
      "isTakeable": true,
      "isLightSource": false,
      "isPSI": false
    }
  ]
}
```

## Important: Vocabulary

Every object's noun (and adjective if used) needs a matching vocabulary entry:

```json
{
  "vocabulary": [
    { "id": 0, "word": "glass", "wordType": "noun" },
    { "id": 1, "word": "magnifying", "wordType": "adjective" },
    { "id": 2, "word": "letter", "wordType": "noun" },
    { "id": 3, "word": "torn", "wordType": "adjective" },
    { "id": 4, "word": "safe", "wordType": "noun" },
    { "id": 5, "word": "key", "wordType": "noun" },
    { "id": 6, "word": "hat", "wordType": "noun" }
  ]
}
```

## Weight System

- Player has a maximum carry weight (default: flag 52 = 10)
- Player has a maximum object count (default: flag 37 = 4)
- Light objects: 0-1
- Normal objects: 2-3
- Heavy objects: 4-5
- Immovable objects: 10+ (set `isTakeable: false` anyway)

## Common Icons

| Type | Icons |
|------|-------|
| Keys | 🔑 🗝️ |
| Containers | 📦 🗃️ 💼 🎒 |
| Documents | 📜 📄 📝 📰 |
| Light | 🔦 🕯️ 💡 🏮 |
| Weapons | 🔪 ⚔️ 🏹 |
| Clothing | 🧥 👒 🎩 👓 |
| Characters | 👤 💂 👨 👩 |
| Valuables | 💎 💰 🏆 👑 |
| Food | 🍎 🍞 🥪 🍖 |
| Tools | 🔧 🔨 🪓 |

## Description Tips

Good object descriptions:
- Describe appearance and notable features
- Hint at uses without being obvious
- Match the game's tone and era
- Are 1-2 sentences

```
# Good
"A tarnished silver locket on a delicate chain. Something rattles inside."

# Too vague
"A locket."

# Too revealing
"A locket containing the key to the final puzzle."
```

## Checklist

Before finalizing objects:
- [ ] All IDs are unique and sequential from 0
- [ ] All nouns are max 10 characters
- [ ] All adjectives are max 10 characters
- [ ] Location references point to valid location IDs
- [ ] Container references point to valid object IDs
- [ ] Weights are appropriate for gameplay
- [ ] Vocabulary entries exist for all nouns/adjectives
- [ ] Icons display correctly

## Next Steps

After creating objects:
1. Add vocabulary for object nouns/adjectives (see `05-VOCABULARY.md`)
2. Create rules for object interactions (see `04-RULES.md`)
3. Write messages for object-specific text (see `06-MESSAGES.md`)
