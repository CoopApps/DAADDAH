import { ConditionType, ActionType } from "../types/daad";

export type ParamType = "object" | "location" | "flag" | "message" | "verb" | "noun" | "adjective" | "number" | "text";

export interface CondactParamDefinition {
  name: string;
  type: ParamType;
  description: string;
  optional?: boolean;
}

// Condition parameter definitions
export const CONDITION_PARAMS: Record<ConditionType, CondactParamDefinition[]> = {
  // Player Location OR Verb/Noun Matching
  AT: [
    { name: "locno", type: "location", description: "Location ID", optional: true },
    { name: "verb", type: "verb", description: "Verb ID (255 = any)", optional: true },
    { name: "noun", type: "noun", description: "Noun ID (255 = any)", optional: true },
  ],
  NOTAT: [{ name: "locno", type: "location", description: "Location ID" }],
  ATGT: [{ name: "locno", type: "location", description: "Location ID" }],
  ATLT: [{ name: "locno", type: "location", description: "Location ID" }],

  // Object Location
  PRESENT: [{ name: "objno", type: "object", description: "Object ID" }],
  ABSENT: [{ name: "objno", type: "object", description: "Object ID" }],
  WORN: [{ name: "objno", type: "object", description: "Object ID" }],
  NOTWORN: [{ name: "objno", type: "object", description: "Object ID" }],
  CARRIED: [{ name: "objno", type: "object", description: "Object ID" }],
  NOTCARR: [{ name: "objno", type: "object", description: "Object ID" }],
  ISAT: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "locno", type: "location", description: "Location ID" },
  ],
  ISNOTAT: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "locno", type: "location", description: "Location ID" },
  ],

  // Flag Comparison
  ZERO: [{ name: "flagno", type: "flag", description: "Flag ID" }],
  NOTZERO: [{ name: "flagno", type: "flag", description: "Flag ID" }],
  EQ: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to compare" },
  ],
  NOTEQ: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to compare" },
  ],
  GT: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to compare" },
  ],
  LT: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to compare" },
  ],
  SAME: [
    { name: "flagno1", type: "flag", description: "First flag ID" },
    { name: "flagno2", type: "flag", description: "Second flag ID" },
  ],
  NOTSAME: [
    { name: "flagno1", type: "flag", description: "First flag ID" },
    { name: "flagno2", type: "flag", description: "Second flag ID" },
  ],
  BIGGER: [
    { name: "flagno1", type: "flag", description: "First flag ID" },
    { name: "flagno2", type: "flag", description: "Second flag ID" },
  ],
  SMALLER: [
    { name: "flagno1", type: "flag", description: "First flag ID" },
    { name: "flagno2", type: "flag", description: "Second flag ID" },
  ],

  // Extended Logical Sentence
  ADJECT1: [{ name: "adjid", type: "adjective", description: "Adjective ID" }],
  ADVERB: [{ name: "advid", type: "number", description: "Adverb ID" }],
  PREP: [{ name: "prepid", type: "number", description: "Preposition ID" }],
  NOUN2: [{ name: "nounid", type: "noun", description: "Second noun ID" }],
  ADJECT2: [{ name: "adjid", type: "adjective", description: "Second adjective ID" }],

  // Random/Probability
  CHANCE: [{ name: "percentage", type: "number", description: "Probability (0-100)" }],

  // Subprocess Status
  ISDONE: [{ name: "procno", type: "number", description: "Process ID (0-3)" }],
  ISNDONE: [{ name: "procno", type: "number", description: "Process ID (0-3)" }],

  // Object Attributes
  HASAT: [{ name: "objno", type: "object", description: "Object ID" }],
  HASNAT: [{ name: "objno", type: "object", description: "Object ID" }],

  // Player Interaction
  INKEY: [{ name: "keycode", type: "number", description: "ASCII key code" }],

  // Quit confirmation
  QUIT: [],
};

