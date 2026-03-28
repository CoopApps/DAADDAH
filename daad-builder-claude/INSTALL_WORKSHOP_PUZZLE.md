# Installing the Workshop Puzzle Expansion

## What This Adds

### New Locations (2)
- **Location 15:** Mead's Workshop - The solo puzzle location
- **Location 16:** Telegram Office - Where Carlyle goes when called away

### New Objects (10)
- **11:** Workbench (contains carved number clue 6-2-4)
- **12:** Tool Rack (audio clue - count tools)
- **13:** Leather Apron (olfactory clue - smell chemicals)
- **14:** Locked Drawer (puzzle goal - contains evidence)
- **15:** Blackmail Letter (evidence item)
- **16:** Payment Receipts (evidence item)
- **17:** Technical Diagram (evidence item)
- **18:** Urgent Telegram (triggers Carlyle departure)
- **19:** Combination Lock (part of puzzle)
- **20:** Mrs. Mead (NPC character)

### New Vocabulary (21 words)
**Verbs:** feel, listen, smell, unlock, use
**Nouns:** workbench, drawer, rack, apron, lock, letter, receipts, diagram, combination, workshop, tools
**Adjectives:** heavy, locked, blackmail, technical, payment

### New Rules (10)
- **Rule 40:** Carlyle Departure (triggers when entering Mead's cottage)
- **Rule 41:** FEEL WORKBENCH (reveals carved numbers 6-2-4)
- **Rule 42:** LISTEN in workshop (count tools: 6-2-4)
- **Rule 43:** SMELL APRON (detect chemicals: 6-2-4)
- **Rule 44:** UNLOCK drawer (success with combination 624)
- **Rule 45:** READ blackmail letter
- **Rule 46:** EXAMINE payment receipts
- **Rule 47:** EXAMINE technical diagram
- **Rule 48:** ACCUSE PENDLETON (enhanced - requires all 6 evidence pieces)
- **Rule 49:** ENTER WORKSHOP from cottage

### New Messages (14)
- Messages 23-36 cover the entire workshop puzzle sequence

### New Flags (8)
- **50:** carlyle_departed
- **51:** drawer_unlocked
- **52-54:** Evidence examined flags
- **55-57:** Puzzle clue discovery flags

## Installation Steps

### Step 1: Backup Current Game
1. Go to **Merge Data** panel
2. Click **"📋 Copy JSON"** to backup your current game
3. Save to a file just in case

### Step 2: Load Workshop Expansion
1. Open **WORKSHOP_EXPANSION.json** in a text editor
2. Copy ALL contents (Ctrl+A, Ctrl+C)
3. Go to **Merge Data** panel
4. Paste into the text area
5. Click **"Merge Data"**

### Step 3: Verify Installation
Check these panels to confirm:

**Rooms Panel:**
- Should now have **17 locations** (was 15)
- Location 15: "Mead's Workshop" ✓
- Location 16: "Telegram Office, Richmond" ✓

**Items Panel:**
- Should now have **21 objects** (was 11)
- Objects 11-20 visible ✓

**Vocabulary Panel:**
- Should now have **57 words** (was 36)
- Verbs include: feel, listen, smell, unlock ✓
- Nouns include: workbench, drawer, lock, letter ✓

**Responses Panel:**
- Should now have **50 rules** (was 40)
- Rules 40-49 present ✓

**Variables Panel:**
- Should now have **14 flags** (was 6)
- Flags 50-57 present ✓

## How to Play the Workshop Puzzle

### The Sequence:

1. **Drive to Hampton Court** (Mead's cottage)
```
> drive hampton
> out
```

2. **Enter Mead's Cottage**
```
> west
```

3. **Carlyle Gets Called Away** (automatic)
```
[Telegram arrives, Carlyle departs]
[You are now ALONE]
```

4. **Enter the Workshop**
```
> enter workshop
```

5. **Solve the Combination** (use all three clues)
```
> feel workbench
[Reveals: carved numbers 6-2-4]

> listen
[Reveals: 6 chisels, 2 hammers, 4 files]

> smell apron
[Reveals: 6 chemicals, 2 oils, 4 solvents]
```

6. **Unlock the Drawer**
```
> unlock drawer
[Lock opens with combination 6-2-4]
[Evidence appears in room]
```

7. **Collect Evidence**
```
> get letter
> read letter
[Blackmail evidence - flag 52 set]

> get receipts
> examine receipts
[Payment evidence - flag 53 set]

> get diagram
> examine diagram
[Technical plans - flag 54 set]
```

8. **Return and Confront Pendleton**
```
> east (leave workshop)
> in (enter motor car)
> drive city
> out
> north (Pendleton's office)
> accuse pendleton
[With all 6 pieces of evidence: VICTORY!]
```

## Victory Conditions

### Original Victory (3 evidence):
- Flag 38: Ruler examined ✓
- Flag 39: Glass examined ✓
- Flag 40: Certificate examined ✓

### Extended Victory (6 evidence):
- All original evidence PLUS:
- Flag 52: Blackmail letter read ✓
- Flag 53: Payment receipts examined ✓
- Flag 54: Technical diagram examined ✓

## Testing the Puzzle

Use the **Auto Walkthrough** feature, but note it needs updating to include the workshop puzzle. Here's the new sequence:

```
// ... existing commands ...
"drive hampton",
"out",
"west",
// Wait for Carlyle departure
"enter workshop",
"feel workbench",
"listen",
"smell apron",
"unlock drawer",
"get letter",
"read letter",
"get receipts",
"examine receipts",
"get diagram",
"examine diagram",
"east",
"in",
// ... continue to finale ...
```

## Troubleshooting

### Carlyle Doesn't Leave
- **Cause:** Flag 50 already set
- **Fix:** Reset game or set flag 50 to 0 in Variables panel

### Can't Unlock Drawer
- **Cause:** Command not recognized
- **Fix:** Ensure vocabulary "unlock" and "drawer" are present
- **Alternative:** Try "use lock" or "open drawer"

### Evidence Not Appearing
- **Cause:** Drawer not unlocked (flag 51 = 0)
- **Fix:** Successfully unlock drawer first
- **Check:** Objects 15-17 should be at location 15 after unlock

### Can't Find Workshop
- **Cause:** Location 15 not added or wrong exits
- **Fix:** Verify location 15 exists with exit east to location 8
- **Command:** From Mead's cottage (8), use "enter workshop" or "west"

## Enhanced Messages

The new messages emphasize Carrados's blindness as a **strength**:

- **Tactile clues** - carved numbers, paper texture
- **Audio clues** - counting by sound
- **Olfactory clues** - chemical detection
- **Triumph message** - "Your blindness was not a limitation - it was your greatest strength"

## Next Steps

After installing, consider:

1. **Update location descriptions** to be more tactile/audio-focused
2. **Add Carlyle return** scene after workshop (currently he stays at telegram office)
3. **Add Mrs. Mead interaction** rules
4. **Create alternative puzzle solutions** (different clue combinations)
5. **Add hint system** if player is stuck

## Credits

Based on "The Coin of Dionysius" by Ernest Bramah (1914)
Extended gameplay by Christopher Olewicz
Built with DAAD Builder UI

Enjoy the enhanced mystery experience!
