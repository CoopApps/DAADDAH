# The Eyes of Max Carrados - Extended Plot Design

## Original Story Summary
A railway accident at Knight's Cross kills 27 people. Engine-driver Hutchins claims he saw green (clear), but signalman Mead swears it showed red (danger). Carrados discovers Harold Pendleton sabotaged the signal lamp glass to manipulate railway stocks for financial gain.

## Extended Plot - New Act Structure

### ACT 1: The Investigation Begins (Original)
**Locations:** Study → Richmond Terrace → Motor Car → Various locations
**Key Events:**
- Carlyle brings the case to Carrados
- Interview Hutchins (nervous but honest)
- Interview Mead (evasive, hiding something)
- Collect evidence at Signal Box (ruler, glass)
- Interview Pendleton (financially desperate)
- Discover stock certificate showing motive

### ACT 2: The Blackmail Discovery (NEW - Extended Plot)
**New Location:** Mead's Secret Workshop (behind cottage)
**Key Events:**
1. After initial interviews, Carlyle receives urgent telegram
2. Carlyle must leave to handle legal emergency in chambers
3. **SOLO PUZZLE SCENE:** Carrados alone at Mead's cottage
4. Discovers hidden workshop where Mead manufactured the sabotage tools
5. Must solve tactile/audio puzzle to find evidence WITHOUT Carlyle

**The Solo Puzzle - "The Locked Workshop":**

**Setup:**
- Mead's wife mentions her husband's workshop in the back garden
- She reluctantly lets Carrados investigate while Mead is out
- Carlyle has been called away (urgent legal matter)
- Carrados is ALONE - LOOK command doesn't work properly
- Must rely entirely on touch, sound, and smell

**The Puzzle:**
```
Location: Mead's Workshop (new location 15)

Objects in room:
- Workbench (heavy, bolted down)
- Tool rack (hanging tools make distinctive sounds)
- Locked drawer (requires combination)
- Oil lamp (still warm, recently extinguished)
- Metal filings on floor (tactile clue)
- Glass cutting tools (distinctive smell of cutting oil)
- Leather apron (smell of lamp oil + something else)

The Combination Lock Puzzle:
- Three-digit combination lock on drawer
- Clues scattered around room, must be found by NON-VISUAL means

Clue 1 (TOUCH): Workbench has three deep scratches forming numbers
> FEEL WORKBENCH
"Your fingertips detect three deep gouges in the wood. The first curves like a '6', the second feels like a '2', the third has the angular shape of a '4'."

Clue 2 (SOUND): Tools on rack correspond to numbers
> LISTEN
"As air currents shift, the hanging tools clink softly against each other. You count them by their sounds - six chisels, two hammers, four files."

Clue 3 (SMELL): Chemical residue reveals numbers
> SMELL APRON
"Lamp oil, certainly, but beneath it... the acrid tang of metal-working compounds. Your acute sense detects six different chemical scents, two types of oil, four distinct solvents."

All three clues point to: 6-2-4

> USE COMBINATION 624
"Your sensitive fingers rotate the dial with precision. First to 6... the faint click. Then 2... another click. Finally 4... the lock releases with a satisfying snap."

Inside drawer:
- Blackmail letter from Pendleton to Mead
- Payment receipts showing Pendleton paid Mead £500
- Technical diagram of signal lamp modification (in Pendleton's handwriting)
- Reveals: Mead was BLACKMAILED/BRIBED, not the mastermind
```

**Why This Scene Works:**
1. **Showcases Carrados's abilities** - He's MORE capable alone, not less
2. **Genuine puzzle** - Player must use non-visual commands
3. **Plot revelation** - Mead is victim/accomplice, not villain
4. **Tension** - Time pressure (Mead could return)
5. **Character development** - Carrados proves his independence

### ACT 3: The Confrontation (Enhanced Original + New)
**New Twist:** Armed with blackmail evidence, Carrados must:
1. Confront Mead (who breaks down, admits Pendleton threatened his family)
2. Confront Pendleton with BOTH the original evidence AND blackmail proof
3. Pendleton attempts to flee, but Carrados has anticipated this
4. Final scene where Carrados explains the entire scheme to Inspector Beedel

## New Locations Needed

### Location 15: Mead's Secret Workshop
```json
{
  "id": 15,
  "name": "Mead's Workshop",
  "description": "A cramped workshop behind the cottage. The air is heavy with the smell of oil and metal. You sense a workbench ahead, tools hanging from a rack, and something... deliberate about this space. This is where secrets are made.",
  "isDark": false,
  "exits": {"west": 6}
}
```

### Location 16: Telegram Office
```json
{
  "id": 16,
  "name": "Telegram Office",
  "description": "A small public telegram office. The clerk's rapid typing creates a rhythmic backdrop. The sharp smell of ink and paper fills the air. Carlyle receives urgent messages here.",
  "exits": {"out": 1}
}
```

## New Objects Needed

### Workshop Objects
1. **Workbench** (id: 11) - Has tactile number clues (6-2-4 carved)
2. **Tool Rack** (id: 12) - Audio clues from hanging tools
3. **Leather Apron** (id: 13) - Olfactory clues (oils and chemicals)
4. **Locked Drawer** (id: 14) - Contains blackmail evidence
5. **Blackmail Letter** (id: 15) - Key evidence inside drawer
6. **Payment Receipts** (id: 16) - Shows £500 from Pendleton to Mead
7. **Technical Diagram** (id: 17) - Pendleton's handwriting, signal modification plans

### New Items
8. **Telegram** (id: 18) - Carlyle receives urgent summons
9. **Combination Lock** (id: 19) - Three-digit lock (part of drawer)

