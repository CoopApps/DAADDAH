# Carlyle as Carrados's Eyes - Design Document

## Core Concept
When Carlyle is PRESENT, visual details are added to descriptions.
When Carlyle is ABSENT, only non-visual senses are available.

## Implementation Strategy

### 1. Carlyle as PSI Object
```json
{
  "id": 6,
  "noun": "carlyle",
  "adjective": "louis",
  "description": "Louis Carlyle, your trusted friend...",
  "isPSI": true,
  "location": {"type": "at", "locationId": 0}
}
```

### 2. Dual Description System

#### LOOK Command Behavior:

**Without Carlyle (PRO1 intercept):**
```
> look
Your heightened senses map the space around you. The echo of your breathing
tells you the room's dimensions. Air currents reveal furniture placement.
But visual details—colors, distant objects, written signs—remain beyond
your reach. You sense Carlyle's absence keenly.
```

**With Carlyle Present (normal DESC):**
```
> look
[Standard location description]

Carlyle quietly adds: "The walls are papered in a faded floral pattern, Max.
There's a portrait of Queen Victoria above the mantel, slightly crooked.
The carpet shows worn patches near the doorway."
```

#### EXAMINE Object Behavior:

**Example: EXAMINE NEWSPAPER**

**Without Carlyle:**
```
> examine newspaper
Your fingers trace the embossed pins your secretary left. You can feel
the texture of fresh ink, but the actual text remains inaccessible
without someone to read it aloud.
```

**With Carlyle:**
```
> examine newspaper
Your fingers trace the embossed pins marking key articles.

Carlyle reads aloud: "DISASTER AT KNIGHT'S CROSS - Twenty-seven dead
in railway collision. Engine-driver Hutchins claims signal showed
clear. Investigation continues."
```

### 3. Rules Architecture

#### Rule Priority Order:
1. **PRO1** - Intercept LOOK without Carlyle
2. **PRO0** - Handle specific EXAMINE commands
3. **Standard system** - Normal descriptions

#### Key Rules Needed:

**Rule 49: LOOK without Carlyle**
```json
{
  "id": 49,
  "name": "LOOK without Carlyle - Limited perception",
  "process": "PRO1",
  "conditions": [
    {"type": "AT", "params": {"verb": 14, "noun": 255}},
    {"type": "ABSENT", "params": {"objno": 6}}
  ],
  "actions": [
    {"type": "MESSAGE", "params": {"mesno": 35}},
    {"type": "DONE"}
  ]
}
```

**Rule 50: ASK CARLYLE (for visual details)**
```json
{
  "id": 50,
  "name": "ASK CARLYLE - Get visual description",
  "process": "PRO0",
  "conditions": [
    {"type": "AT", "params": {"verb": 6, "noun": 15}},
    {"type": "PRESENT", "params": {"objno": 6}}
  ],
  "actions": [
    {"type": "MESSAGE", "params": {"mesno": 36}},
    {"type": "DESC"},
    {"type": "DONE"}
  ]
}
```

**Rules 51-60: EXAMINE key objects WITH Carlyle**
- EXAMINE NEWSPAPER + Carlyle → Full text reading
- EXAMINE GLASS + Carlyle → Visual color/appearance details
- EXAMINE CERTIFICATE + Carlyle → Read all printed text
- EXAMINE HUTCHINS + Carlyle → Physical appearance description
- EXAMINE MEAD + Carlyle → Facial expressions, body language
- EXAMINE PENDLETON + Carlyle → Visual nervous tells

**Rules 61-70: EXAMINE same objects WITHOUT Carlyle**
- EXAMINE NEWSPAPER - Carlyle → Touch only, can't read
- EXAMINE GLASS - Carlyle → Touch/weight only
- EXAMINE CERTIFICATE - Carlyle → Embossed seals only
- etc.

### 4. Carlyle Movement System

Carlyle should follow Carrados automatically (except in workshop).

**PRO2 Rules for auto-following:**
```json
{
  "id": 71,
  "name": "Carlyle follows to Motor Car",
  "process": "PRO2",
  "conditions": [
    {"type": "AT", "params": {"locno": 2}}
  ],
  "actions": [
    {"type": "PLACE", "params": {"objno": 6, "locno": 2}},
    {"type": "DONE"}
  ]
}
```

Repeat for all major locations EXCEPT location 15 (workshop).

### 5. New Vocabulary Needed

**Verbs:**
- `ask` (already exists: id 6)

**Nouns:**
- `carlyle` (id: 15)

**Adjectives:**
- `louis` (id: 7)

### 6. New Messages Needed

