# Merge Data Workflow

## Overview

The Merge Data panel allows incremental game development through JSON merging. This is particularly useful when working with an AI assistant to build games in stages.

## How It Works

1. **Navigate to Merge Data panel** (in Build section of sidebar)
2. **Paste JSON data** into the text area
3. **Click "Merge Data"** to integrate it into the current game
4. **View merge log** to see what was added/updated
5. **Save the game** normally to persist changes

## Data Structure

The merge system accepts partial game data in JSON format. You can merge any combination of these top-level properties:

```json
{
  "locations": [...],
  "objects": [...],
  "rules": [...],
  "vocabulary": [...],
  "flags": [...],
  "messages": [...],
  "music": [...]
}
```

## Merge Behavior

- **Matching by ID**: Items with matching IDs are **updated** (merged)
- **New items**: Items with new IDs are **added**
- **Deletion**: The merge system does NOT delete items
- **Arrays**: For messages, items are added or updated by index position

## Typical Workflow Stages

### Stage 1: Locations
Create all rooms with exits and descriptions:
```json
{
  "locations": [
    {
      "id": 0,
      "name": "Starting Room",
      "description": "...",
      "isDark": false,
      "exits": {...},
      "x": 100,
      "y": 100
    }
  ]
}
```

### Stage 2: Objects
Add items to rooms:
```json
{
  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "...",
      "location": {"type": "at", "locationId": 5},
      "weight": 1,
      "isTakeable": true,
      "isContainer": false,
      "isWearable": false,
      "isLightSource": false,
      "isPSI": false,
      "icon": "🔑"
    }
  ]
}
```

### Stage 3: Vocabulary
Add verbs, nouns, and adjectives:
```json
{
  "vocabulary": [
    {"id": 0, "word": "examine", "wordType": "verb"},
    {"id": 1, "word": "take", "wordType": "verb"},
    {"id": 2, "word": "key", "wordType": "noun"}
  ]
}
```

### Stage 4: Messages
Add text strings:
```json
{
  "messages": [
    "You examine the key carefully.",
    "The door is locked.",
    "You hear a click!"
  ]
}
```

### Stage 5: Flags
Add game variables:
```json
{
  "flags": [
    {"id": 38, "name": "door_unlocked", "description": "Set when door is unlocked", "initialValue": 0},
    {"id": 39, "name": "key_examined", "description": "Set when key is examined", "initialValue": 0}
  ]
}
```

### Stage 6: Rules/Responses
Add game logic:
```json
{
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
        {"type": "SET", "params": {"flagno": 39}},
        {"type": "DONE", "params": {}}
      ]
    }
  ]
}
```

## Export Current Game

Use the **📋 Copy Game JSON** button to export your entire current game to clipboard. This allows you to:
- Share your game data with an AI assistant
- Back up your current state
- Compare versions
- Debug issues

## Tips

1. **Work in stages**: Build locations first, then objects, then logic
2. **Test frequently**: Merge small batches and test in Play Test panel
3. **Use merge log**: Check the log to verify what was added/updated
4. **Save regularly**: Save your project after successful merges
5. **Keep backups**: Use "Copy Game JSON" before major changes

## Error Handling

- Invalid JSON will show an error alert
- Malformed data may cause issues - ensure proper structure
- IDs should be unique within each category
- Location IDs in exits must reference existing locations
- Object locations must reference valid location IDs

## Example: Multi-Stage Development

```
Session 1: Create world structure
- Merge 15 locations with exits
- Save as "myGame_v1.daad.json"

Session 2: Populate world
- Merge 20 objects placed in rooms
- Save as "myGame_v2.daad.json"

Session 3: Add interactivity
- Merge vocabulary (30 words)
- Merge messages (50 text strings)
- Save as "myGame_v3.daad.json"

Session 4: Implement logic
- Merge 25 Responses for game mechanics
- Test in Play Test
- Save as "myGame_final.daad.json"
```

## Integration with AI Assistants

When working with an AI:

1. **Describe what you want**: "I need 10 locations for a mystery game"
2. **AI provides JSON**: Assistant generates properly formatted JSON
3. **You merge it**: Paste into Merge Data panel
4. **Iterate**: Request changes, AI provides updated JSON
5. **Export for context**: Use "Copy Game JSON" to give AI current state

This workflow allows building complex games incrementally without manual data entry.