## New Characters/NPCs

### Mrs. Mead (id: 20)
- Worried wife who knows something is wrong
- Reluctantly allows Carrados to investigate workshop
- Provides context about Mead's recent behavior changes

### Inspector Beedel (id: 21)
- Scotland Yard detective handling the railway disaster
- Initially skeptical of blind detective
- Becomes ally after Carrados solves the case

## New Vocabulary Needed

**Verbs:**
- `feel` (id: 16) - Tactile examination
- `listen` (id: 17) - Audio investigation
- `smell` (id: 18) - Olfactory detection
- `combine` (id: 19) - Enter combination
- `unlock` (id: 20) - Open locked objects

**Nouns:**
- `workbench` (id: 17)
- `drawer` (id: 18)
- `tools` (id: 19)
- `apron` (id: 20)
- `combination` (id: 21)
- `letter` (id: 22)
- `receipts` (id: 23)
- `diagram` (id: 24)
- `beedel` (id: 25)

**Adjectives:**
- `locked` (id: 9)
- `blackmail` (id: 10)
- `technical` (id: 11)

## Key New Rules

### Rule 40: Carlyle Leaves (Triggers Solo Puzzle)
```
Conditions: AT location 8 (Mead's cottage) + flag 50 = 0 (first visit)
Actions:
  - MESSAGE "Carlyle receives urgent telegram..."
  - PLACE Carlyle at Telegram Office (location 16)
  - SET flag 50 (Carlyle departed)
  - MESSAGE "You are now alone..."
```

### Rule 41-43: Workshop Puzzle Clues
```
FEEL WORKBENCH → Reveals 6-2-4 carved pattern
LISTEN (in workshop) → Counts tools: 6-2-4
SMELL APRON → Detects chemicals: 6-2-4
```

### Rule 44: Combination Lock
```
Conditions: USE COMBINATION 624 + AT workshop + flag 51 = 0
Actions:
  - MESSAGE "The lock clicks open..."
  - SET flag 51 (drawer unlocked)
  - MESSAGE "Inside you find documents..."
```

### Rule 45: Discover Blackmail Letter
```
Conditions: EXAMINE LETTER + flag 51 = 1
Actions:
  - MESSAGE "Your fingers trace the embossed letterhead..."
  - MESSAGE "It's from Pendleton, threatening Mead's family..."
  - SET flag 52 (blackmail discovered)
```

## Timeline of Events

1. **Original Investigation** - Collect ruler, glass, certificate
2. **First Mead Interview** - He's evasive, hiding fear
3. **Carlyle Called Away** - Legal emergency, leaves Carrados alone
4. **Solo Workshop Puzzle** - Carrados solves combination lock alone
5. **Blackmail Discovery** - Find Pendleton's threatening letters
6. **Carlyle Returns** - Brings legal documents (coincidentally) about Pendleton
7. **Second Mead Confrontation** - Mead breaks down, confesses blackmail
8. **Final Pendleton Confrontation** - Complete evidence: motive + blackmail + method
9. **Resolution** - Inspector Beedel arrests Pendleton, clears Hutchins

## Thematic Elements

### Blindness as Strength
- Solo puzzle demonstrates Carrados is MORE effective using non-visual senses
- Heightened touch/smell/hearing solve what sighted person might miss
- Combination lock puzzle REQUIRES blind-appropriate investigation

### Moral Complexity
- Mead isn't evil - he's a victim too
- Pendleton threatened Mead's family
- Adds layers: is Mead guilty? What about his cooperation under duress?

### Mystery Structure
- Red Herring: Initially seems Hutchins OR Mead are at fault
- First Twist: Evidence points to Pendleton (stocks/money)
- Second Twist: Mead was blackmailed, not willing participant
- Final Resolution: Pendleton guilty of both sabotage AND blackmail

## Victory Conditions

**Original Victory:** Accuse Pendleton with 3 pieces of evidence (ruler, glass, certificate)

**Extended Victory:** Accuse Pendleton with ALL evidence:
- Ruler (method - measured glass)
- Glass (physical evidence)
- Certificate (financial motive)
- Blackmail Letter (proves coercion of Mead)
- Payment Receipts (proves conspiracy)
- Technical Diagram (proves premeditation)

**Flag Requirements:**
- Flag 38: Ruler examined ✓
- Flag 39: Glass examined ✓
- Flag 40: Certificate examined ✓
- Flag 52: Blackmail letter discovered (NEW)
- Flag 53: Payment receipts found (NEW)
- Flag 54: Technical diagram examined (NEW)

## Gameplay Flow for Solo Puzzle

```
1. Arrive at Mead's cottage with Carlyle
2. Interview Mead (evasive)
3. Mrs. Mead mentions workshop
4. Telegram arrives for Carlyle
5. Carlyle must leave (legal emergency)
6. Carrados alone - LOOK doesn't work properly
7. Go to workshop
8. FEEL, LISTEN, SMELL to find clues
9. Solve 6-2-4 combination
10. Discover blackmail evidence
11. Carlyle returns
12. Final confrontation with new evidence
```

## Writing Style Notes

**Solo Puzzle Dialogue:**
- No visual descriptions
- Emphasize isolation: "The silence is complete, save for..."
- Internal monologue: "Your fingers tell you..."
- Heightened awareness: "A draft from the left, a creak from above..."
- Confidence despite blindness: "You don't need eyes for this."

**Tension Building:**
- Time pressure: "Mead could return any moment..."
- Physical vulnerability: "You're alone, in an unfamiliar space..."
- Determination: "But your other senses have never failed you..."

This expansion maintains the original story while adding depth, character development, and a showcase for Carrados's unique abilities!
