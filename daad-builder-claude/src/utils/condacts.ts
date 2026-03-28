/**
 * DAAD Condact Registry
 *
 * The authoritative list of every condition and action the DAAD V2 compiler
 * understands, plus DAAD Ready / Maluva extensions (marked with daadReady: true).
 *
 * This file drives:
 *  - The Rules panel condition/action type dropdowns
 *  - The dynamic parameter input forms
 *  - Validation (what params are required for each type)
 *  - Codegen documentation / hover help
 *
 * Parameter types:
 *  "flagno"    — a flag number (0-255, user flags 64+)
 *  "locno"     — a location ID
 *  "locno+"    — location ID or special (252=limbo, 253=worn, 254=carried, 255=here)
 *  "objno"     — an object ID
 *  "mesno"     — a game message index (JSON 0-based; codegen adds offset)
 *  "sysno"     — a system message number (0-60+)
 *  "procno"    — a process table number
 *  "value"     — any 0-255 value
 *  "percent"   — 1-99 (for CHANCE)
 *  "word"      — a vocabulary word string
 *  "attribute" — an HASAT/HASNAT attribute number (see SYMBOLS.SCE)
 *  "colour"    — a colour index
 *  "stream"    — window/stream 0-7
 *  "distance"  — a SKIP offset (-127 to 128)
 */

export type ParamKind =
  | "flagno" | "locno" | "locno+" | "objno"
  | "mesno" | "sysno" | "procno"
  | "value" | "percent" | "word" | "attribute"
  | "colour" | "stream" | "distance";

export interface CondactParam {
  name: string;        // param key used in JSON params object
  kind: ParamKind;     // what type of value it expects
  label: string;       // human-readable label for the UI field
  optional?: boolean;  // if true, param can be omitted (defaults to 0 or "_")
}

export type CondactCategory =
  | "Location"
  | "Object Position"
  | "Flags"
  | "Extended LS"
  | "Random"
  | "Control Flow"
  | "Object Manipulation"
  | "Auto Object"
  | "Flag Manipulation"
  | "Player"
  | "Screen"
  | "Text Output"
  | "Object Listing"
  | "Input/Parser"
  | "Save/Load"
  | "Sound"
  | "Graphics"
  | "External"
  | "DAAD Ready";

export interface CondactDef {
  type: string;
  label: string;
  description: string;
  category: CondactCategory;
  params: CondactParam[];
  noParams?: boolean;   // true for zero-param condacts (DONE, AUTOG etc.)
  daadReady?: boolean;  // true for Maluva/DAAD Ready extensions
}

// ── CONDITIONS ──────────────────────────────────────────────────────────────

