# Claude Project Guides for DAAD Builder

## What's This?

These guides are designed to be added to a **Claude Project** in claude.ai. They teach Claude how to generate DAAD adventure game content that you can import directly into DAAD Builder.

## How to Use

### Step 1: Create a Claude Project

1. Go to [claude.ai](https://claude.ai)
2. Click "Projects" in the sidebar
3. Create a new project (e.g., "DAAD Game Development")

### Step 2: Add These Guides as Project Knowledge

1. In your project, click "Project knowledge"
2. Upload these markdown files:
   - `01-MAIN-GUIDE.md`
   - `02-LOCATIONS.md`
   - `03-OBJECTS.md`
   - `04-RULES.md`
   - `05-VOCABULARY.md`
   - `06-MESSAGES.md`
   - `07-FLAGS.md`
   - `08-FULL-EXAMPLE.md`
   - `09-JSON-REFERENCE.md`

### Step 3: Start Building Your Game

Now you can chat with Claude in your project and ask it to:

- "Create 5 locations for a haunted mansion game"
- "Add objects for a mystery investigation"
- "Create a key-and-lock puzzle with all necessary rules"
- "Generate vocabulary for these new objects"

Claude will generate JSON that you can copy and import into DAAD Builder.

### Step 4: Import into DAAD Builder

1. Copy the JSON Claude generates
2. In DAAD Builder, use the Merge panel or File > Import
3. Paste and import the content
4. Test in Play Test mode

## File Overview

| File | Purpose |
|------|---------|
| `01-MAIN-GUIDE.md` | Overview and workflow |
| `02-LOCATIONS.md` | Creating rooms and exits |
| `03-OBJECTS.md` | Creating items, containers, NPCs |
| `04-RULES.md` | Game logic and responses |
| `05-VOCABULARY.md` | Parser words |
| `06-MESSAGES.md` | Text strings |
| `07-FLAGS.md` | Variables and state tracking |
| `08-FULL-EXAMPLE.md` | Complete mini-game example |
| `09-JSON-REFERENCE.md` | Copy-paste templates |
| `10-MAX-CARRADOS-GUIDE.md` | Advanced example with blind protagonist |
| `EYES_OF_MAX_CARRADOS.json` | Complete Max Carrados game (import ready) |

## Example Conversation

**You:** Create 3 locations for a pirate adventure: a ship deck, captain's cabin, and cargo hold.

**Claude:** Here's the JSON for your pirate locations:
```json
{
  "locations": [
    {
      "id": 0,
      "name": "Ship Deck",
      "description": "The main deck of a weathered pirate ship...",
      ...
    },
    ...
  ]
}
```

**You:** Now add a treasure chest and a rusty cutlass as objects.

**Claude:** Here are the objects with matching vocabulary:
```json
{
  "objects": [...],
  "vocabulary": [...]
}
```

## Tips

1. **Build incrementally** - Create locations first, then objects, then rules
2. **Test often** - Import small pieces and test before adding more
3. **Be specific** - Tell Claude exact IDs if you have existing content
4. **Ask for complete JSON** - Request vocabulary and messages together with objects/rules

## Troubleshooting

**Problem:** Parser doesn't recognize a word
**Solution:** Make sure vocabulary entry exists for that noun/verb

**Problem:** Rule doesn't trigger
**Solution:** Check conditions and ensure DONE is at the end

**Problem:** Object not visible
**Solution:** Check its location isn't "limbo"

## Need More Help?

- Check the `08-FULL-EXAMPLE.md` for a complete working game
- Use `09-JSON-REFERENCE.md` for quick copy-paste templates
- Refer to individual guides for detailed explanations
