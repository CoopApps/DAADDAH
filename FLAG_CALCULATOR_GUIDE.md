# 🧮 Flag Calculator - Complete Beginner's Guide

## What is the Flag Calculator?

The Flag Calculator is a **no-code, visual tool** that helps you change numbers in your game **without writing any code or formulas**. You just click buttons to build operations like "health = health - 5" or "score = score + 10".

**No math skills required!** Everything is explained step-by-step with examples and visual guides.

---

## Why Do I Need This?

In adventure games, you track things with **variables** (also called "flags"):
- **health** - how much health the player has
- **score** - the player's current score
- **keys_collected** - how many keys they found
- **torch_fuel** - how much fuel remains in the torch

You need to **change these numbers** when things happen:
- Player takes damage → health goes down
- Player solves puzzle → score goes up
- Player picks up key → keys_collected increases
- Each turn passes → torch_fuel decreases

The Flag Calculator makes this **super easy** with just button clicks!

---

## How to Open the Flag Calculator

1. Go to the **Rules** panel (left sidebar)
2. Edit or create a rule
3. In the **Actions** section, click **"+ Add Action"**
4. Click **"🧮 Flag Calculator"** button
5. The calculator opens in a big modal window

---

## Tutorial Mode (Recommended for First-Time Users!)

When you first open the Flag Calculator, you'll see a **tutorial banner** at the top:

```
💡 Tutorial Step 1/5: Welcome! Let's learn how to change numbers in your game.
                      Click through these 5 quick steps.

[Next Step →]  [Skip Tutorial]
```

### The 5 Tutorial Steps:

**Step 1: What are Variables?**
> Variables are like boxes that hold numbers. 'health' might hold 100, 'score' might hold 0.

**Step 2: What are Operations?**
> Operations are what you DO to the number. '+' means add, '-' means subtract.

**Step 3: What are Values?**
> Values are the numbers you're working with. Want to lose 5 health? The value is 5.

**Step 4: Building Your First Formula**
> Click 'health' → Click '-' → Click '5' → You've built "health = health - 5"!

**Step 5: Preview and Test**
> Preview shows what happens! If health=50 and you subtract 10, it becomes 40. Try it!

---

## The Calculator Interface

Here's what you'll see:

```
┌─ Flag Calculator - No Math Skills Required! ──────────────────────┐
│                                                    [✕ Close]       │
├───────────────────────────────────────────────────────────────────┤
│ 💡 Tutorial Step 1/5: ...                                         │
├───────────────────────────────────────────────────────────────────┤
│ Build math operations by clicking buttons. No typing required!    │
│ Example: Click 'health' → Click '-' → Type '5' → health loses 5!  │
├───────────────────────────────────────────────────────────────────┤
│ Step 1: What do you want to change?                               │
│ Pick a variable (like health, score, keys). These are numbers     │
│ your game tracks.                                                  │
│                                                                    │
│ [health] [score] [keys] [torch_fuel] [gold] ...                   │
├───────────────────────────────────────────────────────────────────┤
│ Step 2: What do you want to do?                                   │
│ Choose how to change the number. Hover to see examples!           │
│                                                                    │
│ ┌─ = Set to a value ────────────────────────────────────┐         │
│ │ Example: health = 100 (set health to exactly 100)     │         │
│ └────────────────────────────────────────────────────────┘         │
│                                                                    │
│ ┌─ + Add to current value ──────────────────────────────┐         │
│ │ Example: score = score + 10 (add 10 points)           │         │
│ └────────────────────────────────────────────────────────┘         │
│                                                                    │
│ ┌─ - Subtract from current value ──────────────────────┐          │
│ │ Example: health = health - 1 (lose 1 health)          │         │
│ └────────────────────────────────────────────────────────┘         │
│                                                                    │
│ ┌─ × Multiply current value ───────────────────────────┐          │
│ │ Example: score = score × 2 (double the score)         │         │
│ └────────────────────────────────────────────────────────┘         │
│                                                                    │
│ ┌─ ÷ Divide current value ─────────────────────────────┐          │
│ │ Example: gold = gold ÷ 2 (halve your gold)            │         │
│ └────────────────────────────────────────────────────────┘         │
├───────────────────────────────────────────────────────────────────┤
│ Step 3: By how much?                                              │
│ Enter a number, or pick another variable to use its value.        │
│                                                                    │
│ Quick Numbers: [1] [5] [10] [25] [50] [100]                       │
├───────────────────────────────────────────────────────────────────┤
│ 👁️ Preview - See What Happens                                     │
│                                                                    │
│ Formula: health = health - 10                                      │
│ If health starts at 50 → After: 40                                │
│ If health starts at 100 → After: 90                               │
├───────────────────────────────────────────────────────────────────┤
│ 📚 Common Patterns - Click to Use                                  │
│                                                                    │
│ ┌─ Lose 1 health per turn ──────────────┐                         │
│ │ health = health - 1                    │                         │
│ └────────────────────────────────────────┘                         │
│                                                                    │
│ ┌─ Gain 10 points for action ───────────┐                         │
│ │ score = score + 10                     │                         │
│ └────────────────────────────────────────┘                         │
│                                                                    │
│ ┌─ Double the score ─────────────────────┐                         │
│ │ score = score × 2                      │                         │
│ └────────────────────────────────────────┘                         │
├───────────────────────────────────────────────────────────────────┤
│                  [✓ Add This to My Rule]                           │
└───────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Example: Lose Health

Let's say you want the player to **lose 5 health** when they fail a puzzle.

### Step 1: Choose Variable
Click the **[health]** button under "Step 1"

→ The button highlights to show it's selected

### Step 2: Choose Operation
Click the **"- Subtract from current value"** card

→ The card highlights green to show it's selected
→ You see the example: "health = health - 1 (lose 1 health)"

### Step 3: Choose Value
Click the **[5]** button under "Step 3"

→ The button highlights to show it's selected

### Step 4: Preview
Look at the **"👁️ Preview"** section:

```
Formula: health = health - 5
If health starts at 100 → After: 95
If health starts at 50 → After: 45
If health starts at 5 → After: 0
```

This shows you **exactly** what will happen with different starting values!

### Step 5: Add to Rule
Click **[✓ Add This to My Rule]**

→ The calculator closes
→ Your rule now has a new action: "DecrementFlag health by 5"
→ Done! ✅

---

## Common Patterns Library

The **📚 Common Patterns** section has pre-built formulas you can use instantly:

### Pattern 1: Lose 1 health per turn
**Use case:** Poison effect, starvation, curse
**Formula:** `health = health - 1`
**How to use:** Click this pattern → Click "Add to Rule"

### Pattern 2: Gain 10 points for action
**Use case:** Solving a puzzle, finding treasure
**Formula:** `score = score + 10`
**How to use:** Click this pattern → Click "Add to Rule"

### Pattern 3: Double the score
**Use case:** Bonus multiplier, special power-up
**Formula:** `score = score × 2`
**How to use:** Click this pattern → Click "Add to Rule"

### Pattern 4: Set health to full
**Use case:** Using a healing potion, resting at inn
**Formula:** `health = 100`
**How to use:** Click this pattern → Click "Add to Rule"

### Pattern 5: Items collected × 10 = score
**Use case:** Calculate final score based on collectibles
**Formula:** `score = items × 10`
**How to use:** Click this pattern → Click "Add to Rule"

---

## Color-Coded Operations

Each operation has a **unique color** to help you remember:

- **Purple** = **Set (=)** - Replace with exact value
- **Green** = **Add (+)** - Increase the number
- **Orange/Red** = **Subtract (-)** - Decrease the number
- **Blue** = **Multiply (×)** - Make it bigger by multiplying
- **Brown/Tan** = **Divide (÷)** - Make it smaller by dividing

---

## Troubleshooting

### "I clicked Add to Rule but nothing happened!"

**Check these 3 things:**
1. Did you select a **variable**? (Step 1)
2. Did you select an **operation**? (Step 2)
3. Did you select a **value**? (Step 3)

All three must be selected before you can add the formula!

### "I don't see any variables to choose from!"

You need to **create flags first**:
1. Go to the **Flags** panel (left sidebar)
2. Click **"+ Add Flag"**
3. Give it a friendly name like "health" or "score"
4. Now return to the Rule editor and open the Flag Calculator

### "The tutorial keeps showing up and I want to skip it!"

Click **[Skip Tutorial]** in the tutorial banner.

To permanently disable tutorials:
- (Future feature) Settings → Disable tutorial mode

### "I want to see the tutorial again!"

- (Future feature) Help menu → Restart Flag Calculator tutorial

---

## Advanced Tips

### Tip 1: Use Descriptive Flag Names
Instead of "flag5" or "f3", use names like:
- ✅ `player_health`
- ✅ `torch_fuel_remaining`
- ✅ `puzzle_pieces_collected`
- ❌ `flag5`
- ❌ `f3`

### Tip 2: Test with Preview
Always check the **Preview section** to see if your formula does what you expect!

### Tip 3: Start Simple
Don't try to build complex multi-step operations right away. Start with:
1. Simple adds/subtracts
2. Then try multiplying/dividing
3. Then try using one variable to change another

### Tip 4: Use Common Patterns
The patterns library has the most common game mechanics already built. Click them to save time!

---

## What Gets Generated

When you use the Flag Calculator, it creates **proper DAAD actions** behind the scenes:

| Your Formula | DAAD Action Created |
|--------------|---------------------|
| `health = 100` | `SETFLAG health 100` |
| `score + 10` | `INCFLAG score` (10 times) |
| `health - 5` | `DECFLAG health` (5 times) |
| `score × 2` | (Complex: copy, add, etc.) |

But you **never have to think about this**! The calculator handles all the technical details.

---

## Real-World Game Examples

### Example 1: Health System
**Rule:** "Player steps on spikes"
**Action:** Use Flag Calculator
- Variable: `health`
- Operation: `-` (subtract)
- Value: `10`
**Result:** Player loses 10 health when stepping on spikes

### Example 2: Score System
**Rule:** "Player solves statue puzzle"
**Action:** Use Flag Calculator
- Variable: `score`
- Operation: `+` (add)
- Value: `50`
**Result:** Player gains 50 points for solving puzzle

### Example 3: Torch Fuel
**Rule:** "Every turn" (Auto-action)
**Action:** Use Flag Calculator
- Variable: `torch_fuel`
- Operation: `-` (subtract)
- Value: `1`
**Result:** Torch loses 1 fuel each turn

### Example 4: Key Collection
**Rule:** "Player picks up key"
**Action 1:** Move key to inventory
**Action 2:** Use Flag Calculator
- Variable: `keys_found`
- Operation: `+` (add)
- Value: `1`
**Result:** Keys counter increases

### Example 5: Bonus Multiplier
**Rule:** "Player finds secret bonus room"
**Action:** Use Flag Calculator
- Variable: `score`
- Operation: `×` (multiply)
- Value: `2`
**Result:** All points earned so far are doubled!

---

## FAQ

**Q: Do I need to know programming to use this?**
A: No! That's the whole point. Just click buttons.

**Q: Do I need to know math?**
A: Only basic concepts like "add means increase" and "subtract means decrease". The examples explain everything.

**Q: What if I make a mistake?**
A: You can always delete the action from your rule and try again. Nothing is permanent until you save your game.

**Q: Can I chain multiple formulas together?**
A: Yes! Each formula becomes one action. Add multiple actions to your rule to chain operations.

**Q: Can I use one variable to change another?**
A: In the current version, you can use simple numbers. Advanced variable-to-variable operations are coming soon!

**Q: What's the maximum/minimum value for variables?**
A: Variables (flags) can hold values from 0 to 255 in DAAD.

---

## Keyboard Shortcuts

*(Future feature)*
- `Esc` - Close calculator
- `1-5` - Jump to tutorial step
- `Enter` - Add formula to rule
- `Space` - Next tutorial step

---

## Still Confused?

**Watch the built-in tutorial!** It walks you through creating your first formula step-by-step.

**Remember:** The Flag Calculator is designed so that **anyone can use it, even if you've never coded before**. Take your time, read the examples, and experiment. You can't break anything!

---

*Part of the DAAD Bevy Builder - Visual Adventure Game Creator*
*No Code Required™*