// Action parameter definitions
export const ACTION_PARAMS: Record<ActionType, CondactParamDefinition[]> = {
  // Object Manipulation
  GET: [{ name: "objno", type: "object", description: "Object ID" }],
  DROP: [{ name: "objno", type: "object", description: "Object ID" }],
  WEAR: [{ name: "objno", type: "object", description: "Object ID" }],
  REMOVE: [{ name: "objno", type: "object", description: "Object ID" }],
  CREATE: [{ name: "objno", type: "object", description: "Object ID" }],
  DESTROY: [{ name: "objno", type: "object", description: "Object ID" }],
  SWAP: [
    { name: "objno1", type: "object", description: "First object ID" },
    { name: "objno2", type: "object", description: "Second object ID" },
  ],
  PLACE: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "locno", type: "location", description: "Location ID" },
  ],
  PUTO: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "locno", type: "location", description: "Location ID" },
  ],
  PUTIN: [
    { name: "objno1", type: "object", description: "Object to put" },
    { name: "objno2", type: "object", description: "Container object" },
  ],
  TAKEOUT: [
    { name: "objno1", type: "object", description: "Object to take" },
    { name: "objno2", type: "object", description: "Container object" },
  ],
  DROPALL: [],
  COPYOO: [
    { name: "objno1", type: "object", description: "Source object" },
    { name: "objno2", type: "object", description: "Destination object" },
  ],
  RESET: [],

  // Automatic Object Actions
  AUTOG: [{ name: "objno", type: "object", description: "Object ID" }],
  AUTOD: [{ name: "objno", type: "object", description: "Object ID" }],
  AUTOW: [{ name: "objno", type: "object", description: "Object ID" }],
  AUTOR: [{ name: "objno", type: "object", description: "Object ID" }],
  AUTOP: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "locno", type: "location", description: "Location ID" },
  ],
  AUTOT: [
    { name: "objno1", type: "object", description: "Object to take" },
    { name: "objno2", type: "object", description: "Container object" },
  ],

  // Flag Manipulation
  SET: [{ name: "flagno", type: "flag", description: "Flag ID" }],
  CLEAR: [{ name: "flagno", type: "flag", description: "Flag ID" }],
  LET: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "New value" },
  ],
  PLUS: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to add" },
  ],
  MINUS: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Value to subtract" },
  ],
  ADD: [
    { name: "flagno1", type: "flag", description: "Destination flag" },
    { name: "flagno2", type: "flag", description: "Source flag" },
  ],
  SUB: [
    { name: "flagno1", type: "flag", description: "Destination flag" },
    { name: "flagno2", type: "flag", description: "Source flag" },
  ],
  COPYFF: [
    { name: "flagno1", type: "flag", description: "Destination flag" },
    { name: "flagno2", type: "flag", description: "Source flag" },
  ],
  COPYBF: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "value", type: "number", description: "Byte value" },
  ],
  RANDOM: [{ name: "flagno", type: "flag", description: "Flag to store result" }],
  MOVE: [{ name: "locno", type: "location", description: "Location ID" }],

  // Object/Flag Exchange
  COPYOF: [
    { name: "objno", type: "object", description: "Object ID" },
    { name: "flagno", type: "flag", description: "Flag ID" },
  ],
  COPYFO: [
    { name: "flagno", type: "flag", description: "Flag ID" },
    { name: "objno", type: "object", description: "Object ID" },
  ],
  WHATO: [],
  SETCO: [{ name: "objno", type: "object", description: "Object ID" }],
  WEIGH: [{ name: "objno", type: "object", description: "Object ID" }],
  WEIGHT: [{ name: "flagno", type: "flag", description: "Flag to store weight" }],
  ABILITY: [{ name: "flagno", type: "flag", description: "Flag to store carrying ability" }],

  // Player Movement
  GOTO: [{ name: "locno", type: "location", description: "Location ID" }],

  // Screen/Window Management
  WINDOW: [{ name: "window", type: "number", description: "Window number" }],
  WINAT: [
    { name: "line", type: "number", description: "Line number" },
    { name: "column", type: "number", description: "Column number" },
  ],
  WINSIZE: [
    { name: "lines", type: "number", description: "Number of lines" },
    { name: "columns", type: "number", description: "Number of columns" },
  ],
  CENTRE: [{ name: "line", type: "number", description: "Line number" }],
  CLS: [],
  SAVEAT: [],
  BACKAT: [],
  PAPER: [{ name: "color", type: "number", description: "Color code" }],
  INK: [{ name: "color", type: "number", description: "Color code" }],
  BORDER: [{ name: "color", type: "number", description: "Color code" }],
  PRINTAT: [
    { name: "line", type: "number", description: "Line number" },
    { name: "column", type: "number", description: "Column number" },
  ],
  TAB: [{ name: "column", type: "number", description: "Column number" }],
  MODE: [{ name: "mode", type: "number", description: "Graphics mode" }],

  // Text Output
  MES: [{ name: "mesno", type: "message", description: "Message ID" }],
  MESSAGE: [{ name: "mesno", type: "message", description: "Message ID" }],
  SYSMESS: [{ name: "sysmes", type: "number", description: "System message ID" }],
  DESC: [],
  SPACE: [],
  NEWLINE: [],
  PRINT: [{ name: "flagno", type: "flag", description: "Flag containing value to print" }],
  DPRINT: [{ name: "flagno", type: "flag", description: "Flag containing value to print (decimal)" }],
  LISTOBJ: [],
  LISTAT: [{ name: "locno", type: "location", description: "Location ID" }],

  // Game State (Save/Load)
  SAVE: [],
  LOAD: [],
  RAMSAVE: [],
  RAMLOAD: [],

  // User Input Control
  INPUT: [],
  TIME: [{ name: "seconds", type: "number", description: "Time in seconds" }],
  ANYKEY: [],
  PAUSE: [{ name: "time", type: "number", description: "Time in 1/50th seconds" }],
  PARSE: [],
  NEWTEXT: [],
  SYNONYM: [
    { name: "word1", type: "number", description: "First word ID" },
    { name: "word2", type: "number", description: "Second word ID" },
  ],
  GETKEY: [],

  // Control Flow
  PROCESS: [{ name: "procno", type: "number", description: "Process ID (0-3)" }],
  REDO: [],
  DOALL: [{ name: "locno", type: "location", description: "Location ID" }],
  SKIP: [{ name: "count", type: "number", description: "Number of actions to skip" }],
  RESTART: [],
  END: [],
  EXIT: [],
  DONE: [],
  NOTDONE: [],
  OK: [],
  QUIT: [],
  CALL: [{ name: "address", type: "number", description: "Machine code address" }],

  // Graphics/Multimedia
  PICTURE: [{ name: "picno", type: "number", description: "Picture number" }],
  DISPLAY: [{ name: "picno", type: "number", description: "Picture number" }],
  SFX: [{ name: "sfxno", type: "number", description: "Sound effect number" }],
  GFX: [
    { name: "command", type: "number", description: "Graphics command" },
    { name: "param", type: "number", description: "Parameter", optional: true },
  ],
  WAIT: [{ name: "time", type: "number", description: "Time in 1/50th seconds" }],

  // V3-Specific Extensions
  EXTERN: [{ name: "funcno", type: "number", description: "External function number" }],

  // Extended/Maluva Condacts
  XMES: [{ name: "mesno", type: "message", description: "Extended message ID" }],
  XMESSAGE: [{ name: "mesno", type: "message", description: "Extended message ID" }],
  XPICTURE: [{ name: "picno", type: "number", description: "Picture number (loaded from disk)" }],
  XSAVE: [{ name: "slot", type: "number", description: "Save slot number (0-255, disk-based save)" }],
  XLOAD: [{ name: "slot", type: "number", description: "Save slot number (0-255, disk-based load)" }],
  XPART: [{ name: "partno", type: "number", description: "Game part number (for multi-part adventures)" }],
  XPLAY: [{ name: "musicno", type: "number", description: "Music track number" }],
  XBEEP: [
    { name: "duration", type: "number", description: "Duration" },
    { name: "pitch", type: "number", description: "Pitch" },
  ],
  XSPLITSCR: [],
  XUNDONE: [],
  XDATA: [{ name: "datano", type: "number", description: "Data ID" }],
  BEEP: [
    { name: "duration", type: "number", description: "Duration" },
    { name: "pitch", type: "number", description: "Pitch" },
  ],
  MOUSE: [],
  DESCRIBE: [{ name: "objno", type: "object", description: "Object ID to describe" }],
  PLAY: [{ name: "musicno", type: "number", description: "Music track number" }],
};

export function getConditionParams(conditionType: ConditionType): CondactParamDefinition[] {
  return CONDITION_PARAMS[conditionType] || [];
}

export function getActionParams(actionType: ActionType): CondactParamDefinition[] {
  return ACTION_PARAMS[actionType] || [];
}
