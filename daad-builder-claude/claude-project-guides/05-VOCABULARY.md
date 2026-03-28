# Creating Vocabulary

## IMPORTANT: Auto-Generated Vocabulary

**The compiler automatically generates most vocabulary!** You only need to add **custom game-specific verbs**.

### What the Compiler Auto-Generates (DO NOT ADD THESE):
- ✓ Movement directions: NORTH/N, SOUTH/S, EAST/E, WEST/W, UP/U, DOWN/D, etc. (as nouns, IDs 2-13)
- ✓ Inventory command: INVEN/I (as nouns, ID 14)
- ✓ Standard verbs: GET, TAKE, DROP, EXAMINE, LOOK (starting at ID 20+)
- ✓ Object nouns: Extracted from your objects (starting at ID 50+)
- ✓ Object adjectives: Extracted from your objects

### What You SHOULD Add:
- ✓ Custom game-specific verbs (e.g., "interview", "accuse", "deduce", "hack")
- ✓ Adverbs
- ✓ Prepositions

### What You Should NOT Add:
- ✗ Movement directions (auto-generated)
- ✗ Standard verbs like GET, TAKE, DROP, EXAMINE, LOOK (auto-generated)
- ✗ INVENTORY or INVEN (auto-generated)
- ✗ Nouns (these should be on objects, not in vocabulary)
- ✗ Adjectives (these should be on objects, not in vocabulary)

## Vocabulary Entry Structure

```json
{
  "id": 1,
  "word": "interview",
  "wordType": "verb"
}
```

**Note:** The ID you provide will be **ignored** - the compiler assigns IDs automatically to ensure DAAD compliance.

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | number | Yes | Any number (compiler reassigns IDs automatically) |
| word | string | Yes | The word (max 20 characters, truncated to 10 in output) |
| wordType | string | Yes | "verb", "adverb", or "preposition" |

## Word Types

### Custom Verbs (Game-Specific Actions)
**Only add verbs unique to your game** - standard verbs are auto-generated:
```json
{ "id": 1, "word": "interview", "wordType": "verb" }
{ "id": 2, "word": "accuse", "wordType": "verb" }
{ "id": 3, "word": "deduce", "wordType": "verb" }
{ "id": 4, "word": "analyze", "wordType": "verb" }
```

### Nouns (Use Objects Instead!)
**Do NOT add nouns to vocabulary!** Define them on objects:
```json
// WRONG - Don't do this
{ "id": 0, "word": "key", "wordType": "noun" }

// RIGHT - Define on object instead
{
  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "A brass key"
    }
  ]
}
```

### Adjectives (Use Objects Instead!)
**Do NOT add adjectives to vocabulary!** Define them on objects:
```json
// WRONG - Don't do this
{ "id": 0, "word": "brass", "wordType": "adjective" }

// RIGHT - Define on object instead
{
  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "A brass key"
    }
  ]
}
```

## Auto-Generated Vocabulary

The compiler automatically generates:

### Movement Directions (IDs 2-13, as NOUNS)
```
NORTH/N, SOUTH/S, EAST/E, WEST/W
NORTHEAST/NE, NORTHWEST/NW, SOUTHEAST/SE, SOUTHWEST/SW
UP/U, DOWN/D, IN/INSIDE, OUT/OUTSIDE
```

### Inventory (ID 14, as NOUNS)
```
INVEN/I
```

### Standard Verbs (IDs 20+)
```
GET, TAKE, DROP, EXAMINE, LOOK
```

**You don't need to add any of these!** The compiler handles them automatically.

## Matching Objects to Vocabulary

Every object noun needs a vocabulary entry:

```json
{
  "objects": [
    {
      "id": 0,
      "noun": "key",
      "adjective": "brass",
      "description": "A brass key"
    },
    {
      "id": 1,
      "noun": "key",
      "adjective": "silver",
      "description": "A silver key"
    }
  ],
  "vocabulary": [
    { "id": 0, "word": "key", "wordType": "noun" },
    { "id": 0, "word": "brass", "wordType": "adjective" },
    { "id": 1, "word": "silver", "wordType": "adjective" }
  ]
}
```

The player can say:
- `TAKE KEY` (gets the first key present)
- `TAKE BRASS KEY` (specifically the brass key)
- `TAKE SILVER KEY` (specifically the silver key)

## Word Length Limit

**Maximum 10 characters per word!**

DAAD truncates longer words. Only the first 10 characters are matched.

