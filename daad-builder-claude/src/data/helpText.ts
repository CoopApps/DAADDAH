// DAAD help text and tooltips

export const HELP_TEXT = {
  // Process Tables
  PRO0: "Main process table. Runs when player enters a command. Use for standard verb/noun combinations.",
  PRO1: "Intercept process. Runs BEFORE PRO0. Use to override or modify player commands.",
  PRO2: "Automatic process. Runs AFTER every player action. Use for automatic events and NPC behavior.",
  PRO3: "System events. Reserved for internal use.",

  // Common Conditions
  AT_LOCATION: "Checks if player is at a specific location. Use locno parameter.",
  AT_COMMAND: "Checks if player typed a specific verb/noun combination. Use verb and noun parameters.",
  PRESENT: "Checks if object is carried, worn, or at current location.",
  ABSENT: "Checks if object is NOT present (opposite of PRESENT).",
  CARRIED: "Checks if object is in player's inventory.",
  WORN: "Checks if object is being worn by player.",
  ZERO: "Checks if a flag equals 0.",
  NOTZERO: "Checks if a flag is NOT 0.",
  EQ: "Checks if a flag equals a specific value.",
  GT: "Checks if a flag is greater than a value.",
  LT: "Checks if a flag is less than a value.",

  // Common Actions
  MESSAGE: "Displays a message to the player. Use mesno parameter.",
  DESC: "Describes the current location (shows location description and objects).",
  GOTO: "Moves player to a different location. Use with DESC to show new location.",
  GET: "Adds object to player's inventory.",
  DROP: "Removes object from inventory and places it at current location.",
  WEAR: "Makes player wear an object.",
  REMOVE: "Removes worn object.",
  PLACE: "Places an object at a specific location.",
  SET: "Sets a flag to a specific value.",
  CLEAR: "Sets a flag to 0.",
  DONE: "Stops processing more rules. Use at end of rule to prevent other rules from running.",
  QUIT: "Ends the game.",
  SAVE: "Saves game state (if supported by platform).",
  LOAD: "Loads saved game state.",

  // Flags
  FLAG_1: "System flag: Number of objects carried. Automatically maintained.",
  FLAG_37: "Max carry objects. Default 6. Player cannot carry more than this.",
  FLAG_52: "Max carry weight. Default 10. Total weight of carried objects cannot exceed this.",

  // Object Properties
  TAKEABLE: "Object can be picked up by player with GET command.",
  WEARABLE: "Object can be worn by player with WEAR command.",
  CONTAINER: "Object can contain other objects. Other objects can be placed inside it.",
  LIGHT_SOURCE: "Object provides light in dark locations.",
  PSI: "Person/Sentient Intelligence. Shows in Characters panel instead of Objects panel.",

  // Location Properties
  DARK: "Location is dark. Player needs a light source to see.",
  EXITS: "Connections to other locations. 12 directions available: N, S, E, W, NE, NW, SE, SW, UP, DOWN, IN, OUT.",

  // Game Structure
  VOCABULARY: "Words the player can type. Each word has a type (Verb, Noun, Adjective) and unique ID.",
  MESSAGES: "Text strings referenced by rules using MESSAGE action. Use $VERB$ and $NOUN$ for substitution.",
  RULES: "Game logic. Each rule has conditions (what to check) and actions (what to do).",

  // Best Practices
  RULE_ORDERING: "Rules are checked in order. Use DONE action to stop checking after a match. More specific rules should come before general ones.",
  FLAG_USAGE: "Use flags to track game state (puzzles solved, items given to NPCs, story progress). Flag IDs 1-255.",
  OBJECT_WEIGHT: "Total weight of carried objects checked against FLAG 52. Set appropriate weights for balance.",
};

export function getConditionHelp(conditionType: string): string {
  const help: Record<string, string> = {
    AT: "Checks location OR command. With locno: checks player location. With verb/noun: checks player input.",
    NOTAT: "Checks if player is NOT at specified location.",
    PRESENT: "Object is carried, worn, or at current location.",
    ABSENT: "Object is NOT present (not carried, worn, or here).",
    CARRIED: "Object is in player's inventory.",
    NOTCARR: "Object is NOT in inventory.",
    WORN: "Object is being worn by player.",
    NOTWORN: "Object is NOT being worn.",
    ZERO: "Flag value equals 0.",
    NOTZERO: "Flag value is NOT 0.",
    EQ: "Flag equals specific value.",
    NOTEQ: "Flag does NOT equal value.",
    GT: "Flag is greater than value.",
    LT: "Flag is less than value.",
    SAME: "Two flags have same value.",
    NOTSAME: "Two flags have different values.",
    ISAT: "Object is at specific location.",
    ISNOTAT: "Object is NOT at specific location.",
  };
  return help[conditionType] || "No help available for this condition.";
}

export function getActionHelp(actionType: string): string {
  const help: Record<string, string> = {
    MESSAGE: "Display message to player. Use $VERB$ and $NOUN$ for word substitution.",
    DESC: "Describe current location (shows description and visible objects).",
    GOTO: "Move player to location. Usually followed by DESC to show new location.",
    GET: "Add object to inventory (if weight/carry limits allow).",
    DROP: "Remove from inventory, place at current location.",
    WEAR: "Equip object (must be wearable).",
    REMOVE: "Unequip worn object.",
    PLACE: "Put object at specific location.",
    SET: "Set flag to value.",
    PLUS: "Add value to flag.",
    MINUS: "Subtract value from flag.",
    CLEAR: "Set flag to 0.",
    DONE: "Stop checking more rules. Important: prevents other rules from running!",
    QUIT: "End the game.",
    SAVE: "Save game state to disk.",
    LOAD: "Load saved game.",
    DESCRIBE: "Show object description text.",
    ANYKEY: "Wait for player to press any key.",
    CLS: "Clear screen.",
    PAPER: "Set text color.",
    INK: "Set background color.",
  };
  return help[actionType] || "No help available for this action.";
}