export const CONDITIONS: CondactDef[] = [
  // Location
  {
    type: "AT", label: "AT", category: "Location",
    description: "Succeeds if the player is at the given location.",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },
  {
    type: "NOTAT", label: "NOTAT", category: "Location",
    description: "Succeeds if the player is NOT at the given location.",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },
  {
    type: "ATGT", label: "ATGT", category: "Location",
    description: "Succeeds if the player's location number is greater than the given value.",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },
  {
    type: "ATLT", label: "ATLT", category: "Location",
    description: "Succeeds if the player's location number is less than the given value.",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },

  // Object position
  {
    type: "PRESENT", label: "PRESENT", category: "Object Position",
    description: "Succeeds if the object is carried, worn, or at the current location.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "ABSENT", label: "ABSENT", category: "Object Position",
    description: "Succeeds if the object is NOT carried, worn, or at the current location.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "WORN", label: "WORN", category: "Object Position",
    description: "Succeeds if the object is being worn by the player.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "NOTWORN", label: "NOTWORN", category: "Object Position",
    description: "Succeeds if the object is NOT being worn.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "CARRIED", label: "CARRIED", category: "Object Position",
    description: "Succeeds if the object is being carried by the player.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "NOTCARR", label: "NOTCARR", category: "Object Position",
    description: "Succeeds if the object is NOT being carried.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "ISAT", label: "ISAT", category: "Object Position",
    description: "Succeeds if the object is at the given location. Use 254=carried, 255=here.",
    params: [
      { name: "objno", kind: "objno", label: "Object" },
      { name: "locno", kind: "locno+", label: "Location" },
    ],
  },
  {
    type: "ISNOTAT", label: "ISNOTAT", category: "Object Position",
    description: "Succeeds if the object is NOT at the given location.",
    params: [
      { name: "objno", kind: "objno", label: "Object" },
      { name: "locno", kind: "locno+", label: "Location" },
    ],
  },

  // Flags
  {
    type: "ZERO", label: "ZERO", category: "Flags",
    description: "Succeeds if the flag is zero.",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },
  {
    type: "NOTZERO", label: "NOTZERO", category: "Flags",
    description: "Succeeds if the flag is not zero.",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },
  {
    type: "EQ", label: "EQ", category: "Flags",
    description: "Succeeds if the flag equals the value.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Value" },
    ],
  },
  {
    type: "NOTEQ", label: "NOTEQ", category: "Flags",
    description: "Succeeds if the flag does NOT equal the value.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Value" },
    ],
  },
  {
    type: "GT", label: "GT", category: "Flags",
    description: "Succeeds if the flag is greater than the value.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Value" },
    ],
  },
  {
    type: "LT", label: "LT", category: "Flags",
    description: "Succeeds if the flag is less than the value.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Value" },
    ],
  },
  {
    type: "SAME", label: "SAME", category: "Flags",
    description: "Succeeds if two flags have the same value.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Flag 1" },
      { name: "flagno2", kind: "flagno", label: "Flag 2" },
    ],
  },
  {
    type: "NOTSAME", label: "NOTSAME", category: "Flags",
    description: "Succeeds if two flags have different values.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Flag 1" },
      { name: "flagno2", kind: "flagno", label: "Flag 2" },
    ],
  },
  {
    type: "BIGGER", label: "BIGGER", category: "Flags",
    description: "Succeeds if Flag 1 is larger than Flag 2.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Flag 1" },
      { name: "flagno2", kind: "flagno", label: "Flag 2" },
    ],
  },
  {
    type: "SMALLER", label: "SMALLER", category: "Flags",
    description: "Succeeds if Flag 1 is smaller than Flag 2.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Flag 1" },
      { name: "flagno2", kind: "flagno", label: "Flag 2" },
    ],
  },

  // Object attributes
  {
    type: "HASAT", label: "HASAT", category: "Object Position",
    description: "Succeeds if the current object has the given attribute set. Common values: 23=WEARABLE, 31=CONTAINER, 55=LISTED, 87=TIMEOUT, 247=GMODE.",
    params: [{ name: "attribute", kind: "attribute", label: "Attribute" }],
  },
  {
    type: "HASNAT", label: "HASNAT", category: "Object Position",
    description: "Succeeds if the current object does NOT have the given attribute set.",
    params: [{ name: "attribute", kind: "attribute", label: "Attribute" }],
  },

  // Extended LS
  {
    type: "ADJECT1", label: "ADJECT1", category: "Extended LS",
    description: "Succeeds if the first noun's adjective in the current Logical Sentence matches the word.",
    params: [{ name: "word", kind: "word", label: "Adjective word" }],
  },
  {
    type: "ADVERB", label: "ADVERB", category: "Extended LS",
    description: "Succeeds if the adverb in the current Logical Sentence matches the word.",
    params: [{ name: "word", kind: "word", label: "Adverb word" }],
  },
  {
    type: "PREP", label: "PREP", category: "Extended LS",
    description: "Succeeds if the preposition in the current Logical Sentence matches the word.",
    params: [{ name: "word", kind: "word", label: "Preposition word" }],
  },
  {
    type: "NOUN2", label: "NOUN2", category: "Extended LS",
    description: "Succeeds if the second noun in the current Logical Sentence matches the word.",
    params: [{ name: "word", kind: "word", label: "Noun word" }],
  },
  {
    type: "ADJECT2", label: "ADJECT2", category: "Extended LS",
    description: "Succeeds if the second noun's adjective in the current Logical Sentence matches the word.",
    params: [{ name: "word", kind: "word", label: "Adjective word" }],
  },

  // Random
  {
    type: "CHANCE", label: "CHANCE", category: "Random",
    description: "Succeeds with the given percentage probability (1-99).",
    params: [{ name: "percent", kind: "percent", label: "Percent (1-99)" }],
  },

  // Control flow booleans
  {
    type: "ISDONE", label: "ISDONE", category: "Control Flow",
    description: "Succeeds if the last sub-process table exited after doing at least one action.",
    params: [], noParams: true,
  },
  {
    type: "ISNDONE", label: "ISNDONE", category: "Control Flow",
    description: "Succeeds if the last sub-process table exited without doing anything.",
    params: [], noParams: true,
  },

  // Input
  {
    type: "INKEY", label: "INKEY", category: "Input/Parser",
    description: "Succeeds if the player is currently pressing a key.",
    params: [], noParams: true,
  },
  {
    type: "QUIT", label: "QUIT", category: "Control Flow",
    description: "Prints 'Are you sure?' and succeeds if the player confirms. Use before END to give the player a chance to cancel.",
    params: [], noParams: true,
  },
];

