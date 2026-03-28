# DAAD Builder - Claude Project Guide

## Overview

This guide helps you use Claude to create DAAD adventure games step-by-step. You can generate game content as JSON, then import it directly into DAAD Builder.

## What is DAAD?

DAAD (Diseñador de Aventuras Avanzadas/Advanced Adventure Designer) is a text adventure authoring system for retro platforms (ZX Spectrum, Amstrad CPC, MSX, C64, etc). Games use a two-word parser (VERB NOUN) and rule-based logic.

## Workflow

1. **Plan your game** - Describe your adventure idea to Claude
2. **Generate JSON** - Claude creates game data in the correct format
3. **Import into Builder** - Copy the JSON and import it
4. **Test and iterate** - Use the Builder's play test mode
5. **Export** - Compile to your target platform

## Quick Start

Ask Claude to generate game elements using the JSON format described in the guides. For example:

```
Create 3 locations for a haunted house game:
- An entrance hall with exits north and east
- A dining room to the east
- A dark cellar to the north (requires light)
```

Claude will generate JSON you can paste into the Builder's merge/import feature.

## File Organization

- `01-MAIN-GUIDE.md` - This overview (you are here)
- `02-LOCATIONS.md` - Creating rooms and exits
- `03-OBJECTS.md` - Creating items and containers
- `04-RULES.md` - Creating game logic (responses)
- `05-VOCABULARY.md` - Words the parser understands
- `06-MESSAGES.md` - Text strings and descriptions
- `07-FLAGS.md` - Variables and game state
- `08-FULL-EXAMPLE.md` - Complete mini-game example
- `09-JSON-REFERENCE.md` - Copy-paste JSON templates

## Important Limits

- **Word length:** Maximum 10 characters for vocabulary words
- **Flag values:** 0-255 only (integer)
- **Parser:** Two-word commands only (VERB NOUN)
- **Location IDs:** Start from 0, sequential
- **Object IDs:** Start from 0, sequential

## Importing JSON into DAAD Builder

### Method 1: Merge Panel
1. Open the Merge panel in DAAD Builder
2. Paste the JSON into the import field
3. Select which elements to merge
4. Click merge

### Method 2: File Import
1. Save the JSON to a `.daad.json` file
2. Use File > Open in DAAD Builder
3. Load the complete game

## Common Prompts

### Starting a New Game
```
Create the foundation for a mystery adventure game:
- Title: "The Missing Heirloom"
- Author: "Your Name"
- 5 starting locations (living room, kitchen, garden, bedroom, attic)
- Basic navigation between rooms
- 3 initial objects (a magnifying glass, old letter, locked box)
```

### Adding a Puzzle
```
Add a puzzle where the player must:
1. Find a key hidden under a rug in the bedroom
2. Use the key to open the locked box in the attic
3. Inside the box is a clue (a photograph)

Create all needed objects, locations updates, rules, vocabulary, and messages.
```

### Generating Specific Elements
```
Generate JSON for 5 new vocabulary words:
- Verbs: UNLOCK, SEARCH, READ
- Nouns: RUG, PHOTOGRAPH
```

## Tips for Claude

When asking Claude to create game content:

1. **Be specific about IDs** - If you have existing content, tell Claude what IDs to start from
2. **Describe relationships** - Explain how new content connects to existing content
3. **Request complete JSON** - Ask for all required fields, not partial objects
4. **Test incrementally** - Import small pieces and test before adding more
5. **Include vocabulary** - Object nouns need matching vocabulary entries

## JSON Validation

Before importing, check that your JSON:
- Has unique IDs within each category
- References valid IDs (objects reference existing locations)
- Includes vocabulary for all nouns/verbs used
- Has messages for all message index references
- Uses correct field names (see reference guide)

## Process Tables

DAAD has 4 process tables for different rule types:

| Table | Name | When it runs |
|-------|------|--------------|
| PRO0 | Parser | Every turn, processes player input |
| PRO1 | Response | After PRO0, additional responses |
| PRO2 | Before | Before location description |
| PRO3 | After | After location description |

Most rules go in PRO0 or PRO1. Use PRO2/PRO3 for location-specific events.

## Reserved Flags

These flags are used by DAAD automatically:

| Flag | Name | Purpose |
|------|------|---------|
| 1 | objects_carried | Count of carried objects |
| 37 | max_carry_objects | Max objects allowed (default: 4) |
| 52 | max_carry_weight | Max weight allowed (default: 10) |

Don't overwrite these unless you know what you're doing.

## Next Steps

1. Read the individual guides for each element type
2. Start with locations (`02-LOCATIONS.md`)
3. Add objects (`03-OBJECTS.md`)
4. Create vocabulary (`05-VOCABULARY.md`)
5. Add game logic (`04-RULES.md`)
6. Test and refine!

Happy adventuring!