**Message 35: LOOK without Carlyle**
```
Your heightened senses map the space. Echo patterns reveal dimensions.
Air currents deflect around furniture. Temperature gradients suggest
windows, fireplaces. But colors, distant details, written words—these
remain beyond your reach. You miss Carlyle's observant eyes.
```

**Message 36: ASK CARLYLE intro**
```
"Carlyle," you say, "tell me what you see."

Carlyle clears his throat and begins his methodical description:
```

**Messages 37-46: Carlyle's visual descriptions of objects**
- 37: Newspaper full text
- 38: Glass color/appearance
- 39: Certificate full printed text
- 40: Hutchins physical appearance
- 41: Mead body language
- 42: Pendleton nervous tells
- 43: Study visual details
- 44: Signal box visual state
- 45: Pendleton's office disorder
- 46: Workshop (when Carlyle eventually joins)

**Messages 47-56: Carrados alone descriptions**
- 47: Newspaper - can't read
- 48: Glass - touch only
- 49: Certificate - embossed seals only
- 50: Hutchins - voice/presence only
- 51: Mead - nervous breathing only
- 52: Pendleton - smell of fear only
- etc.

### 7. Workshop Puzzle Enhancement

The workshop puzzle becomes MORE meaningful:

**When Carlyle is absent:**
- FEEL, LISTEN, SMELL work perfectly
- EXAMINE objects gives tactile descriptions
- Carrados proves he doesn't need eyes

**Dramatic moment when returning:**
```
> east (leave workshop)
> (Carlyle is in cottage, interviewing Mrs. Mead)

Carlyle looks up as you enter. "Find anything, Max?"

You hand him the documents. "Read these to me, would you?"

[Carlyle reads the blackmail letter, receipts, diagrams aloud]
[Player gets full visual details through Carlyle]
```

### 8. Gameplay Implications

**Strategic Depth:**
- Some puzzles REQUIRE Carlyle (reading documents)
- Some puzzles work BETTER without him (workshop sensory puzzle)
- Player must choose when to work alone vs together

**Character Development:**
- Shows their partnership is genuine collaboration
- Carrados isn't "handicapped"—he has different strengths
- Carlyle provides eyes, Carrados provides insight

**Immersion:**
- Player genuinely feels the difference between sighted/blind investigation
- Reinforces Bramah's philosophy: "No blundering eyes to be hoodwinked"

## Testing Scenarios

### Test 1: Examine Newspaper
**With Carlyle:**
```
> examine newspaper
[Tactile description]

Carlyle reads: "DISASTER AT KNIGHT'S CROSS..." [full text]
```

**Without Carlyle (in workshop):**
```
> examine newspaper
Your fingers trace the embossed pins. Fresh ink smell. But you
cannot read the printed text without assistance.
```

### Test 2: Look Around
**With Carlyle:**
```
> look
[Location description with Carlyle's additions about colors,
visual details, distant objects]
```

**Without Carlyle:**
```
> look
[Limited sensory description, message about missing visual details]
```

### Test 3: Interview NPCs
**With Carlyle:**
```
> examine hutchins
[Carlyle describes: "A man of about forty, Max. Honest face,
tired eyes. His hands are calloused from years of engine work.
He keeps glancing at the door nervously."]
```

**Without Carlyle:**
```
> examine hutchins
Hutchins's breathing is rapid, nervous. He radiates anxiety.
His voice trembles when he speaks. The smell of coal smoke
clings to his clothes—years of engine work.
```

## Complete Rule List (49-80)

49. LOOK without Carlyle
50. ASK CARLYLE
51. EXAMINE NEWSPAPER + Carlyle
52. EXAMINE NEWSPAPER - Carlyle
53. EXAMINE GLASS + Carlyle
54. EXAMINE GLASS - Carlyle
55. EXAMINE CERTIFICATE + Carlyle
56. EXAMINE CERTIFICATE - Carlyle
57. EXAMINE HUTCHINS + Carlyle
58. EXAMINE HUTCHINS - Carlyle
59. EXAMINE MEAD + Carlyle
60. EXAMINE MEAD - Carlyle
61. EXAMINE PENDLETON + Carlyle
62. EXAMINE PENDLETON - Carlyle
63. EXAMINE RULER + Carlyle
64. EXAMINE RULER - Carlyle
65-70: Carlyle auto-follow rules (PRO2)
71-75: Workshop object examinations without Carlyle
76-80: Reserved for expansion

## Flag Management

**Flag 58: carlyle_explained_system**
- Set after first ASK CARLYLE
- Used to skip tutorial message on subsequent asks

This system creates a genuine partnership mechanic while staying true to the character!
