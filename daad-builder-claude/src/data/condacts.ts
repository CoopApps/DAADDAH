/**
 * DAAD Condact Definitions
 * 
 * Used by RulesPanel to populate condition/action dropdowns and render
 * the correct parameter inputs for each condact type.
 * 
 * Param types understood by RulesPanel:
 *   "location"  → dropdown of game locations (+ locno+ specials)
 *   "object"    → dropdown of game objects
 *   "flag"      → dropdown of game flags
 *   "message"   → dropdown of game messages
 *   "word"      → dropdown from vocabulary
 *   "value"     → number input 0-255
 *   "percent"   → number input 1-99
 *   "string"    → text input (for word/synonym params)
 *   "color"     → number input 0-15
 *   "window"    → number input 0-7
 *   "option"    → number input 0-255 (for bitmask options)
 */

import { ConditionType, ActionType } from "../types/daad";

interface CondactParam {
  name: string;
  type: "location" | "object" | "flag" | "message" | "word" | "value" | "percent" | "string" | "color" | "window" | "option";
  description: string;
  optional?: boolean;
}

interface CondactDef {
  type: string;
  description: string;
  category: string;
  params: CondactParam[];
}

// ── CONDITIONS ──────────────────────────────────────────────────────────────

export const CONDITIONS: Record<ConditionType, CondactDef> = {
  // Location
  AT: {
    type: "AT", category: "Location",
    description: "Succeeds if the player is at the given location.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },
  NOTAT: {
    type: "NOTAT", category: "Location",
    description: "Succeeds if the player is NOT at the given location.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },
  ATGT: {
    type: "ATGT", category: "Location",
    description: "Succeeds if the player's location number is greater than the given value.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },
  ATLT: {
    type: "ATLT", category: "Location",
    description: "Succeeds if the player's location number is less than the given value.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },

  // Object position
  PRESENT: {
    type: "PRESENT", category: "Object Position",
    description: "Succeeds if the object is carried, worn, or at the current location.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  ABSENT: {
    type: "ABSENT", category: "Object Position",
    description: "Succeeds if the object is NOT carried, worn, or at the current location.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  WORN: {
    type: "WORN", category: "Object Position",
    description: "Succeeds if the object is being worn by the player.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  NOTWORN: {
    type: "NOTWORN", category: "Object Position",
    description: "Succeeds if the object is NOT being worn.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  CARRIED: {
    type: "CARRIED", category: "Object Position",
    description: "Succeeds if the object is being carried by the player.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  NOTCARR: {
    type: "NOTCARR", category: "Object Position",
    description: "Succeeds if the object is NOT being carried.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  ISAT: {
    type: "ISAT", category: "Object Position",
    description: "Succeeds if the object is at the given location. 254=carried, 255=here.",
    params: [
      { name: "objno", type: "object", description: "Object" },
      { name: "locno", type: "location", description: "Location (254=carried, 255=here)" },
    ],
  },
  ISNOTAT: {
    type: "ISNOTAT", category: "Object Position",
    description: "Succeeds if the object is NOT at the given location.",
    params: [
      { name: "objno", type: "object", description: "Object" },
      { name: "locno", type: "location", description: "Location" },
    ],
  },

  // Object attributes
  HASAT: {
    type: "HASAT", category: "Object Position",
    description: "Succeeds if the current object has the given attribute set. Common: 23=WEARABLE, 31=CONTAINER, 55=LISTED, 87=TIMEOUT, 247=GMODE.",
    params: [{ name: "attribute", type: "value", description: "Attribute number (23=wearable, 31=container)" }],
  },
  HASNAT: {
    type: "HASNAT", category: "Object Position",
    description: "Succeeds if the current object does NOT have the given attribute set.",
    params: [{ name: "attribute", type: "value", description: "Attribute number (23=wearable, 31=container)" }],
  },

  // Flags
  ZERO: {
    type: "ZERO", category: "Flags",
    description: "Succeeds if the flag is zero (false).",
    params: [{ name: "flagno", type: "flag", description: "Flag" }],
  },
  NOTZERO: {
    type: "NOTZERO", category: "Flags",
    description: "Succeeds if the flag is not zero (true).",
    params: [{ name: "flagno", type: "flag", description: "Flag" }],
  },
  EQ: {
    type: "EQ", category: "Flags",
    description: "Succeeds if the flag equals the value.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Value to compare" },
    ],
  },
  NOTEQ: {
    type: "NOTEQ", category: "Flags",
    description: "Succeeds if the flag does NOT equal the value.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Value to compare" },
    ],
  },
  GT: {
    type: "GT", category: "Flags",
    description: "Succeeds if the flag is greater than the value.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Value to compare" },
    ],
  },
  LT: {
    type: "LT", category: "Flags",
    description: "Succeeds if the flag is less than the value.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Value to compare" },
    ],
  },
  SAME: {
    type: "SAME", category: "Flags",
    description: "Succeeds if two flags have the same value.",
    params: [
      { name: "flagno1", type: "flag", description: "Flag 1" },
      { name: "flagno2", type: "flag", description: "Flag 2" },
    ],
  },
  NOTSAME: {
    type: "NOTSAME", category: "Flags",
    description: "Succeeds if two flags have different values.",
    params: [
      { name: "flagno1", type: "flag", description: "Flag 1" },
      { name: "flagno2", type: "flag", description: "Flag 2" },
    ],
  },
  BIGGER: {
    type: "BIGGER", category: "Flags",
    description: "Succeeds if Flag 1 is larger than Flag 2.",
    params: [
      { name: "flagno1", type: "flag", description: "Flag 1 (larger)" },
      { name: "flagno2", type: "flag", description: "Flag 2 (smaller)" },
    ],
  },
  SMALLER: {
    type: "SMALLER", category: "Flags",
    description: "Succeeds if Flag 1 is smaller than Flag 2.",
    params: [
      { name: "flagno1", type: "flag", description: "Flag 1 (smaller)" },
      { name: "flagno2", type: "flag", description: "Flag 2 (larger)" },
    ],
  },

  // Extended logical sentence
  ADJECT1: {
    type: "ADJECT1", category: "Extended LS",
    description: "Succeeds if the first noun's adjective in the current Logical Sentence matches this word.",
    params: [{ name: "word", type: "string", description: "Adjective word (or _ for none)" }],
  },
  ADVERB: {
    type: "ADVERB", category: "Extended LS",
    description: "Succeeds if the adverb in the current Logical Sentence matches this word.",
    params: [{ name: "word", type: "string", description: "Adverb word" }],
  },
  PREP: {
    type: "PREP", category: "Extended LS",
    description: "Succeeds if the preposition in the current Logical Sentence matches this word.",
    params: [{ name: "word", type: "string", description: "Preposition word (e.g. IN, ON, AT)" }],
  },
  NOUN2: {
    type: "NOUN2", category: "Extended LS",
    description: "Succeeds if the second noun in the current Logical Sentence matches this word.",
    params: [{ name: "word", type: "string", description: "Second noun word" }],
  },
  ADJECT2: {
    type: "ADJECT2", category: "Extended LS",
    description: "Succeeds if the second noun's adjective in the current Logical Sentence matches.",
    params: [{ name: "word", type: "string", description: "Adjective word" }],
  },

  // Random
  CHANCE: {
    type: "CHANCE", category: "Random",
    description: "Succeeds with the given percentage probability (1-99).",
    params: [{ name: "percent", type: "percent", description: "Chance % (1-99)" }],
  },

  // Control flow
  ISDONE: {
    type: "ISDONE", category: "Control Flow",
    description: "Succeeds if the last sub-process table exited after doing at least one action.",
    params: [],
  },
  ISNDONE: {
    type: "ISNDONE", category: "Control Flow",
    description: "Succeeds if the last sub-process table exited without doing anything.",
    params: [],
  },

  // Input
  INKEY: {
    type: "INKEY", category: "Input",
    description: "Succeeds if the player is currently pressing a key.",
    params: [],
  },
  QUIT: {
    type: "QUIT", category: "Control Flow",
    description: "Prints 'Are you sure?' and succeeds if the player confirms. Use before END.",
    params: [],
  },
};

