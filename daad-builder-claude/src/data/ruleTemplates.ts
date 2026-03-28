import { ProcessTable } from "../types/daad";

// Template rules use string shorthand for conditions/actions instead of full objects
export interface TemplateRule {
  name: string;
  process: ProcessTable;
  enabled: boolean;
  conditions: string[];
  actions: string[];
}

export interface RuleTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  rule: TemplateRule;
  instructions?: string;
}

export const RULE_TEMPLATE_CATEGORIES = [
  "Object Interaction",
  "Movement & Navigation",
  "Inventory Management",
  "Puzzles & Logic",
  "NPCs & Dialogue",
  "Game State",
  "Combat & Danger",
  "Environment",
] as const;

export const RULE_TEMPLATES: RuleTemplate[] = [
  // Object Interaction
  {
    id: "take-simple",
    name: "Take Object (Simple)",
    category: "Object Interaction",
    description: "Pick up an object that's present in the room",
    difficulty: "beginner",
    tags: ["object", "inventory", "basic"],
    rule: {
      name: "Take Object",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0"],
      actions: ["GET 0", "MESSAGE 1", "DONE"],
    },
    instructions: "Replace '0' with object ID, '1' with success message ID",
  },
  {
    id: "take-conditional",
    name: "Take Object (Conditional)",
    category: "Object Interaction",
    description: "Pick up an object only if player has another item",
    difficulty: "intermediate",
    tags: ["object", "inventory", "conditional"],
    rule: {
      name: "Take with Required Item",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "CARRIED 1"],
      actions: ["GET 0", "MESSAGE 2", "DONE"],
    },
    instructions: "Object 0 requires carrying object 1 to pick up",
  },
  {
    id: "examine-object",
    name: "Examine Object",
    category: "Object Interaction",
    description: "Display description when examining an object",
    difficulty: "beginner",
    tags: ["object", "description"],
    rule: {
      name: "Examine Object",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0"],
      actions: ["MESSAGE 1", "DONE"],
    },
    instructions: "Shows message 1 when examining object 0",
  },
  {
    id: "use-item-on-object",
    name: "Use Item On Object",
    category: "Object Interaction",
    description: "Use one object on another (e.g., key on door)",
    difficulty: "intermediate",
    tags: ["object", "combination", "puzzle"],
    rule: {
      name: "Use Item On Object",
      process: "PRO0",
      enabled: true,
      conditions: ["CARRIED 0", "PRESENT 1"],
      actions: ["MESSAGE 2", "DESTROY 0", "CREATE 3", "DONE"],
    },
    instructions: "Use carried object 0 on present object 1, destroy 0, create 3",
  },
  {
    id: "combine-items",
    name: "Combine Two Items",
    category: "Object Interaction",
    description: "Combine two inventory items to create a new one",
    difficulty: "intermediate",
    tags: ["crafting", "inventory", "puzzle"],
    rule: {
      name: "Combine Items",
      process: "PRO0",
      enabled: true,
      conditions: ["CARRIED 0", "CARRIED 1"],
      actions: ["DESTROY 0", "DESTROY 1", "CREATE 2", "GET 2", "MESSAGE 3", "DONE"],
    },
    instructions: "Combine items 0 and 1 to create item 2",
  },

  // Movement & Navigation
  {
    id: "unlock-exit",
    name: "Unlock Exit",
    category: "Movement & Navigation",
    description: "Unlock a direction with a key",
    difficulty: "intermediate",
    tags: ["movement", "key", "door"],
    rule: {
      name: "Unlock Door",
      process: "PRO0",
      enabled: true,
      conditions: ["CARRIED 0", "AT 1"],
      actions: ["MESSAGE 2", "SET 3", "DONE"],
    },
    instructions: "Use key (object 0) at location 1, set flag 3 to unlock",
  },
  {
    id: "conditional-movement",
    name: "Conditional Movement",
    category: "Movement & Navigation",
    description: "Block movement unless condition is met",
    difficulty: "intermediate",
    tags: ["movement", "blocking", "flag"],
    rule: {
      name: "Block Movement",
      process: "PRO1",
      enabled: true,
      conditions: ["AT 0", "NOTZERO 1"],
      actions: ["MESSAGE 2", "DONE"],
    },
    instructions: "Block leaving location 0 if flag 1 is set",
  },
  {
    id: "dark-room",
    name: "Dark Room (Need Light)",
    category: "Movement & Navigation",
    description: "Require light source to navigate dark room",
    difficulty: "intermediate",
    tags: ["darkness", "light", "atmosphere"],
    rule: {
      name: "Dark Room Check",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "NOTCARR 1"],
      actions: ["MESSAGE 2", "DONE"],
    },
    instructions: "In dark location 0, need to carry light source (object 1)",
  },
  {
    id: "one-way-passage",
    name: "One-Way Passage",
    category: "Movement & Navigation",
    description: "Allow movement in one direction only",
    difficulty: "intermediate",
    tags: ["movement", "flag", "direction"],
    rule: {
      name: "One-Way Check",
      process: "PRO1",
      enabled: true,
      conditions: ["AT 0", "ZERO 1"],
      actions: ["MESSAGE 2", "DONE"],
    },
    instructions: "Block return to location 0 after flag 1 is set",
  },

  // Inventory Management
  {
    id: "drop-object",
    name: "Drop Object",
    category: "Inventory Management",
    description: "Drop an object from inventory",
    difficulty: "beginner",
    tags: ["inventory", "drop"],
    rule: {
      name: "Drop Object",
      process: "PRO0",
      enabled: true,
      conditions: ["CARRIED 0"],
      actions: ["DROP 0", "MESSAGE 1", "DONE"],
    },
    instructions: "Drop carried object 0, show message 1",
  },
  {
    id: "weight-limit",
    name: "Weight Limit Check",
    category: "Inventory Management",
    description: "Prevent taking items if carrying too much",
    difficulty: "advanced",
    tags: ["inventory", "limit", "weight"],
    rule: {
      name: "Weight Limit",
      process: "PRO1",
      enabled: true,
      conditions: ["WEIGHT", "GT 10"],
      actions: ["MESSAGE 1", "DONE"],
    },
    instructions: "Block actions if carrying more than 10 weight units",
  },
  {
    id: "auto-drop",
    name: "Auto-Drop Heavy Item",
    category: "Inventory Management",
    description: "Automatically drop item when entering location",
    difficulty: "intermediate",
    tags: ["inventory", "automatic", "location"],
    rule: {
      name: "Auto Drop",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "CARRIED 1"],
      actions: ["DROP 1", "MESSAGE 2", "DONE"],
    },
    instructions: "Auto-drop object 1 when entering location 0",
  },

  // Puzzles & Logic
  {
    id: "push-button",
    name: "Push Button",
    category: "Puzzles & Logic",
    description: "Activate a button to toggle a flag",
    difficulty: "beginner",
    tags: ["puzzle", "flag", "toggle"],
    rule: {
      name: "Push Button",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "ZERO 1"],
      actions: ["MESSAGE 2", "SET 1", "DONE"],
    },
    instructions: "Push button (object 0) to set flag 1",
  },
  {
    id: "sequence-puzzle",
    name: "Sequence Puzzle Step",
    category: "Puzzles & Logic",
    description: "Part of a multi-step sequence puzzle",
    difficulty: "advanced",
    tags: ["puzzle", "sequence", "flags"],
    rule: {
      name: "Sequence Step",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "EQ 1 2"],
      actions: ["MESSAGE 3", "ADD 1 1", "DONE"],
    },
    instructions: "Step in sequence: when flag 1 equals 2, increment it",
  },
  {
    id: "timer-puzzle",
    name: "Timed Challenge",
    category: "Puzzles & Logic",
    description: "Count down turns and trigger event",
    difficulty: "advanced",
    tags: ["puzzle", "timer", "countdown"],
    rule: {
      name: "Timer Countdown",
      process: "PRO2",
      enabled: true,
      conditions: ["NOTZERO 0", "GT 0 0"],
      actions: ["SUB 0 1", "MESSAGE 1"],
    },
    instructions: "Decrement timer flag 0 each turn until it reaches 0",
  },
  {
    id: "keypad-code",
    name: "Keypad Code Entry",
    category: "Puzzles & Logic",
    description: "Enter correct code to unlock something",
    difficulty: "advanced",
    tags: ["puzzle", "code", "keypad"],
    rule: {
      name: "Keypad Correct Code",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "EQ 1 1234"],
      actions: ["MESSAGE 2", "SET 3", "DONE"],
    },
    instructions: "Check if flag 1 equals code 1234, set unlock flag 3",
  },

  // NPCs & Dialogue
  {
    id: "talk-to-npc",
    name: "Talk to NPC",
    category: "NPCs & Dialogue",
    description: "Simple conversation with NPC",
    difficulty: "beginner",
    tags: ["npc", "dialogue"],
    rule: {
      name: "Talk to NPC",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0"],
      actions: ["MESSAGE 1", "DONE"],
    },
    instructions: "Talk to NPC (object 0), show dialogue (message 1)",
  },
  {
    id: "give-item-npc",
    name: "Give Item to NPC",
    category: "NPCs & Dialogue",
    description: "Trade item with NPC for reward",
    difficulty: "intermediate",
    tags: ["npc", "trade", "quest"],
    rule: {
      name: "Give Item to NPC",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "CARRIED 1"],
      actions: ["DESTROY 1", "CREATE 2", "GET 2", "MESSAGE 3", "DONE"],
    },
    instructions: "Give item 1 to NPC 0, receive item 2",
  },
  {
    id: "npc-follow",
    name: "NPC Follow Player",
    category: "NPCs & Dialogue",
    description: "Make NPC follow player between rooms",
    difficulty: "advanced",
    tags: ["npc", "follow", "movement"],
    rule: {
      name: "NPC Follows",
      process: "PRO2",
      enabled: true,
      conditions: ["NOTZERO 0", "NOTAT 1"],
      actions: ["PLACE 1"],
    },
    instructions: "If flag 0 is set, NPC (object 1) follows to current location",
  },

  // Game State
  {
    id: "game-win",
    name: "Win Condition",
    category: "Game State",
    description: "Check if player has won the game",
    difficulty: "beginner",
    tags: ["ending", "win"],
    rule: {
      name: "Win Game",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "CARRIED 1"],
      actions: ["MESSAGE 2", "END"],
    },
    instructions: "Win if at location 0 with object 1",
  },
  {
    id: "game-over",
    name: "Game Over Condition",
    category: "Game State",
    description: "Trigger game over",
    difficulty: "beginner",
    tags: ["ending", "death"],
    rule: {
      name: "Game Over",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "ZERO 1"],
      actions: ["MESSAGE 2", "END"],
    },
    instructions: "Game over if at location 0 without flag 1 set",
  },
  {
    id: "score-increment",
    name: "Increment Score",
    category: "Game State",
    description: "Add points when achieving something",
    difficulty: "beginner",
    tags: ["score", "achievement"],
    rule: {
      name: "Add Score",
      process: "PRO0",
      enabled: true,
      conditions: ["PRESENT 0", "ZERO 1"],
      actions: ["ADD 2 10", "SET 1", "MESSAGE 3", "DONE"],
    },
    instructions: "Award 10 points to flag 2, set completion flag 1",
  },

  // Combat & Danger
  {
    id: "health-damage",
    name: "Take Damage",
    category: "Combat & Danger",
    description: "Reduce health and check for death",
    difficulty: "intermediate",
    tags: ["combat", "health", "damage"],
    rule: {
      name: "Take Damage",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "GT 1 0"],
      actions: ["SUB 1 10", "MESSAGE 2"],
    },
    instructions: "At dangerous location 0, reduce health (flag 1) by 10",
  },
  {
    id: "death-check",
    name: "Death Check",
    category: "Combat & Danger",
    description: "Check if player health reached zero",
    difficulty: "intermediate",
    tags: ["combat", "health", "death"],
    rule: {
      name: "Check Death",
      process: "PRO2",
      enabled: true,
      conditions: ["LT 0 1"],
      actions: ["MESSAGE 1", "END"],
    },
    instructions: "Game over if health (flag 0) drops below 1",
  },
  {
    id: "use-healing",
    name: "Use Healing Item",
    category: "Combat & Danger",
    description: "Use item to restore health",
    difficulty: "intermediate",
    tags: ["combat", "health", "item"],
    rule: {
      name: "Use Healing",
      process: "PRO0",
      enabled: true,
      conditions: ["CARRIED 0"],
      actions: ["DESTROY 0", "ADD 1 20", "MESSAGE 2", "DONE"],
    },
    instructions: "Use healing item 0 to restore 20 health (flag 1)",
  },

  // Environment
  {
    id: "weather-change",
    name: "Weather System",
    category: "Environment",
    description: "Change weather/time based on flag",
    difficulty: "intermediate",
    tags: ["atmosphere", "time", "flag"],
    rule: {
      name: "Weather Check",
      process: "PRO2",
      enabled: true,
      conditions: ["NOTZERO 0"],
      actions: ["MESSAGE 1"],
    },
    instructions: "Display weather message 1 when flag 0 is set",
  },
  {
    id: "random-event",
    name: "Random Event Trigger",
    category: "Environment",
    description: "Trigger random events using chance",
    difficulty: "advanced",
    tags: ["random", "event", "atmosphere"],
    rule: {
      name: "Random Event",
      process: "PRO2",
      enabled: true,
      conditions: ["AT 0", "CHANCE 25"],
      actions: ["MESSAGE 1"],
    },
    instructions: "25% chance to show message 1 at location 0 each turn",
  },
  {
    id: "turn-counter",
    name: "Turn Counter",
    category: "Environment",
    description: "Track number of turns taken",
    difficulty: "beginner",
    tags: ["tracking", "turns"],
    rule: {
      name: "Count Turns",
      process: "PRO2",
      enabled: true,
      conditions: [],
      actions: ["ADD 0 1"],
    },
    instructions: "Increment turn counter (flag 0) every turn",
  },
];

// Group templates by category
export function getTemplatesByCategory(category: string): RuleTemplate[] {
  return RULE_TEMPLATES.filter(t => t.category === category);
}

// Get templates by difficulty
export function getTemplatesByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): RuleTemplate[] {
  return RULE_TEMPLATES.filter(t => t.difficulty === difficulty);
}

// Search templates
export function searchTemplates(query: string): RuleTemplate[] {
  const lowerQuery = query.toLowerCase();
  return RULE_TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(lowerQuery) ||
    t.description.toLowerCase().includes(lowerQuery) ||
    t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
