# Max Carrados Blindness Mechanics - Implementation Guide

## Overview
Max Carrados is blind, which fundamentally affects gameplay. His other senses are heightened, but he relies on companions (particularly Louis Carlyle) for visual descriptions.

## Key Gameplay Mechanics

### 1. Carlyle as Essential Companion
- **Carlyle (object 6)** is a PSI character who travels with Carrados
- Without Carlyle present, visual LOOK commands are limited
- Players must use "ASK CARLYLE" to get detailed visual descriptions

### 2. Character Objects (PSI)
All major characters are now proper game objects with `isPSI: true`:

- **Carlyle** (id: 6) - Starts at Study, can travel with player
- **Hutchins** (id: 7) - At Hutchins's Kitchen (location 5)
- **Mead** (id: 8) - At Mead's Cottage (location 8)
- **Pendleton** (id: 9) - At Pendleton's Office (location 14)
- **Parkinson** (id: 10) - In Motor Car (location 2)

### 3. Blindness Rules

#### Rule 39: LOOK without Carlyle (PRO1 process)
```
Conditions: LOOK command + Carlyle ABSENT
Actions: Show blindness message
```
This intercepts LOOK when Carlyle isn't present, showing:
*"Your fingers trace familiar textures and your heightened hearing maps the space, but visual details elude you. 'Carlyle,' you say quietly, 'what do you see?'"*

#### Rule 38: ASK CARLYLE
```
Conditions: ASK + CARLYLE + Carlyle PRESENT
Actions: Show message + DESC (describe location)
```
This allows players to request visual descriptions from Carlyle.

### 4. Enhanced Object Descriptions
Each character now has detailed examination text that reflects Carrados's non-visual perception:
- **Touch** - physical features, clothing texture
- **Voice** - tone, nervousness, accent
- **Smell** - cologne, sweat, tobacco
- **Presence** - how they move, breathing patterns

## Implementation Steps

### Step 1: Merge Characters
1. Go to Merge Data panel
2. Load `CARRADOS_ENHANCED.json`
3. This adds 5 PSI objects (Carlyle, Hutchins, Mead, Pendleton, Parkinson)

### Step 2: Update Location Descriptions
Edit location descriptions to reflect blindness:

**Before:**
"You sit in your comfortable study... Books line the walls..."

**After:**
"You sit in your comfortable study, feeling the rich leather of your armchair. The scent of old books fills the air. Carlyle's breathing tells you he sits across from you, papers rustling in his hands."

### Step 3: Add Carlyle Movement Rules
Create rules to move Carlyle with the player:

```json
{
  "id": 40,
  "name": "Carlyle follows to Richmond Terrace",
  "process": "PRO2",
  "enabled": true,
  "conditions": [
    {"type": "AT", "params": {"locno": 1}}
  ],
  "actions": [
    {"type": "PLACE", "params": {"objno": 6, "locno": 1}},
    {"type": "DONE", "params": {}}
  ]
}
```

### Step 4: Enhanced Examine Commands
Update examination descriptions to emphasize non-visual senses:

**Visual description (wrong for Carrados):**
"A wooden ruler marked with measurements."

**Blind-appropriate description (correct):**
"Your fingertips trace the smooth wood, finding carved grooves at regular intervals. The mark at 4-7/8 inches feels slightly deeper, as if measured repeatedly."

## Vocabulary Additions Needed

Add to vocabulary:
- `carlyle` (noun, id: 15)
- `parkinson` (noun, id: 16)
- `louis` (adjective, id: 7)
- `harold` (adjective, id: 8)

## Message Indices

The enhanced messages are:
- Message 16: Carlyle description
- Message 17: Hutchins description
- Message 18: Mead description
- Message 19: Pendleton description
- Message 20: Parkinson description
- Message 21: "Carlyle describes..." (for ASK CARLYLE)
- Message 22: Blindness LOOK message

## Testing the Mechanics

### Test Scenario 1: Blindness
```
> south (go to Richmond Terrace)
> look
> (Should show limited description or ask for Carlyle)
> ask carlyle
> (Carlyle describes the scene in detail)
```

### Test Scenario 2: Character Interaction
```
> examine carlyle
> (Shows Carlyle's description)
> drive holloway
> out
> east
> examine hutchins
> (Shows Hutchins description with non-visual details)
```

## Future Enhancements

### 1. Sound-Based Clues
Add rules that trigger on sounds only Carrados can hear:
- Footsteps revealing someone's gait
- Breathing patterns showing nervousness
- Paper rustling indicating forged documents

### 2. Touch-Based Investigation
Special FEEL command for detailed tactile examination:
```
> feel ruler
> "Your sensitive fingertips detect minute scratches near the 4-7/8 mark..."
```

### 3. Companion Separation
Add gameplay where Carlyle must leave temporarily:
```
Rule: Carlyle goes to fetch information
Player must navigate alone using heightened senses
Creates tension and showcases Carrados's abilities
```

### 4. Olfactory Clues
Smell-based detection:
```
> smell air
> "A faint trace of lamp oil mixed with something else... gunpowder?"
```

## Process Table Strategy

- **PRO0** - Main command processing
- **PRO1** - Intercept commands (like LOOK without Carlyle)
- **PRO2** - After description (move Carlyle to follow player)
- **PRO3** - Special blind-specific responses

## Notes for Writers

When writing content for blind protagonist:
1. ❌ "You see..."
2. ✅ "You sense..."
3. ❌ Visual colors/appearance
4. ✅ Texture, temperature, sound, smell
5. ❌ "The room looks..."
6. ✅ "The room feels/sounds..."

Remember: Carrados's blindness is his defining characteristic but also his strength. His other senses are extraordinarily acute.