// ── ACTIONS ─────────────────────────────────────────────────────────────────

export const ACTIONS: CondactDef[] = [
  // Object manipulation
  {
    type: "GET", label: "GET", category: "Object Manipulation",
    description: "Picks up object. Checks weight/carry limits and prints appropriate system messages.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "DROP", label: "DROP", category: "Object Manipulation",
    description: "Drops the object at the current location.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "WEAR", label: "WEAR", category: "Object Manipulation",
    description: "Wears the object (must be marked wearable). Decrements carry count.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "REMOVE", label: "REMOVE", category: "Object Manipulation",
    description: "Removes a worn object back to carried status.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "CREATE", label: "CREATE", category: "Object Manipulation",
    description: "Moves the object from limbo to the current location.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "DESTROY", label: "DESTROY", category: "Object Manipulation",
    description: "Removes the object from the game (moves to limbo/not-created).",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "SWAP", label: "SWAP", category: "Object Manipulation",
    description: "Exchanges the positions of two objects. Flag 1 is not adjusted.",
    params: [
      { name: "objno1", kind: "objno", label: "Object 1" },
      { name: "objno2", kind: "objno", label: "Object 2" },
    ],
  },
  {
    type: "PLACE", label: "PLACE", category: "Object Manipulation",
    description: "Moves the object to the given location. Use 254=carried, 255=here.",
    params: [
      { name: "objno", kind: "objno", label: "Object" },
      { name: "locno", kind: "locno+", label: "Location" },
    ],
  },
  {
    type: "PUTO", label: "PUTO", category: "Object Manipulation",
    description: "Moves the currently referenced object (flag 51) to the given location.",
    params: [{ name: "locno", kind: "locno+", label: "Location" }],
  },
  {
    type: "PUTIN", label: "PUTIN", category: "Object Manipulation",
    description: "Puts Object 1 into container Object 2. Checks carry status and prints messages.",
    params: [
      { name: "objno1", kind: "objno", label: "Object to put" },
      { name: "objno2", kind: "objno", label: "Container object" },
    ],
  },
  {
    type: "TAKEOUT", label: "TAKEOUT", category: "Object Manipulation",
    description: "Takes Object 1 out of container Object 2.",
    params: [
      { name: "objno1", kind: "objno", label: "Object to take" },
      { name: "objno2", kind: "objno", label: "Container object" },
    ],
  },
  {
    type: "DROPALL", label: "DROPALL", category: "Object Manipulation",
    description: "Drops all carried and worn objects at the current location. Sets flag 1 to 0.",
    params: [], noParams: true,
  },
  {
    type: "COPYOO", label: "COPYOO", category: "Object Manipulation",
    description: "Copies the position of Object 1 to Object 2.",
    params: [
      { name: "objno1", kind: "objno", label: "Source object" },
      { name: "objno2", kind: "objno", label: "Destination object" },
    ],
  },
  {
    type: "COPYOF", label: "COPYOF", category: "Object Manipulation",
    description: "Copies the position of an object into a flag.",
    params: [
      { name: "objno", kind: "objno", label: "Object" },
      { name: "flagno", kind: "flagno", label: "Destination flag" },
    ],
  },
  {
    type: "COPYFO", label: "COPYFO", category: "Object Manipulation",
    description: "Sets an object's position to the value in a flag.",
    params: [
      { name: "flagno", kind: "flagno", label: "Source flag" },
      { name: "objno", kind: "objno", label: "Object" },
    ],
  },
  {
    type: "RESET", label: "RESET", category: "Object Manipulation",
    description: "Restores all objects to their starting positions (from the OBJ section).",
    params: [], noParams: true,
  },
  {
    type: "WHATO", label: "WHATO", category: "Object Manipulation",
    description: "Searches for the object matching Noun1 in the LS and sets flag 51 to its number.",
    params: [], noParams: true,
  },
  {
    type: "SETCO", label: "SETCO", category: "Object Manipulation",
    description: "Sets the currently referenced object (flag 51) to the given object number.",
    params: [{ name: "objno", kind: "objno", label: "Object" }],
  },
  {
    type: "WEIGH", label: "WEIGH", category: "Object Manipulation",
    description: "Calculates the true weight of an object (including container contents) and stores it in a flag.",
    params: [
      { name: "objno", kind: "objno", label: "Object" },
      { name: "flagno", kind: "flagno", label: "Result flag" },
    ],
  },

  // Auto object actions (use Noun1 from current LS)
  {
    type: "AUTOG", label: "AUTOG", category: "Auto Object",
    description: "Automatically GET the object matching Noun1 in the Logical Sentence.",
    params: [], noParams: true,
  },
  {
    type: "AUTOD", label: "AUTOD", category: "Auto Object",
    description: "Automatically DROP the object matching Noun1 in the Logical Sentence.",
    params: [], noParams: true,
  },
  {
    type: "AUTOW", label: "AUTOW", category: "Auto Object",
    description: "Automatically WEAR the object matching Noun1 in the Logical Sentence.",
    params: [], noParams: true,
  },
  {
    type: "AUTOR", label: "AUTOR", category: "Auto Object",
    description: "Automatically REMOVE the object matching Noun1 in the Logical Sentence.",
    params: [], noParams: true,
  },
  {
    type: "AUTOP", label: "AUTOP", category: "Auto Object",
    description: "Automatically PUTIN the object matching Noun1 into the given container.",
    params: [{ name: "locno", kind: "locno", label: "Container location" }],
  },
  {
    type: "AUTOT", label: "AUTOT", category: "Auto Object",
    description: "Automatically TAKEOUT the object matching Noun1 from the given container.",
    params: [{ name: "locno", kind: "locno", label: "Container location" }],
  },

  // Flag manipulation
  {
    type: "SET", label: "SET", category: "Flag Manipulation",
    description: "Sets the flag to 255 (true).",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },
  {
    type: "CLEAR", label: "CLEAR", category: "Flag Manipulation",
    description: "Sets the flag to 0 (false).",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },
  {
    type: "LET", label: "LET", category: "Flag Manipulation",
    description: "Sets the flag to an exact value (0-255).",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Value" },
    ],
  },
  {
    type: "PLUS", label: "PLUS", category: "Flag Manipulation",
    description: "Adds a value to a flag. Clamps to 255 on overflow.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Amount" },
    ],
  },
  {
    type: "MINUS", label: "MINUS", category: "Flag Manipulation",
    description: "Subtracts a value from a flag. Clamps to 0 on underflow.",
    params: [
      { name: "flagno", kind: "flagno", label: "Flag" },
      { name: "value", kind: "value", label: "Amount" },
    ],
  },
  {
    type: "ADD", label: "ADD", category: "Flag Manipulation",
    description: "Adds Flag 1 into Flag 2. Clamps to 255 on overflow.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Source flag" },
      { name: "flagno2", kind: "flagno", label: "Destination flag" },
    ],
  },
  {
    type: "SUB", label: "SUB", category: "Flag Manipulation",
    description: "Subtracts Flag 1 from Flag 2. Clamps to 0 on underflow.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Source flag" },
      { name: "flagno2", kind: "flagno", label: "Destination flag" },
    ],
  },
  {
    type: "COPYFF", label: "COPYFF", category: "Flag Manipulation",
    description: "Copies Flag 1 into Flag 2.",
    params: [
      { name: "flagno1", kind: "flagno", label: "Source flag" },
      { name: "flagno2", kind: "flagno", label: "Destination flag" },
    ],
  },
  {
    type: "COPYBF", label: "COPYBF", category: "Flag Manipulation",
    description: "Like COPYFF but source and destination are reversed (for indirection use).",
    params: [
      { name: "flagno1", kind: "flagno", label: "Destination flag" },
      { name: "flagno2", kind: "flagno", label: "Source flag" },
    ],
  },
  {
    type: "RANDOM", label: "RANDOM", category: "Flag Manipulation",
    description: "Sets the flag to a pseudo-random number from 1 to 100.",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },

  // Player / movement
  {
    type: "GOTO", label: "GOTO", category: "Player",
    description: "Moves the player to the given location (sets flag 38).",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },
  {
    type: "ABILITY", label: "ABILITY", category: "Player",
    description: "Sets the player's carry limits. MaxCarr = max number of objects; Strength = max total weight.",
    params: [
      { name: "maxcarr", kind: "value", label: "Max objects (flag 37)" },
      { name: "strength", kind: "value", label: "Max weight (flag 52)" },
    ],
  },
  {
    type: "WEIGHT", label: "WEIGHT", category: "Player",
    description: "Calculates the total weight of all objects carried and worn, stores in a flag.",
    params: [{ name: "flagno", kind: "flagno", label: "Result flag" }],
  },
  {
    type: "MOVE", label: "MOVE", category: "Player",
    description: "PSI movement: scans the connections for the location in the flag using the current LS verb. Updates the flag to the new location if movement is possible.",
    params: [{ name: "flagno", kind: "flagno", label: "PSI location flag" }],
  },

  // Screen / windows
  {
    type: "WINDOW", label: "WINDOW", category: "Screen",
    description: "Selects the given window (0-7) as the current output stream.",
    params: [{ name: "winno", kind: "stream", label: "Window (0-7)" }],
  },
  {
    type: "WINAT", label: "WINAT", category: "Screen",
    description: "Sets the current window to start at the given line and column.",
    params: [
      { name: "line", kind: "value", label: "Line" },
      { name: "column", kind: "value", label: "Column" },
    ],
  },
  {
    type: "WINSIZE", label: "WINSIZE", category: "Screen",
    description: "Sets the current window's size in lines and columns.",
    params: [
      { name: "lines", kind: "value", label: "Height (lines)" },
      { name: "columns", kind: "value", label: "Width (columns)" },
    ],
  },
  {
    type: "CENTRE", label: "CENTRE", category: "Screen",
    description: "Centres the current window horizontally for the current column width.",
    params: [], noParams: true,
  },
  {
    type: "CLS", label: "CLS", category: "Screen",
    description: "Clears the current window.",
    params: [], noParams: true,
  },
  {
    type: "SAVEAT", label: "SAVEAT", category: "Screen",
    description: "Saves the current print position for the active window.",
    params: [], noParams: true,
  },
  {
    type: "BACKAT", label: "BACKAT", category: "Screen",
    description: "Restores the previously saved print position.",
    params: [], noParams: true,
  },
  {
    type: "PAPER", label: "PAPER", category: "Screen",
    description: "Sets the paper (background) colour for the current window.",
    params: [{ name: "color", kind: "colour", label: "Colour" }],
  },
  {
    type: "INK", label: "INK", category: "Screen",
    description: "Sets the ink (foreground) colour for the current window.",
    params: [{ name: "color", kind: "colour", label: "Colour" }],
  },
  {
    type: "BORDER", label: "BORDER", category: "Screen",
    description: "Sets the screen border colour (machine-specific, 0-26).",
    params: [{ name: "color", kind: "colour", label: "Colour" }],
  },
  {
    type: "PRINTAT", label: "PRINTAT", category: "Screen",
    description: "Sets the print position to the given line and column within the current window.",
    params: [
      { name: "line", kind: "value", label: "Line" },
      { name: "column", kind: "value", label: "Column" },
    ],
  },
  {
    type: "TAB", label: "TAB", category: "Screen",
    description: "Sets the print position to the given column on the current line.",
    params: [{ name: "column", kind: "value", label: "Column" }],
  },
  {
    type: "MODE", label: "MODE", category: "Screen",
    description: "Sets window operation flags. Add: 1=use upper charset, 2=suppress More prompt.",
    params: [{ name: "mode", kind: "value", label: "Mode flags" }],
  },

  // Text output
  {
    type: "MESSAGE", label: "MESSAGE", category: "Text Output",
    description: "Prints a game message followed by a newline. Index is 0-based in JSON.",
    params: [{ name: "mesno", kind: "mesno", label: "Message index" }],
  },
  {
    type: "MES", label: "MES", category: "Text Output",
    description: "Prints a game message WITHOUT a trailing newline.",
    params: [{ name: "mesno", kind: "mesno", label: "Message index" }],
  },
  {
    type: "SYSMESS", label: "SYSMESS", category: "Text Output",
    description: "Prints a system message (0-60+, e.g. 0=You can't go that way, 8=I can't do that).",
    params: [{ name: "sysno", kind: "sysno", label: "System message number" }],
  },
  {
    type: "DESC", label: "DESC", category: "Text Output",
    description: "Prints the location description text for the given location without a newline.",
    params: [{ name: "locno", kind: "locno", label: "Location" }],
  },
  {
    type: "NEWLINE", label: "NEWLINE", category: "Text Output",
    description: "Prints a carriage return / line feed.",
    params: [], noParams: true,
  },
  {
    type: "SPACE", label: "SPACE", category: "Text Output",
    description: "Prints a single space to the current output stream.",
    params: [], noParams: true,
  },
  {
    type: "PRINT", label: "PRINT", category: "Text Output",
    description: "Displays the decimal value of a flag without leading/trailing spaces.",
    params: [{ name: "flagno", kind: "flagno", label: "Flag" }],
  },
  {
    type: "DPRINT", label: "DPRINT", category: "Text Output",
    description: "Displays a two-byte number from flags flagno and flagno+1 (0-65535 range).",
    params: [{ name: "flagno", kind: "flagno", label: "Flag (LSB)" }],
  },

  // Object listing
  {
    type: "LISTOBJ", label: "LISTOBJ", category: "Object Listing",
    description: "Lists all objects present at the current location. Prints 'I can also see:' if any exist.",
    params: [], noParams: true,
  },
  {
    type: "LISTAT", label: "LISTAT", category: "Object Listing",
    description: "Lists objects at a given location. Use 255=here, 254=carried, 253=worn.",
    params: [{ name: "locno", kind: "locno+", label: "Location" }],
  },

  // Input / parser
  {
    type: "PARSE", label: "PARSE", category: "Input/Parser",
    description: "Extracts the next Logical Sentence from the input buffer. 0=main input, 1=quoted speech.",
    params: [{ name: "level", kind: "value", label: "Level (0 or 1)" }],
  },
  {
    type: "NEWTEXT", label: "NEWTEXT", category: "Input/Parser",
    description: "Discards remaining input phrases on the current input line.",
    params: [], noParams: true,
  },
  {
    type: "SYNONYM", label: "SYNONYM", category: "Input/Parser",
    description: "Substitutes the verb and/or noun in the current Logical Sentence. Use _ to leave unchanged.",
    params: [
      { name: "verb", kind: "word", label: "Verb (or _)" },
      { name: "noun", kind: "word", label: "Noun (or _)" },
    ],
  },
  {
    type: "DOALL", label: "DOALL", category: "Input/Parser",
    description: "Implements GET ALL / DROP ALL etc. Iterates over all objects at the location. Use 255=here, 254=carried.",
    params: [{ name: "locno", kind: "locno+", label: "Location" }],
  },
  {
    type: "INPUT", label: "INPUT", category: "Input/Parser",
    description: "Sets input to come from a given stream. Option bits: 1=clear window, 2=reprint input, 4=reprint on timeout.",
    params: [
      { name: "stream", kind: "stream", label: "Input stream (0-7)" },
      { name: "option", kind: "value", label: "Option flags" },
    ],
  },
  {
    type: "TIME", label: "TIME", category: "Input/Parser",
    description: "Sets input timeout. duration=seconds; option bits: 1=on first char, 2=on More, 4=on ANYKEY. Use TIME 0 0 to cancel.",
    params: [
      { name: "duration", kind: "value", label: "Duration (seconds)" },
      { name: "option", kind: "value", label: "Option flags" },
    ],
  },
  {
    type: "ANYKEY", label: "ANYKEY", category: "Input/Parser",
    description: "Prints 'Press any key to continue' and waits for a keypress.",
    params: [], noParams: true,
  },
  {
    type: "PAUSE", label: "PAUSE", category: "Input/Parser",
    description: "Pauses for value/50 seconds (value=0 means ~5 seconds).",
    params: [{ name: "decisecs", kind: "value", label: "Duration (×1/50 sec)" }],
  },

  // Control flow
  {
    type: "PROCESS", label: "PROCESS", category: "Control Flow",
    description: "Calls a sub-process table as a subroutine. Returns after DONE/exit.",
    params: [{ name: "procno", kind: "procno", label: "Process table" }],
  },
  {
    type: "REDO", label: "REDO", category: "Control Flow",
    description: "Restarts the currently executing process table from the beginning.",
    params: [], noParams: true,
  },
  {
    type: "SKIP", label: "SKIP", category: "Control Flow",
    description: "Jumps forward or backward by the given number of entries (-127 to 128).",
    params: [{ name: "count", kind: "distance", label: "Entry offset" }],
  },
  {
    type: "DONE", label: "DONE", category: "Control Flow",
    description: "Stops processing entries and exits to the calling table. Flags that an action was done.",
    params: [], noParams: true,
  },
  {
    type: "NOTDONE", label: "NOTDONE", category: "Control Flow",
    description: "Stops processing and exits, but flags that NO action was done.",
    params: [], noParams: true,
  },
  {
    type: "OK", label: "OK", category: "Control Flow",
    description: "Prints 'OK' (system message 15) then performs DONE.",
    params: [], noParams: true,
  },
  {
    type: "RESTART", label: "RESTART", category: "Control Flow",
    description: "Cancels all sub-processes and DOALLs, then restarts from Process 0.",
    params: [], noParams: true,
  },
  {
    type: "END", label: "END", category: "Control Flow",
    description: "Prints 'Would you like to play again?' and exits or restarts based on player input.",
    params: [], noParams: true,
  },
  {
    type: "EXIT", label: "EXIT", category: "Control Flow",
    description: "Exits to the OS (value=0) or loads part N (value=N). PCW supports multi-part autoloading.",
    params: [{ name: "value", kind: "value", label: "Value (0=quit, N=load part N)" }],
  },

  // Save / load
  {
    type: "SAVE", label: "SAVE", category: "Save/Load",
    description: "Saves the current game. Option: 0=ask tape/disc, 1=tape only, 2=disc only.",
    params: [{ name: "opt", kind: "value", label: "Option (0/1/2)" }],
  },
  {
    type: "LOAD", label: "LOAD", category: "Save/Load",
    description: "Loads a saved game. Option: 0=ask tape/disc, 1=tape only, 2=disc only.",
    params: [{ name: "opt", kind: "value", label: "Option (0/1/2)" }],
  },
  {
    type: "RAMSAVE", label: "RAMSAVE", category: "Save/Load",
    description: "Saves game state into a volatile memory buffer (RAM save).",
    params: [], noParams: true,
  },
  {
    type: "RAMLOAD", label: "RAMLOAD", category: "Save/Load",
    description: "Restores from the RAM save buffer. The flag number specifies the last flag to restore (use 254 for all).",
    params: [{ name: "flagno", kind: "flagno", label: "Last flag to restore" }],
  },

  // Sound (Standard DAAD V2)
  {
    type: "SFX", label: "SFX", category: "Sound",
    description: "Writes value1 to register value2 of the sound chip (8-bit machines: AY/SID). Default action writes directly to chip registers.",
    params: [
      { name: "value1", kind: "value", label: "Data value" },
      { name: "value2", kind: "value", label: "Register" },
    ],
  },
  {
    type: "BEEP", label: "BEEP", category: "Sound",
    description: "Simple tone: plays a note for the given duration at the given pitch.",
    params: [
      { name: "duration", kind: "value", label: "Duration" },
      { name: "pitch", kind: "value", label: "Pitch" },
    ],
  },

  // Graphics (Standard DAAD V2)
  {
    type: "PICTURE", label: "PICTURE", category: "Graphics",
    description: "Loads picture N into the display buffer. If no picture exists for N, the next ENTRY (not condact) is skipped to. Use PICTURE [Player] to load the current location's picture.",
    params: [{ name: "picno", kind: "value", label: "Picture number" }],
  },
  {
    type: "DISPLAY", label: "DISPLAY", category: "Graphics",
    description: "If value=0: renders the buffered picture. If value≠0: clears the picture area. Use DISPLAY [DarkF] to show picture only when not dark.",
    params: [{ name: "value", kind: "value", label: "Value (0=display, other=clear)" }],
  },
  {
    type: "GFX", label: "GFX", category: "Graphics",
    description: "16-bit graphics extension (ST/Amiga/PC). Handles screen switching and palette management. Behaviour depends on target platform.",
    params: [
      { name: "gfxno", kind: "value", label: "GFX function" },
      { name: "param", kind: "value", label: "Parameter" },
    ],
  },

  // External
  {
    type: "EXTERN", label: "EXTERN", category: "External",
    description: "Calls an external assembly routine with the given parameter value.",
    params: [{ name: "value", kind: "value", label: "Parameter" }],
  },
  {
    type: "CALL", label: "CALL", category: "External",
    description: "Calls a machine code routine at the given memory address.",
    params: [{ name: "address", kind: "value", label: "Address" }],
  },
  {
    type: "MOUSE", label: "MOUSE", category: "External",
    description: "Mouse handler (IBM only, experimental). Part of the hypercard system.",
    params: [], noParams: true,
  },

  // DAAD Ready / Maluva extensions
  {
    type: "XMES", label: "XMES", category: "DAAD Ready",
    description: "DAAD Ready: Print message from bank N.",
    params: [
      { name: "bank", kind: "value", label: "Bank" },
      { name: "mesno", kind: "mesno", label: "Message" },
    ],
    daadReady: true,
  },
  {
    type: "XMESSAGE", label: "XMESSAGE", category: "DAAD Ready",
    description: "DAAD Ready: Print message from bank N with newline.",
    params: [
      { name: "bank", kind: "value", label: "Bank" },
      { name: "mesno", kind: "mesno", label: "Message" },
    ],
    daadReady: true,
  },
  {
    type: "XPLAY", label: "XPLAY", category: "DAAD Ready",
    description: "DAAD Ready: Play a music track by number.",
    params: [{ name: "trackno", kind: "value", label: "Track number" }],
    daadReady: true,
  },
  {
    type: "XBEEP", label: "XBEEP", category: "DAAD Ready",
    description: "DAAD Ready: Extended sound/beep action.",
    params: [
      { name: "duration", kind: "value", label: "Duration" },
      { name: "pitch", kind: "value", label: "Pitch" },
    ],
    daadReady: true,
  },
  {
    type: "XSPLITSCR", label: "XSPLITSCR", category: "DAAD Ready",
    description: "DAAD Ready: Split screen at the given line.",
    params: [{ name: "lines", kind: "value", label: "Split line" }],
    daadReady: true,
  },
  {
    type: "XSAVE", label: "XSAVE", category: "DAAD Ready",
    description: "DAAD Ready: Extended save.",
    params: [], noParams: true, daadReady: true,
  },
  {
    type: "XLOAD", label: "XLOAD", category: "DAAD Ready",
    description: "DAAD Ready: Extended load.",
    params: [], noParams: true, daadReady: true,
  },
  {
    type: "XPART", label: "XPART", category: "DAAD Ready",
    description: "DAAD Ready: Load another game part.",
    params: [], noParams: true, daadReady: true,
  },
  {
    type: "XUNDONE", label: "XUNDONE", category: "DAAD Ready",
    description: "DAAD Ready: Undo last action.",
    params: [], noParams: true, daadReady: true,
  },
];

// ── Lookup helpers ───────────────────────────────────────────────────────────

export const CONDITION_MAP = new Map<string, CondactDef>(
  CONDITIONS.map(c => [c.type, c])
);

export const ACTION_MAP = new Map<string, CondactDef>(
  ACTIONS.map(a => [a.type, a])
);

/** All unique categories for CONDITIONS */
export const CONDITION_CATEGORIES: CondactCategory[] = [
  ...new Set(CONDITIONS.map(c => c.category)),
];

/** All unique categories for ACTIONS */
export const ACTION_CATEGORIES: CondactCategory[] = [
  ...new Set(ACTIONS.map(a => a.category)),
];

/** Returns the condact definition for a condition type, or undefined */
export function getConditionDef(type: string): CondactDef | undefined {
  return CONDITION_MAP.get(type);
}

/** Returns the condact definition for an action type, or undefined */
export function getActionDef(type: string): CondactDef | undefined {
  return ACTION_MAP.get(type);
}

/** Default empty params object for a condact */
export function defaultParams(def: CondactDef): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  for (const param of def.params) {
    p[param.name] = param.kind === "word" ? "_" : 0;
  }
  return p;
}