```
# Good
"examine" (7 chars) ✓
"flashlight" (10 chars) ✓

# Bad - will be truncated
"investigate" (11 chars) → "investigat"
"screwdriver" (11 chars) → "screwdrive"

# Solution: use shorter words or abbreviations
"torch" instead of "flashlight"
"probe" instead of "investigate"
```

## Example: Creating Vocabulary for a Mystery Game

Prompt to Claude:
```
Create vocabulary for a detective mystery game:
- Movement (all directions)
- Examination verbs with synonyms
- Evidence handling (take, drop, examine)
- Interrogation verbs
- Object nouns: magnifier, notebook, badge, witness, suspect, clue, evidence
- Adjective for distinguishing: bloody, torn, hidden, locked
```

Expected output:
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
    { "id": 4, "word": "examine", "wordType": "verb" },
    { "id": 4, "word": "x", "wordType": "verb" },
    { "id": 4, "word": "look", "wordType": "verb" },
    { "id": 4, "word": "inspect", "wordType": "verb" },
    { "id": 5, "word": "take", "wordType": "verb" },
    { "id": 5, "word": "get", "wordType": "verb" },
    { "id": 5, "word": "grab", "wordType": "verb" },
    { "id": 6, "word": "drop", "wordType": "verb" },
    { "id": 7, "word": "inventory", "wordType": "verb" },
    { "id": 7, "word": "i", "wordType": "verb" },
    { "id": 8, "word": "ask", "wordType": "verb" },
    { "id": 8, "word": "question", "wordType": "verb" },
    { "id": 9, "word": "accuse", "wordType": "verb" },
    { "id": 10, "word": "show", "wordType": "verb" },
    { "id": 11, "word": "search", "wordType": "verb" },
    { "id": 12, "word": "open", "wordType": "verb" },
    { "id": 13, "word": "read", "wordType": "verb" },

    { "id": 0, "word": "magnifier", "wordType": "noun" },
    { "id": 0, "word": "glass", "wordType": "noun" },
    { "id": 1, "word": "notebook", "wordType": "noun" },
    { "id": 1, "word": "notes", "wordType": "noun" },
    { "id": 2, "word": "badge", "wordType": "noun" },
    { "id": 3, "word": "witness", "wordType": "noun" },
    { "id": 4, "word": "suspect", "wordType": "noun" },
    { "id": 5, "word": "clue", "wordType": "noun" },
    { "id": 6, "word": "evidence", "wordType": "noun" },

    { "id": 0, "word": "bloody", "wordType": "adjective" },
    { "id": 1, "word": "torn", "wordType": "adjective" },
    { "id": 2, "word": "hidden", "wordType": "adjective" },
    { "id": 3, "word": "locked", "wordType": "adjective" }
  ]
}
```

## ID Assignment Strategy

### For Verbs
- Movement: 0-10
- Object manipulation: 11-20
- Interaction: 21-30
- Game commands: 31-40
- Custom actions: 41+

### For Nouns
- Use IDs matching object IDs when practical
- Or use separate sequence for nouns

### For Adjectives
- Use IDs matching when they're unique to one object
- Or use separate sequence

## Common Mistakes

### 1. Missing Vocabulary Entry
```
Object noun: "crowbar"
No vocabulary entry for "crowbar"
Result: Player can't interact with crowbar
```

### 2. Mismatched Spelling
```
Object noun: "flashlight"
Vocabulary: "flash" (different word)
Result: "TAKE FLASHLIGHT" won't work
```

### 3. Word Too Long
```
Vocabulary: "screwdriver" (11 chars)
Player types: "screwdriver"
Parser sees: "screwdrive" (first 10 chars)
Result: May work, but inconsistent
```

### 4. Duplicate IDs for Non-Synonyms
```
{ "id": 5, "word": "key", "wordType": "noun" }
{ "id": 5, "word": "door", "wordType": "noun" }
Result: Parser treats KEY and DOOR as same word!
```

## Checklist

Before finalizing vocabulary:
- [ ] All object nouns have vocabulary entries
- [ ] All object adjectives have vocabulary entries
- [ ] All verbs used in rules have vocabulary entries
- [ ] Synonym groups share the same ID
- [ ] Non-synonyms have different IDs
- [ ] All words are 10 characters or less
- [ ] Standard movement commands are included
- [ ] Common synonyms are included (x/examine, get/take)

## Next Steps

After creating vocabulary:
1. Verify objects match vocabulary nouns (see `03-OBJECTS.md`)
2. Create rules using vocabulary IDs (see `04-RULES.md`)
3. Add messages for invalid commands (see `06-MESSAGES.md`)
