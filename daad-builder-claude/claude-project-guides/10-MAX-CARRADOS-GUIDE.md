# The Eyes of Max Carrados - Game Design Guide

## Overview

"The Eyes of Max Carrados" is a mystery adventure game based on Ernest Bramah's detective stories. The player takes the role of Max Carrados, a **blind detective** who solves crimes using his extraordinarily heightened senses of touch, smell, and hearing.

This game demonstrates advanced DAAD techniques including:
- Blind protagonist mechanics
- Motor car travel system
- Evidence collection and accusation
- Hidden puzzle with combination lock
- NPC characters (PSI objects)

## The Story

### Historical Context
London, 1914. A railway accident at Knight's Cross has killed 27 people. Engine-driver Hutchins swears the signal showed green (clear), but 27 people are dead. He's about to be blamed for the disaster.

### The Crime
Harold Pendleton, a desperate stockbroker, sabotaged the signal lamp. He:
1. Calculated that breaking the lamp glass to exactly 4-7/8 inches would show a false "clear" signal through a red lamp
2. Blackmailed railway guard Mead into performing the sabotage
3. Bought railway stocks before the crash, then sold when they recovered
4. Profited from 27 deaths

### The Investigation
Carrados must:
1. Interview witnesses (Hutchins, Mead, Pendleton)
2. Examine evidence at the signal box (ruler, broken glass)
3. Discover financial motive (stock certificate)
4. Find the hidden blackmail evidence in Mead's workshop
5. Accuse Pendleton with sufficient proof

## Blind Protagonist Mechanics

### The Core Concept
Max Carrados cannot see. This fundamentally affects gameplay:

- **LOOK command** shows limited sensory information when alone
- **ASK CARLYLE** provides visual descriptions when Carlyle is present
- **All descriptions** emphasize touch, smell, and hearing over sight
- **The workshop puzzle** is solved entirely through non-visual senses

### Implementation

**Location descriptions** avoid visual language:
```
# Wrong (visual)
"You see a dusty library with books on shelves."

# Correct (blind-appropriate)
"The smell of old books and dust fills the air. Your feet feel thick carpet.
Carlyle's breathing tells you he sits across from you."
```

**Object descriptions** emphasize tactile details:
```
"Your fingertips trace the smooth wood, finding carved grooves at regular
intervals. The mark at 4-7/8 inches feels slightly deeper, as if measured
repeatedly."
```

### The Carlyle System

Louis Carlyle serves as Carrados's "eyes":

**Rule 38: ASK CARLYLE**
```json
{
  "conditions": [
    { "type": "PRESENT", "params": { "objno": 5 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 24 } },
    { "type": "DESC", "params": {} },
    { "type": "DONE", "params": {} }
  ]
}
```

**Rule 39: LOOK without Carlyle (PRO1)**
```json
{
  "conditions": [
    { "type": "ABSENT", "params": { "objno": 5 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 25 } },
    { "type": "DONE", "params": {} }
  ]
}
```

This creates meaningful gameplay where Carlyle's presence matters.

## Motor Car Travel System

### How It Works

The game has 5 destination areas, each with:
- A street/platform location
- A motor car location (for travelling)

From any motor car, players can DRIVE to destinations:
- `DRIVE HOLLOWAY` - Hutchins's home
- `DRIVE HAMPTON` - Mead's cottage
- `DRIVE WOUNDY` - Signal box
- `DRIVE CITY` - Pendleton's office
- `DRIVE RICHMOND` - Return home

### Implementation

Each destination requires rules from every motor car location:

```json
{
  "id": 8,
  "name": "DRIVE HOLLOWAY",
  "process": "PRO0",
  "enabled": true,
  "conditions": [
    { "type": "AT", "params": { "locno": 2 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 8 } },
    { "type": "GOTO", "params": { "locno": 4 } },
    { "type": "DONE", "params": {} }
  ]
}
```

This requires 20 rules (5 destinations × 4 origin motor cars, plus 4 return to Richmond).

## Evidence System

### Three Key Evidence Items

| Object | Location | Flag Set | Evidence Type |
|--------|----------|----------|---------------|
| Ruler | Signal Box | 38 | Method (measuring) |
| Glass | Signal Box | 39 | Physical evidence |
| Certificate | Pendleton's Office | 40 | Financial motive |

### Win Condition

All three flags must be set before ACCUSE PENDLETON succeeds:

```json
{
  "id": 36,
  "name": "ACCUSE PENDLETON - full evidence",
  "conditions": [
    { "type": "AT", "params": { "locno": 14 } },
    { "type": "NOTZERO", "params": { "flagno": 38 } },
    { "type": "NOTZERO", "params": { "flagno": 39 } },
    { "type": "NOTZERO", "params": { "flagno": 40 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 21 } },
    { "type": "MESSAGE", "params": { "mesno": 22 } },
    { "type": "END", "params": {} }
  ]
}
```

**Important:** The insufficient evidence rule (37) must come AFTER the success rule (36) so the more specific condition is checked first.

## The Workshop Puzzle

### Concept

In Mead's workshop, the player is alone (Carlyle not present). They must solve a combination lock puzzle using only touch, hearing, and smell - proving Carrados's abilities.

### The Clues

Three sensory clues all point to the combination **6-2-4**:

1. **FEEL WORKBENCH** (Touch)
   - "Three deliberate grooves carved into the front edge: 6, 2, 4"

