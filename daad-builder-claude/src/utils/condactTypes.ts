/**
 * Valid DAAD condition and action types for runtime validation
 */

export const VALID_CONDITION_TYPES = [
  // Player Location
  "AT", "NOTAT", "ATGT", "ATLT",
  // Object Location
  "PRESENT", "ABSENT", "WORN", "NOTWORN", "CARRIED", "NOTCARR", "ISAT", "ISNOTAT",
  // Flag Comparison
  "ZERO", "NOTZERO", "EQ", "NOTEQ", "GT", "LT", "SAME", "NOTSAME", "BIGGER", "SMALLER",
  // Extended Logical Sentence
  "ADJECT1", "ADVERB", "PREP", "NOUN2", "ADJECT2",
  // Random/Probability
  "CHANCE",
  // Subprocess Status
  "ISDONE", "ISNDONE",
  // Object Attributes
  "HASAT", "HASNAT",
  // Player Interaction
  "INKEY"
] as const;

export const VALID_ACTION_TYPES = [
  // Object Manipulation
  "GET", "DROP", "WEAR", "REMOVE", "CREATE", "DESTROY", "SWAP", "PLACE", "PUTO",
  "PUTIN", "TAKEOUT", "DROPALL", "COPYOO", "RESET",
  // Automatic Object Actions
  "AUTOG", "AUTOD", "AUTOW", "AUTOR", "AUTOP", "AUTOT",
  // Flag Manipulation
  "SET", "CLEAR", "LET", "PLUS", "MINUS", "ADD", "SUB", "COPYFF", "COPYBF", "RANDOM", "MOVE",
  // Object/Flag Exchange
  "COPYOF", "COPYFO", "WHATO", "SETCO", "WEIGH", "WEIGHT", "ABILITY",
  // Player Movement
  "GOTO",
  // Screen/Window Management
  "WINDOW", "WINAT", "WINSIZE", "CENTRE", "CLS", "SAVEAT", "BACKAT",
  "PAPER", "INK", "BORDER", "PRINTAT", "TAB", "MODE",
  // Text Output
  "MES", "MESSAGE", "SYSMESS", "DESC", "SPACE", "NEWLINE", "PRINT", "DPRINT",
  "LISTOBJ", "LISTAT",
  // Game State (Save/Load)
  "SAVE", "LOAD", "RAMSAVE", "RAMLOAD",
  // User Input Control
  "INPUT", "TIME", "ANYKEY", "PAUSE", "PARSE", "NEWTEXT", "SYNONYM", "GETKEY",
  // Control Flow
  "PROCESS", "REDO", "DOALL", "SKIP", "RESTART", "END", "EXIT", "DONE", "NOTDONE", "OK", "QUIT", "CALL",
  // Graphics/Multimedia
  "PICTURE", "DISPLAY", "SFX", "GFX", "WAIT",
  // V3-Specific Extensions
  "EXTERN",
  // Extended/Maluva Condacts
  "XMES", "XMESSAGE", "XPICTURE", "XSAVE", "XLOAD", "XPART", "XPLAY", "XBEEP", "XSPLITSCR", "XUNDONE", "XDATA", "BEEP", "MOUSE"
] as const;

export function isValidConditionType(type: string): boolean {
  return VALID_CONDITION_TYPES.includes(type as any);
}

export function isValidActionType(type: string): boolean {
  return VALID_ACTION_TYPES.includes(type as any);
}
