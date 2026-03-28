// DAAD System Flags (0-63) Reference
// Based on official DAAD specification
// Source: https://www.ngpaws.com/daadready/doc_en.html

export interface SystemFlagDefinition {
  id: number;
  name: string;
  description: string;
  readonly: boolean; // True if flag is automatically managed by interpreter
  defaultValue?: number;
}

export const SYSTEM_FLAGS: SystemFlagDefinition[] = [
  {
    id: 0,
    name: "Darkness Flag",
    description: "Game darkness flag (nonzero = dark location). Typically managed automatically.",
    readonly: true,
  },
  {
    id: 1,
    name: "Objects Carried",
    description: "Number of objects player carries (not worn). Automatically updated by interpreter.",
    readonly: true,
    defaultValue: 0,
  },
  {
    id: 2,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 3,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 4,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 5,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 6,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 7,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 8,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 9,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 10,
    name: "Free",
    description: "Free for game use (formerly auto-decrement in DAAD v1)",
    readonly: false,
  },
  {
    id: 11,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 12,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 13,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 14,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 15,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 16,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 17,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 18,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 19,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 20,
    name: "Maluva Internal",
    description: "Reserved for Maluva extension internal use",
    readonly: true,
  },
  {
    id: 21,
    name: "MSDOS Sound Control",
    description: "MSDOS sound control (bits: SFX enabled, loop mode, playing)",
    readonly: true,
  },
  {
    id: 22,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 23,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 24,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 25,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 26,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 27,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 28,
    name: "Free",
    description: "Free for game use (used internally by TEST.DSF)",
    readonly: false,
  },
  {
    id: 29,
    name: "Mouse Present",
    description: "Bit 0: Mouse present (16-bit systems only)",
    readonly: true,
  },
  {
    id: 30,
    name: "Score",
    description: "Game score (traditional, not automatically used by DAAD)",
    readonly: false,
    defaultValue: 0,
  },
  {
    id: 31,
    name: "Turn Counter (LSB)",
    description: "Turn counter low byte. Automatically incremented each turn.",
    readonly: true,
    defaultValue: 0,
  },
  {
    id: 32,
    name: "Turn Counter (MSB)",
    description: "Turn counter high byte. Automatically incremented each turn.",
    readonly: true,
    defaultValue: 0,
  },
  {
    id: 33,
    name: "Current Verb",
    description: "Current verb ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 34,
    name: "First Noun",
    description: "First noun ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 35,
    name: "First Adjective",
    description: "First adjective ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 36,
    name: "Adverb",
    description: "Adverb ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 37,
    name: "Max Carry Objects",
    description: "Maximum number of objects player can carry (default: 4)",
    readonly: false,
    defaultValue: 4,
  },
  {
    id: 38,
    name: "Current Location",
    description: "Current player location ID. Automatically updated by interpreter.",
    readonly: true,
  },
  {
    id: 39,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 40,
    name: "Free",
    description: "Free for game use",
    readonly: false,
  },
  {
    id: 41,
    name: "Input Stream",
    description: "Input stream number",
    readonly: true,
  },
  {
    id: 42,
    name: "Prompt Message",
    description: "System message number for prompt",
    readonly: false,
  },
  {
    id: 43,
    name: "Preposition",
    description: "Preposition ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 44,
    name: "Second Noun",
    description: "Second noun ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 45,
    name: "Second Adjective",
    description: "Second adjective ID from player input. Set by parser.",
    readonly: true,
  },
  {
    id: 46,
    name: "Pronoun Noun (IT)",
    description: "Pronoun noun ID (tracks 'IT' reference)",
    readonly: true,
  },
  {
    id: 47,
    name: "Pronoun Adjective (IT)",
    description: "Pronoun adjective ID (tracks 'IT' reference)",
    readonly: true,
  },
  {
    id: 48,
    name: "Timeout Duration",
    description: "Timeout duration for TIME condact",
    readonly: false,
  },
  {
    id: 49,
    name: "Timeout Control",
    description: "Timeout control flags (bits for different timeout conditions)",
    readonly: true,
  },
  {
    id: 50,
    name: "DOALL Object",
    description: "Current object number in DOALL loop",
    readonly: true,
  },
  {
    id: 51,
    name: "Last Referenced Object",
    description: "Last referenced object number",
    readonly: true,
  },
  {
    id: 52,
    name: "Max Carry Weight",
    description: "Maximum weight player can carry (strength, default: 10)",
    readonly: false,
    defaultValue: 10,
  },
  {
    id: 53,
    name: "Object Listing Flags",
    description: "Object listing control (bits: continuous listing, printed state)",
    readonly: true,
  },
  {
    id: 54,
    name: "Current Object Location",
    description: "Current referenced object's location",
    readonly: true,
  },
  {
    id: 55,
    name: "Current Object Weight",
    description: "Current referenced object's weight",
    readonly: true,
  },
  {
    id: 56,
    name: "Is Container Flag",
    description: "128 if current object is a container, 0 otherwise",
    readonly: true,
  },
  {
    id: 57,
    name: "Is Wearable Flag",
    description: "128 if current object is wearable, 0 otherwise",
    readonly: true,
  },
  {
    id: 58,
    name: "Object Attributes (Low)",
    description: "Current object user attributes (low byte)",
    readonly: true,
  },
  {
    id: 59,
    name: "Object Attributes (High)",
    description: "Current object user attributes (high byte)",
    readonly: true,
  },
  {
    id: 60,
    name: "Key Code (Low/ASCII)",
    description: "Key code (ASCII on 8-bit; low byte on 16-bit). Set by INKEY.",
    readonly: true,
  },
  {
    id: 61,
    name: "Key Code (High)",
    description: "Key code high byte (16-bit systems only). Set by INKEY.",
    readonly: true,
  },
  {
    id: 62,
    name: "Screen Mode",
    description: "Screen mode (ST/PC: 0=lo-res, 1=med-res; PC: 4=CGA, 7=mono, 13=EGA/VGA)",
    readonly: true,
  },
  {
    id: 63,
    name: "Current Window",
    description: "Currently active window number",
    readonly: true,
  },
];

// Helper to get system flag by ID
export function getSystemFlag(id: number): SystemFlagDefinition | undefined {
  return SYSTEM_FLAGS.find(f => f.id === id);
}

// Check if a flag ID is in the system range
export function isSystemFlag(id: number): boolean {
  return id >= 0 && id <= 63;
}

// Get user-safe flags (those not readonly)
export function getUserSafeSystemFlags(): SystemFlagDefinition[] {
  return SYSTEM_FLAGS.filter(f => !f.readonly);
}

// Get recommended user flag range
export const USER_FLAG_RANGE = { min: 64, max: 255 };