2. **LISTEN** (Hearing)
   - "Six chisels, two hammers, four files"

3. **SMELL APRON** (Olfactory)
   - "Six chemical compounds, two types of oil, four solvents"

### Implementation

```json
{
  "id": 28,
  "name": "FEEL WORKBENCH - clue",
  "conditions": [
    { "type": "AT", "params": { "locno": 15 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 13 } },
    { "type": "SET", "params": { "flagno": 41 } },
    { "type": "DONE", "params": {} }
  ]
}
```

### Unlocking the Drawer

The UNLOCK DRAWER command reveals the blackmail evidence:

```json
{
  "id": 31,
  "name": "UNLOCK DRAWER - correct code",
  "conditions": [
    { "type": "AT", "params": { "locno": 15 } },
    { "type": "ZERO", "params": { "flagno": 44 } }
  ],
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 16 } },
    { "type": "SET", "params": { "flagno": 44 } },
    { "type": "CREATE", "params": { "objno": 14 } },
    { "type": "CREATE", "params": { "objno": 15 } },
    { "type": "CREATE", "params": { "objno": 16 } },
    { "type": "DONE", "params": {} }
  ]
}
```

This reveals:
- Blackmail letter (obj 14)
- Payment receipts (obj 15)
- Technical diagram (obj 16)

## Characters (PSI Objects)

| ID | Name | Location | Role |
|----|------|----------|------|
| 5 | Carlyle | Study | Companion, provides visual info |
| 6 | Hutchins | Kitchen | Accused signalman (innocent) |
| 7 | Mead | Cottage | Blackmailed accomplice |
| 8 | Pendleton | Office | The villain |
| 9 | Parkinson | Motor Car | Driver |

Characters are `isPSI: true` and `isTakeable: false`.

## Walkthrough

1. **Start in Study** - Read telegram
2. **GO SOUTH** to Richmond Terrace
3. **IN** to motor car
4. **DRIVE WOUNDY** - Go to signal box
5. **OUT, EAST** - Enter signal box
6. **EXAMINE RULER, EXAMINE GLASS** - Collect evidence
7. **TAKE RULER, TAKE GLASS**
8. **WEST, IN** - Back to motor car
9. **DRIVE HAMPTON** - Go to Mead's cottage
10. **OUT, EAST** - Enter cottage
11. **INTERVIEW MEAD** - He's evasive
12. **EAST** - Go to workshop
13. **FEEL WORKBENCH** - Find clue (6)
14. **LISTEN** - Count tools (6-2-4)
15. **SMELL APRON** - Confirm (6-2-4)
16. **UNLOCK DRAWER** - Reveal blackmail evidence
17. **EXAMINE LETTER, EXAMINE RECEIPTS, EXAMINE DIAGRAM**
18. **WEST, WEST, IN** - Back to motor car
19. **DRIVE CITY** - Go to Pendleton's office
20. **OUT, EAST** - Enter office
21. **EXAMINE CERTIFICATE** - Find stock manipulation
22. **ACCUSE PENDLETON** - Victory!

## Flags Reference

| Flag | Name | Purpose |
|------|------|---------|
| 38 | ruler_examined | Examined ruler evidence |
| 39 | glass_examined | Examined broken glass |
| 40 | certificate_examined | Examined stocks |
| 41 | workbench_clue | Found 6-2-4 carved |
| 42 | tools_clue | Counted tools |
| 43 | apron_clue | Smelled chemicals |
| 44 | drawer_unlocked | Workshop drawer opened |
| 45 | letter_examined | Read blackmail letter |
| 46 | receipts_examined | Examined payments |
| 47 | diagram_examined | Examined technical drawing |

## Extending the Game

### Ideas for Expansion

1. **Multiple Endings**
   - Accuse with full evidence (best ending)
   - Accuse with partial evidence (Pendleton escapes)
   - Accuse wrong person (failure)

2. **Time Pressure**
   - Countdown until Pendleton flees
   - Must gather evidence before deadline

3. **More Sensory Puzzles**
   - Identify poison by smell
   - Detect forged signatures by touch
   - Recognize voice patterns

4. **Carlyle Separation**
   - More areas where Carlyle must wait
   - Shows Carrados's independence

### Adding New Evidence

To add new evidence items:
1. Create object with tactile description
2. Add vocabulary for noun
3. Create EXAMINE rule that sets a flag
4. Update ACCUSE condition to require new flag

## Writing for a Blind Protagonist

### Do:
- "Your fingers trace..."
- "The scent of..."
- "You hear..."
- "The temperature suggests..."
- "His breathing quickens..."

### Don't:
- "You see..."
- "It looks like..."
- "The color is..."
- "In the distance..."
- "The view shows..."

### Character Perception:
- Nervousness: rapid breathing, fear-sweat smell
- Honesty: steady voice, calm heartbeat
- Guilt: shifting weight, trembling voice
- Status: quality of fabric, cologne vs. cheap soap

## Technical Notes

- Game uses 16 locations, 17 objects, 40 rules
- Motor car system requires many rules but provides realistic travel
- PRO1 process intercepts LOOK when Carlyle absent
- Evidence flags must all be set for victory
- Hidden objects use CREATE action when discovered

This game demonstrates that DAAD can create sophisticated, literary adventures with unique mechanics that serve the story.
