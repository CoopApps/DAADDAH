# Creating Messages

## What are Messages?

Messages are text strings displayed to the player. They're referenced by index (array position) in rules.

## Message Array Structure

```json
{
  "messages": [
    "You pick up the key.",
    "The door is locked.",
    "You unlock the door with a satisfying click.",
    "There's nothing under there.",
    "You can't do that."
  ]
}
```

Messages are accessed by their array index:
- Index 0: "You pick up the key."
- Index 1: "The door is locked."
- Index 2: "You unlock the door with a satisfying click."
- etc.

## Using Messages in Rules

Reference messages with the `MESSAGE` action:

```json
{
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 0 } }
  ]
}
```

## Message Categories

Organize messages by type for easier management:

### 1. Action Responses (0-49)
```json
[
  "You pick up the key.",
  "You drop the key on the floor.",
  "You unlock the door.",
  "You open the creaky door.",
  "You light the lantern."
]
```

### 2. Examination Results (50-99)
```json
[
  // index 50
  "A small brass key with an ornate handle. It might fit a lock nearby.",
  // index 51
  "An old oil lantern. The glass is cracked but it still works.",
  // index 52
  "A heavy wooden door reinforced with iron bands."
]
```

### 3. Error/Failure Messages (100-149)
```json
[
  // index 100
  "You can't do that.",
  // index 101
  "That doesn't work.",
  // index 102
  "You don't have that.",
  // index 103
  "The door is locked.",
  // index 104
  "It's too dark to see."
]
```

### 4. Story/Atmosphere (150-199)
```json
[
  // index 150
  "A cold wind blows through the corridor.",
  // index 151
  "You hear footsteps in the distance.",
  // index 152
  "Something moves in the shadows."
]
```

### 5. Victory/Defeat (200+)
```json
[
  // index 200
  "Congratulations! You've escaped the haunted mansion!",
  // index 201
  "The ghost catches you. Your adventure ends here."
]
```

## Example: Creating Messages for a Puzzle

Prompt to Claude:
```
Create messages for a key-and-lock puzzle:
- Finding the key under a rug
- Already searched the rug
- Door is locked
- Unlocking the door
- Door already unlocked
- No key to unlock with
- Examining the key
- Examining the door
```

Expected output:
```json
{
  "messages": [
    "You lift the corner of the rug and discover a small brass key hidden underneath!",
    "You've already searched under the rug. There's nothing else there.",
    "The heavy oak door is firmly locked. You'll need a key.",
    "You insert the key into the lock. It turns with a satisfying click. The door is now unlocked.",
    "The door is already unlocked. You can go through.",
    "You don't have anything that could unlock this door.",
    "A small brass key with an ornate design. It looks old but well-crafted.",
    "A solid oak door with iron bindings. It has a keyhole at waist height."
  ]
}
```

With corresponding rules:
```json
{
  "rules": [
    {
      "id": 0,
      "name": "SEARCH RUG - find key",
      "conditions": [{ "type": "ZERO", "params": { "flagno": 38 } }],
      "actions": [
        { "type": "MESSAGE", "params": { "mesno": 0 } },
        { "type": "DONE", "params": {} }
      ]
    }
  ]
}
```

## Writing Good Messages

### Do:
- Be concise (1-2 sentences)
- Use active voice
- Include sensory details
- Match the game's tone
- Provide useful feedback

### Don't:
- Write walls of text
- Be vague ("Something happens")
- Break immersion
- Repeat information
- Use modern slang in period games

### Examples:

```
# Good
"The rusty hinges creak as you push open the door."

# Bad - too long
"You reach out your hand and grasp the door handle. It feels cold to the touch. You push against the door. It resists at first, but then the hinges, which are very rusty and haven't been oiled in years, begin to creak loudly as the door slowly swings open."

# Bad - too vague
"The door opens."

# Bad - breaks immersion
"Door unlocked! +10 XP!"
```

## Message Length Limits

DAAD has platform-specific limits:
- Most platforms: ~255 characters per message
- Some 8-bit systems: Less

Keep messages under 200 characters to be safe.

## Placeholder Messages

When developing, use placeholder messages:

```json
{
  "messages": [
    "[TODO: Key found message]",
    "[TODO: Door locked message]",
    "[TODO: Win message]"
  ]
}
```

Then replace with final text later.

## Message Index Tracking

Keep a comment or separate document tracking message indices:

```
# Message Index Reference

## Action Messages (0-49)
0 - Find key under rug
1 - Already searched rug
2 - Door locked (can't pass)
3 - Door unlocked successfully
4 - Door already unlocked
5 - No key for door

## Examine Messages (50-99)
50 - Examine brass key
51 - Examine oak door
52 - Examine rug

## Error Messages (100+)
100 - Generic "can't do that"
101 - "It's too dark"
```

## Multi-Part Messages

For longer text, use multiple messages and actions:

```json
{
  "actions": [
    { "type": "MESSAGE", "params": { "mesno": 10 } },
    { "type": "MESSAGE", "params": { "mesno": 11 } },
    { "type": "MESSAGE", "params": { "mesno": 12 } },
    { "type": "DONE", "params": {} }
  ]
}
```

Messages:
```json
[
  // 10
  "You carefully examine the ancient scroll.",
  // 11
  "The text is faded but readable: 'To enter the chamber, speak the word of fire.'",
  // 12
  "The scroll crumbles to dust in your hands."
]
```

## Checklist

Before finalizing messages:
- [ ] All MESSAGE actions reference valid indices
- [ ] Messages are under 200 characters
- [ ] No placeholder text remaining
- [ ] Tone is consistent throughout
- [ ] Error messages are helpful
- [ ] Success messages are satisfying
- [ ] Indices are organized logically

## Next Steps

After creating messages:
1. Update rules to reference correct message indices
2. Test all messages appear correctly
3. Proofread for typos and consistency