// ── ACTIONS ─────────────────────────────────────────────────────────────────

export const ACTIONS: Record<ActionType, CondactDef> = {
  // Object manipulation
  GET: {
    type: "GET", category: "Object Manipulation",
    description: "Picks up object. Checks weight/carry limits, prints appropriate system messages.",
    params: [{ name: "objno", type: "object", description: "Object to get" }],
  },
  DROP: {
    type: "DROP", category: "Object Manipulation",
    description: "Drops the object at the current location.",
    params: [{ name: "objno", type: "object", description: "Object to drop" }],
  },
  WEAR: {
    type: "WEAR", category: "Object Manipulation",
    description: "Wears the object (must be marked wearable). Decrements carry count.",
    params: [{ name: "objno", type: "object", description: "Object to wear" }],
  },
  REMOVE: {
    type: "REMOVE", category: "Object Manipulation",
    description: "Removes a worn object back to carried status.",
    params: [{ name: "objno", type: "object", description: "Object to remove" }],
  },
  CREATE: {
    type: "CREATE", category: "Object Manipulation",
    description: "Moves the object from limbo to the current location (makes it appear).",
    params: [{ name: "objno", type: "object", description: "Object to create" }],
  },
  DESTROY: {
    type: "DESTROY", category: "Object Manipulation",
    description: "Removes the object from the game (moves to limbo).",
    params: [{ name: "objno", type: "object", description: "Object to destroy" }],
  },
  SWAP: {
    type: "SWAP", category: "Object Manipulation",
    description: "Exchanges the positions of two objects. Flag 1 is not adjusted.",
    params: [
      { name: "objno1", type: "object", description: "Object 1" },
      { name: "objno2", type: "object", description: "Object 2" },
    ],
  },
  PLACE: {
    type: "PLACE", category: "Object Manipulation",
    description: "Moves the object to the given location. 254=carried, 255=here.",
    params: [
      { name: "objno", type: "object", description: "Object" },
      { name: "locno", type: "location", description: "Destination (254=carried, 255=here)" },
    ],
  },
  PUTO: {
    type: "PUTO", category: "Object Manipulation",
    description: "Moves the currently referenced object (flag 51) to the given location.",
    params: [{ name: "locno", type: "location", description: "Destination location" }],
  },
  PUTIN: {
    type: "PUTIN", category: "Object Manipulation",
    description: "Puts Object 1 into container Object 2. Checks carry status and prints messages.",
    params: [
      { name: "objno1", type: "object", description: "Object to put in" },
      { name: "objno2", type: "object", description: "Container object" },
    ],
  },
  TAKEOUT: {
    type: "TAKEOUT", category: "Object Manipulation",
    description: "Takes Object 1 out of container Object 2.",
    params: [
      { name: "objno1", type: "object", description: "Object to take out" },
      { name: "objno2", type: "object", description: "Container object" },
    ],
  },
  DROPALL: {
    type: "DROPALL", category: "Object Manipulation",
    description: "Drops all carried and worn objects at the current location. Sets flag 1 to 0.",
    params: [],
  },
  COPYOO: {
    type: "COPYOO", category: "Object Manipulation",
    description: "Copies the position of Object 1 to Object 2.",
    params: [
      { name: "objno1", type: "object", description: "Source object" },
      { name: "objno2", type: "object", description: "Destination object" },
    ],
  },
  COPYOF: {
    type: "COPYOF", category: "Object Manipulation",
    description: "Copies the position of an object into a flag.",
    params: [
      { name: "objno", type: "object", description: "Source object" },
      { name: "flagno", type: "flag", description: "Destination flag" },
    ],
  },
  COPYFO: {
    type: "COPYFO", category: "Object Manipulation",
    description: "Sets an object's position to the value in a flag.",
    params: [
      { name: "flagno", type: "flag", description: "Source flag" },
      { name: "objno", type: "object", description: "Object" },
    ],
  },
  RESET: {
    type: "RESET", category: "Object Manipulation",
    description: "Restores all objects to their starting positions (from the OBJ section).",
    params: [],
  },
  WHATO: {
    type: "WHATO", category: "Object Manipulation",
    description: "Searches for the object matching Noun1 in the LS, sets flag 51 to its number.",
    params: [],
  },
  SETCO: {
    type: "SETCO", category: "Object Manipulation",
    description: "Sets the currently referenced object (flag 51) to the given object number.",
    params: [{ name: "objno", type: "object", description: "Object" }],
  },
  WEIGH: {
    type: "WEIGH", category: "Object Manipulation",
    description: "Calculates the true weight of an object (including containers) and stores in a flag.",
    params: [
      { name: "objno", type: "object", description: "Object" },
      { name: "flagno", type: "flag", description: "Result flag" },
    ],
  },

  // Auto object actions (use Noun1 from current LS)
  AUTOG: {
    type: "AUTOG", category: "Auto Object",
    description: "Automatically GET the object matching Noun1 in the Logical Sentence.",
    params: [],
  },
  AUTOD: {
    type: "AUTOD", category: "Auto Object",
    description: "Automatically DROP the object matching Noun1 in the Logical Sentence.",
    params: [],
  },
  AUTOW: {
    type: "AUTOW", category: "Auto Object",
    description: "Automatically WEAR the object matching Noun1 in the Logical Sentence.",
    params: [],
  },
  AUTOR: {
    type: "AUTOR", category: "Auto Object",
    description: "Automatically REMOVE the object matching Noun1 in the Logical Sentence.",
    params: [],
  },
  AUTOP: {
    type: "AUTOP", category: "Auto Object",
    description: "Automatically PUTIN the object matching Noun1 into the given container.",
    params: [{ name: "locno", type: "location", description: "Container location" }],
  },
  AUTOT: {
    type: "AUTOT", category: "Auto Object",
    description: "Automatically TAKEOUT the object matching Noun1 from the given container.",
    params: [{ name: "locno", type: "location", description: "Container location" }],
  },

  // Flag manipulation
  SET: {
    type: "SET", category: "Flag Manipulation",
    description: "Sets the flag to 255 (true/on).",
    params: [{ name: "flagno", type: "flag", description: "Flag" }],
  },
  CLEAR: {
    type: "CLEAR", category: "Flag Manipulation",
    description: "Sets the flag to 0 (false/off).",
    params: [{ name: "flagno", type: "flag", description: "Flag" }],
  },
  LET: {
    type: "LET", category: "Flag Manipulation",
    description: "Sets the flag to an exact value (0-255).",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Value (0-255)" },
    ],
  },
  PLUS: {
    type: "PLUS", category: "Flag Manipulation",
    description: "Adds a value to a flag. Clamps to 255 on overflow.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Amount to add" },
    ],
  },
  MINUS: {
    type: "MINUS", category: "Flag Manipulation",
    description: "Subtracts a value from a flag. Clamps to 0 on underflow.",
    params: [
      { name: "flagno", type: "flag", description: "Flag" },
      { name: "value", type: "value", description: "Amount to subtract" },
    ],
  },
  ADD: {
    type: "ADD", category: "Flag Manipulation",
    description: "Adds Flag 1 into Flag 2. Clamps to 255 on overflow.",
    params: [
      { name: "flagno1", type: "flag", description: "Source flag" },
      { name: "flagno2", type: "flag", description: "Destination flag" },
    ],
  },
  SUB: {
    type: "SUB", category: "Flag Manipulation",
    description: "Subtracts Flag 1 from Flag 2. Clamps to 0 on underflow.",
    params: [
      { name: "flagno1", type: "flag", description: "Source flag" },
      { name: "flagno2", type: "flag", description: "Destination flag" },
    ],
  },
  COPYFF: {
    type: "COPYFF", category: "Flag Manipulation",
    description: "Copies Flag 1 into Flag 2.",
    params: [
      { name: "flagno1", type: "flag", description: "Source flag" },
      { name: "flagno2", type: "flag", description: "Destination flag" },
    ],
  },
  COPYBF: {
    type: "COPYBF", category: "Flag Manipulation",
    description: "Like COPYFF but reversed (destination first) for indirection use.",
    params: [
      { name: "flagno1", type: "flag", description: "Destination flag" },
      { name: "flagno2", type: "flag", description: "Source flag" },
    ],
  },
  RANDOM: {
    type: "RANDOM", category: "Flag Manipulation",
    description: "Sets the flag to a pseudo-random number from 1 to 100.",
    params: [{ name: "flagno", type: "flag", description: "Flag to set" }],
  },
  MOVE: {
    type: "MOVE", category: "Flag Manipulation",
    description: "PSI movement: scans connections for location in the flag using current LS verb. Updates flag to new location if movement is possible.",
    params: [{ name: "flagno", type: "flag", description: "PSI location flag" }],
  },

  // Player
  GOTO: {
    type: "GOTO", category: "Player",
    description: "Moves the player to the given location (sets flag 38).",
    params: [{ name: "locno", type: "location", description: "Destination location" }],
  },
  ABILITY: {
    type: "ABILITY", category: "Player",
    description: "Sets the player's carry limits. Value 1 = max objects (flag 37), Value 2 = max weight (flag 52).",
    params: [
      { name: "maxcarr", type: "value", description: "Max objects to carry (flag 37)" },
      { name: "strength", type: "value", description: "Max carry weight (flag 52)" },
    ],
  },
  WEIGHT: {
    type: "WEIGHT", category: "Player",
    description: "Calculates total weight of all objects carried and worn, stores in a flag.",
    params: [{ name: "flagno", type: "flag", description: "Result flag" }],
  },

  // Screen
  WINDOW: {
    type: "WINDOW", category: "Screen",
    description: "Selects the given window (0-7) as the current output stream.",
    params: [{ name: "winno", type: "window", description: "Window number (0-7)" }],
  },
  WINAT: {
    type: "WINAT", category: "Screen",
    description: "Sets the current window to start at the given line and column.",
    params: [
      { name: "line", type: "value", description: "Line" },
      { name: "column", type: "value", description: "Column" },
    ],
  },
  WINSIZE: {
    type: "WINSIZE", category: "Screen",
    description: "Sets the current window's size in lines and columns.",
    params: [
      { name: "lines", type: "value", description: "Height (lines)" },
      { name: "columns", type: "value", description: "Width (columns)" },
    ],
  },
  CENTRE: {
    type: "CENTRE", category: "Screen",
    description: "Centres the current window horizontally for the current column width.",
    params: [],
  },
  CLS: {
    type: "CLS", category: "Screen",
    description: "Clears the current window.",
    params: [],
  },
  SAVEAT: {
    type: "SAVEAT", category: "Screen",
    description: "Saves the current print position for the active window.",
    params: [],
  },
  BACKAT: {
    type: "BACKAT", category: "Screen",
    description: "Restores the previously saved print position.",
    params: [],
  },
  PAPER: {
    type: "PAPER", category: "Screen",
    description: "Sets the paper (background) colour for the current window (0-15).",
    params: [{ name: "color", type: "color", description: "Colour (0-15)" }],
  },
  INK: {
    type: "INK", category: "Screen",
    description: "Sets the ink (foreground) colour for the current window (0-15).",
    params: [{ name: "color", type: "color", description: "Colour (0-15)" }],
  },
  BORDER: {
    type: "BORDER", category: "Screen",
    description: "Sets the screen border colour (machine-specific, 0-26).",
    params: [{ name: "color", type: "value", description: "Colour (0-26)" }],
  },
  PRINTAT: {
    type: "PRINTAT", category: "Screen",
    description: "Sets the print position to the given line and column within the current window.",
    params: [
      { name: "line", type: "value", description: "Line" },
      { name: "column", type: "value", description: "Column" },
    ],
  },
  TAB: {
    type: "TAB", category: "Screen",
    description: "Sets the print position to the given column on the current line.",
    params: [{ name: "column", type: "value", description: "Column" }],
  },
  MODE: {
    type: "MODE", category: "Screen",
    description: "Sets window operation flags. Add: 1=use upper charset, 2=suppress More prompt.",
    params: [{ name: "mode", type: "option", description: "Mode flags (add: 1=upper charset, 2=no More)" }],
  },

  // Text output
  MESSAGE: {
    type: "MESSAGE", category: "Text Output",
    description: "Prints a game message followed by a newline. Index is 0-based in JSON.",
    params: [{ name: "mesno", type: "message", description: "Message" }],
  },
  MES: {
    type: "MES", category: "Text Output",
    description: "Prints a game message WITHOUT a trailing newline.",
    params: [{ name: "mesno", type: "message", description: "Message" }],
  },
  SYSMESS: {
    type: "SYSMESS", category: "Text Output",
    description: "Prints a system message. Common: 0=dark, 7=can't go that way, 8=can't do that, 15=OK.",
    params: [{ name: "sysno", type: "value", description: "System message number (0-60+)" }],
  },
  DESC: {
    type: "DESC", category: "Text Output",
    description: "Prints the location description text for the given location without a newline.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },
  DESCRIBE: {
    type: "DESCRIBE", category: "Text Output",
    description: "Alias for DESC — prints location description.",
    params: [{ name: "locno", type: "location", description: "Location" }],
  },
  NEWLINE: {
    type: "NEWLINE", category: "Text Output",
    description: "Prints a carriage return / line feed.",
    params: [],
  },
  SPACE: {
    type: "SPACE", category: "Text Output",
    description: "Prints a single space to the current output stream.",
    params: [],
  },
  PRINT: {
    type: "PRINT", category: "Text Output",
    description: "Displays the decimal value of a flag without leading/trailing spaces.",
    params: [{ name: "flagno", type: "flag", description: "Flag to print" }],
  },
  DPRINT: {
    type: "DPRINT", category: "Text Output",
    description: "Displays a two-byte number from flags flagno and flagno+1 (0-65535 range).",
    params: [{ name: "flagno", type: "flag", description: "Flag (LSB, MSB is flagno+1)" }],
  },

  // Object listing
  LISTOBJ: {
    type: "LISTOBJ", category: "Object Listing",
    description: "Lists all objects at current location. Prints 'I can also see:' if any exist.",
    params: [],
  },
  LISTAT: {
    type: "LISTAT", category: "Object Listing",
    description: "Lists objects at a given location. 255=here, 254=carried, 253=worn.",
    params: [{ name: "locno", type: "location", description: "Location (254=carried, 255=here)" }],
  },

  // Input/parser
  PARSE: {
    type: "PARSE", category: "Input/Parser",
    description: "Extracts the next Logical Sentence from the input buffer. 0=main input, 1=quoted speech.",
    params: [{ name: "level", type: "value", description: "Level (0=main input, 1=quoted speech)" }],
  },
  NEWTEXT: {
    type: "NEWTEXT", category: "Input/Parser",
    description: "Discards remaining input phrases on the current input line.",
    params: [],
  },
  SYNONYM: {
    type: "SYNONYM", category: "Input/Parser",
    description: "Substitutes the verb and/or noun in the current Logical Sentence. Use _ to leave unchanged.",
    params: [
      { name: "verb", type: "string", description: "Replacement verb (or _)" },
      { name: "noun", type: "string", description: "Replacement noun (or _)" },
    ],
  },
  DOALL: {
    type: "DOALL", category: "Input/Parser",
    description: "Implements GET ALL / DROP ALL. Iterates over all objects at location. 254=carried, 255=here.",
    params: [{ name: "locno", type: "location", description: "Location (254=carried, 255=here)" }],
  },
  INPUT: {
    type: "INPUT", category: "Input/Parser",
    description: "Sets input stream and options. Option bits: 1=clear window, 2=reprint input, 4=reprint on timeout.",
    params: [
      { name: "stream", type: "window", description: "Input stream (0-7)" },
      { name: "option", type: "option", description: "Options (1=clear, 2=reprint, 4=timeout reprint)" },
    ],
  },
  TIME: {
    type: "TIME", category: "Input/Parser",
    description: "Sets input timeout in seconds. Option: 1=on first char, 2=on More, 4=on ANYKEY. TIME 0 0 cancels.",
    params: [
      { name: "duration", type: "value", description: "Duration (seconds, 0=~5s)" },
      { name: "option", type: "option", description: "Options (1=first char, 2=More, 4=ANYKEY)" },
    ],
  },
  ANYKEY: {
    type: "ANYKEY", category: "Input/Parser",
    description: "Prints 'Press any key to continue' and waits for a keypress.",
    params: [],
  },
  PAUSE: {
    type: "PAUSE", category: "Input/Parser",
    description: "Pauses for value/50 seconds. Value 0 = ~5 seconds.",
    params: [{ name: "decisecs", type: "value", description: "Duration × 1/50 second (0=~5s)" }],
  },
  GETKEY: {
    type: "GETKEY", category: "Input/Parser",
    description: "Waits for a keypress and stores key code in flags Key1/Key2 (flags 60/61).",
    params: [],
  },

  // Control flow
  PROCESS: {
    type: "PROCESS", category: "Control Flow",
    description: "Calls a sub-process table as a subroutine. Returns after DONE/exit.",
    params: [{ name: "procno", type: "value", description: "Process table number (2-254)" }],
  },
  REDO: {
    type: "REDO", category: "Control Flow",
    description: "Restarts the currently executing process table from the beginning.",
    params: [],
  },
  // DOALL_CTRL removed — not a valid ActionType; see DOALL in Input/Parser
  SKIP: {
    type: "SKIP", category: "Control Flow",
    description: "Jumps forward or backward by the given number of entries (-127 to 128).",
    params: [{ name: "count", type: "value", description: "Entry offset (signed, -127 to 128)" }],
  },
  DONE: {
    type: "DONE", category: "Control Flow",
    description: "Stops processing entries and exits to the calling table. Signals that an action was done.",
    params: [],
  },
  NOTDONE: {
    type: "NOTDONE", category: "Control Flow",
    description: "Stops processing and exits, signalling that NO action was done (allows 'I can't' messages).",
    params: [],
  },
  OK: {
    type: "OK", category: "Control Flow",
    description: "Prints system message 15 ('OK') then performs DONE.",
    params: [],
  },
  RESTART: {
    type: "RESTART", category: "Control Flow",
    description: "Cancels all sub-processes and DOALLs, then restarts from Process 0.",
    params: [],
  },
  END: {
    type: "END", category: "Control Flow",
    description: "Prints 'Would you like to play again?' and exits or restarts based on player input.",
    params: [],
  },
  EXIT: {
    type: "EXIT", category: "Control Flow",
    description: "Exits to the OS (value=0) or loads part N (value=N) on autoload machines.",
    params: [{ name: "value", type: "value", description: "0=quit, N=load part N" }],
  },
  QUIT: {
    type: "QUIT", category: "Control Flow",
    description: "Prints 'Are you sure?' and succeeds if the player confirms. Use before END.",
    params: [],
  },
  WAIT: {
    type: "WAIT", category: "Control Flow",
    description: "Wait (alias for PAUSE in some implementations).",
    params: [{ name: "decisecs", type: "value", description: "Duration" }],
  },
  PLAY: {
    type: "PLAY", category: "Control Flow",
    description: "Play action (implementation-specific).",
    params: [],
  },

  // Save/load
  SAVE: {
    type: "SAVE", category: "Save/Load",
    description: "Saves the current game. 0=ask tape/disc, 1=tape only, 2=disc only.",
    params: [{ name: "opt", type: "value", description: "Option (0=ask, 1=tape, 2=disc)" }],
  },
  LOAD: {
    type: "LOAD", category: "Save/Load",
    description: "Loads a saved game. 0=ask tape/disc, 1=tape only, 2=disc only.",
    params: [{ name: "opt", type: "value", description: "Option (0=ask, 1=tape, 2=disc)" }],
  },
  RAMSAVE: {
    type: "RAMSAVE", category: "Save/Load",
    description: "Saves game state into a volatile memory buffer (RAM save, lost on power off).",
    params: [],
  },
  RAMLOAD: {
    type: "RAMLOAD", category: "Save/Load",
    description: "Restores from the RAM save buffer. The flag specifies the last flag to restore (254=all).",
    params: [{ name: "flagno", type: "flag", description: "Last flag to restore (254=all)" }],
  },

  // Sound (Standard DAAD V2)
  SFX: {
    type: "SFX", category: "Sound",
    description: "Writes value1 to register value2 of the sound chip (AY/SID on 8-bit machines).",
    params: [
      { name: "value1", type: "value", description: "Data value" },
      { name: "value2", type: "value", description: "Sound chip register" },
    ],
  },
  BEEP: {
    type: "BEEP", category: "Sound",
    description: "Simple tone: plays a note for the given duration at the given pitch.",
    params: [
      { name: "duration", type: "value", description: "Duration" },
      { name: "pitch", type: "value", description: "Pitch" },
    ],
  },

  // Graphics (Standard DAAD V2)
  PICTURE: {
    type: "PICTURE", category: "Graphics",
    description: "Loads picture N into the display buffer. If no picture exists, skips to next ENTRY. Use 0=[Player] for current location.",
    params: [{ name: "picno", type: "value", description: "Picture number (0=[Player] for current location)" }],
  },
  DISPLAY: {
    type: "DISPLAY", category: "Graphics",
    description: "Renders the buffered picture (value=0) or clears the picture area (value≠0). Use [DarkF] to display only when not dark.",
    params: [{ name: "value", type: "value", description: "0=display picture, other=clear area" }],
  },
  GFX: {
    type: "GFX", category: "Graphics",
    description: "16-bit graphics extension (ST/Amiga/PC). Handles screen switching and palette management.",
    params: [
      { name: "gfxno", type: "value", description: "GFX function" },
      { name: "param", type: "value", description: "Parameter" },
    ],
  },

  // External
  EXTERN: {
    type: "EXTERN", category: "External",
    description: "Calls an external assembly language routine with the given parameter value.",
    params: [{ name: "value", type: "value", description: "Parameter value" }],
  },
  CALL: {
    type: "CALL", category: "External",
    description: "Calls a machine code routine at the given memory address.",
    params: [{ name: "address", type: "value", description: "Memory address" }],
  },
  MOUSE: {
    type: "MOUSE", category: "External",
    description: "Mouse handler (IBM only, experimental hypercard system).",
    params: [],
  },

  // DAAD Ready / Maluva extensions (★)
  XMES: {
    type: "XMES", category: "DAAD Ready ★",
    description: "DAAD Ready: Print message from bank N (without newline).",
    params: [
      { name: "bank", type: "value", description: "Bank number" },
      { name: "mesno", type: "message", description: "Message" },
    ],
  },
  XMESSAGE: {
    type: "XMESSAGE", category: "DAAD Ready ★",
    description: "DAAD Ready: Print message from bank N (with newline).",
    params: [
      { name: "bank", type: "value", description: "Bank number" },
      { name: "mesno", type: "message", description: "Message" },
    ],
  },
  XPICTURE: {
    type: "XPICTURE", category: "DAAD Ready ★",
    description: "DAAD Ready: Extended picture loading.",
    params: [{ name: "picno", type: "value", description: "Picture number" }],
  },
  XSAVE: {
    type: "XSAVE", category: "DAAD Ready ★",
    description: "DAAD Ready: Extended save operation.",
    params: [],
  },
  XLOAD: {
    type: "XLOAD", category: "DAAD Ready ★",
    description: "DAAD Ready: Extended load operation.",
    params: [],
  },
  XPART: {
    type: "XPART", category: "DAAD Ready ★",
    description: "DAAD Ready: Load another game part.",
    params: [],
  },
  XPLAY: {
    type: "XPLAY", category: "DAAD Ready ★",
    description: "DAAD Ready: Play a music track by number.",
    params: [{ name: "trackno", type: "value", description: "Track number" }],
  },
  XBEEP: {
    type: "XBEEP", category: "DAAD Ready ★",
    description: "DAAD Ready: Extended sound/beep action.",
    params: [
      { name: "duration", type: "value", description: "Duration" },
      { name: "pitch", type: "value", description: "Pitch" },
    ],
  },
  XSPLITSCR: {
    type: "XSPLITSCR", category: "DAAD Ready ★",
    description: "DAAD Ready: Split screen at the given line.",
    params: [{ name: "lines", type: "value", description: "Split line" }],
  },
  XUNDONE: {
    type: "XUNDONE", category: "DAAD Ready ★",
    description: "DAAD Ready: Undo last action.",
    params: [],
  },
  XDATA: {
    type: "XDATA", category: "DAAD Ready ★",
    description: "DAAD Ready: Extended data operation.",
    params: [{ name: "value", type: "value", description: "Data value" }],
  },
};

// ── Category grouping helpers ────────────────────────────────────────────────

/** Returns conditions grouped by category — used by RulesPanel dropdown. */
export function getConditionsByCategory(): Record<string, CondactDef[]> {
  const groups: Record<string, CondactDef[]> = {};
  for (const def of Object.values(CONDITIONS)) {
    if (!groups[def.category]) groups[def.category] = [];
    groups[def.category].push(def);
  }
  return groups;
}

/** Returns actions grouped by category — used by RulesPanel dropdown. */
export function getActionsByCategory(): Record<string, CondactDef[]> {
  const groups: Record<string, CondactDef[]> = {};
  for (const def of Object.values(ACTIONS)) {
    if (!groups[def.category]) groups[def.category] = [];
    groups[def.category].push(def);
  }
  return groups;
}