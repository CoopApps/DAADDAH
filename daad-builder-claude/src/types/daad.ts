// DAAD Game Data Types
import { PlatformId } from "./platforms";

export interface Location {
  id: number;
  name: string;
  description: string;
  isDark: boolean;
  exits: Record<Direction, number | null>;
  x: number;
  y: number;
  image?: {
    sourceData: string;
    yPosition: number;
    height: number;
    platformImages?: {
      [K in PlatformId]?: {
        imageData: string;
        colorMode?: string;
        paletteIndices?: number[];
      };
    };
  };
}

export type Direction =
  | "north"
  | "south"
  | "east"
  | "west"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest"
  | "up"
  | "down"
  | "in"
  | "out";

export type ObjectLocation =
  | { type: "at"; locationId: number }
  | { type: "carried" }
  | { type: "worn" }
  | { type: "limbo" }
  | { type: "inside"; containerId: number };

export interface GameObject {
  id: number;
  noun: string;
  adjective: string;
  description: string;
  icon: string;
  weight: number;
  location: ObjectLocation;
  isContainer: boolean;
  isWearable: boolean;
  isTakeable: boolean;
  isLightSource: boolean;
  isPSI: boolean;
  containerCapacity?: number;
  /**
   * Short display text shown by LISTOBJ ("I can also see: ...")
   * e.g. "a wooden ruler", "the priest", "Louis Carlyle"
   * If absent, codegen generates "a [adjective] [noun]" automatically.
   */
  otxText?: string;
  /**
   * User-defined attribute bit indices (0-15) that are set for this object.
   * These map to the 16 attribute flags in the DAAD OBJ section and are
   * tested with HASAT/HASNAT condacts. Common conventions:
   * - Bit positions are game-defined via #define in the CTL section
   * - e.g. [3, 7] means bits 3 and 7 are set (Y in OBJ output)
   */
  attributes?: number[];
}

export interface Flag {
  id: number;
  name: string;
  description: string;
  initialValue: number;
}

/**
 * Word types for DAAD vocabulary.
 * Note: "pronoun" and "conjugation" are hardcoded by the compiler
 * from the blank_en.dsf standard and should not be added to the
 * game's vocabulary array manually.
 */
export type VocabType =
  | "verb"
  | "noun"
  | "adjective"
  | "adverb"
  | "preposition"
  | "pronoun"
  | "conjugation";

export interface VocabEntry {
  word: string;
  wordType: VocabType;
  id: number;
}

/**
 * Process table assignment for rules.
 *
 * PRO0 = Location loop. Rules run every turn before description.
 *        Use verb="_" noun="_" for unconditional events (e.g. NPC movement).
 *        Rules with explicit verb/noun route to the response table (PRO5).
 *
 * PRO1/PRO5 = Response table. Rules matched against player's verb/noun input.
 *
 * PRO4 = Auto-events. Run before each player input prompt.
 */
/**
 * Process table assignment for rules.
 * DAAD supports up to 256 process tables (PRO 0-255).
 * Standard tables: PRO0=location loop, PRO1=input loop, PRO2=parse error,
 * PRO3=post-description, PRO4=status/auto-events, PRO5=response table,
 * PRO6=init, PRO7-9=window mgmt, PRO10=exits, PRO11=status line, PRO12=turns.
 * Custom game logic can use PRO13+.
 */
export type ProcessTable = string; // "PRO0" through "PRO255"

export type ConditionType =
  | "AT" | "NOTAT" | "ATGT" | "ATLT"
  | "PRESENT" | "ABSENT" | "WORN" | "NOTWORN" | "CARRIED" | "NOTCARR" | "ISAT" | "ISNOTAT"
  | "ZERO" | "NOTZERO" | "EQ" | "NOTEQ" | "GT" | "LT" | "SAME" | "NOTSAME" | "BIGGER" | "SMALLER"
  | "ADJECT1" | "ADVERB" | "PREP" | "NOUN2" | "ADJECT2"
  | "CHANCE"
  | "ISDONE" | "ISNDONE"
  | "HASAT" | "HASNAT"
  | "INKEY"
  | "QUIT";

export type ActionType =
  | "GET" | "DROP" | "WEAR" | "REMOVE" | "CREATE" | "DESTROY" | "SWAP" | "PLACE" | "PUTO"
  | "PUTIN" | "TAKEOUT" | "DROPALL" | "COPYOO" | "RESET"
  | "AUTOG" | "AUTOD" | "AUTOW" | "AUTOR" | "AUTOP" | "AUTOT"
  | "SET" | "CLEAR" | "LET" | "PLUS" | "MINUS" | "ADD" | "SUB" | "COPYFF" | "COPYBF" | "RANDOM" | "MOVE"
  | "COPYOF" | "COPYFO" | "WHATO" | "SETCO" | "WEIGH" | "WEIGHT" | "ABILITY"
  | "GOTO"
  | "WINDOW" | "WINAT" | "WINSIZE" | "CENTRE" | "CLS" | "SAVEAT" | "BACKAT"
  | "PAPER" | "INK" | "BORDER" | "PRINTAT" | "TAB" | "MODE"
  | "MES" | "MESSAGE" | "SYSMESS" | "DESC" | "DESCRIBE" | "SPACE" | "NEWLINE" | "PRINT" | "DPRINT"
  | "LISTOBJ" | "LISTAT"
  | "SAVE" | "LOAD" | "RAMSAVE" | "RAMLOAD"
  | "INPUT" | "TIME" | "ANYKEY" | "PAUSE" | "PARSE" | "NEWTEXT" | "SYNONYM" | "GETKEY"
  | "PROCESS" | "REDO" | "DOALL" | "SKIP" | "RESTART" | "END" | "EXIT" | "DONE" | "NOTDONE" | "OK" | "QUIT" | "CALL"
  | "PICTURE" | "DISPLAY" | "SFX" | "GFX" | "WAIT" | "PLAY"
  | "EXTERN"
  | "XMES" | "XMESSAGE" | "XPICTURE" | "XSAVE" | "XLOAD" | "XPART" | "XPLAY"
  | "XBEEP" | "XSPLITSCR" | "XUNDONE" | "XDATA" | "BEEP" | "MOUSE";

export interface Condition {
  type: ConditionType;
  params: Record<string, unknown>;
  /**
   * When true, the first parameter uses DAAD indirection (@).
   * e.g. EQ with indirect=true and flagno=38 emits "EQ @38 value"
   * meaning "use the value in flag 38 as the flag number".
   */
  indirect?: boolean;
}

export interface Action {
  type: ActionType;
  params: Record<string, unknown>;
  /**
   * When true, the first parameter uses DAAD indirection (@).
   * e.g. DESC with indirect=true emits "DESC @Player"
   * meaning "describe the location stored in flag Player (38)".
   */
  indirect?: boolean;
  /**
   * Inline message text for MESSAGE/MES actions.
   * When set, codegen emits MESSAGE "text" instead of MESSAGE <index>.
   * DRC auto-assigns the MTX index. This is the preferred way to
   * author responses — no manual message index tracking needed.
   */
  text?: string;
}

export interface Rule {
  id: number;
  name: string;
  process: ProcessTable;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
  /**
   * Explicit verb for the DSF verb/noun line.
   * If absent, codegen extracts from the rule name.
   * Use "_" to match any/no verb.
   * Always set this explicitly to avoid name-parsing bugs.
   */
  verb?: string;
  /**
   * Explicit noun for the DSF verb/noun line.
   * If absent, codegen extracts from the rule name.
   * Use "_" to match any/no noun.
   * Always set this explicitly to avoid name-parsing bugs.
   */
  noun?: string;
  /**
   * Additional verb/noun triggers that share the same conditions+actions.
   * Emitted as stacked ">" headers in the DSF, matching Rabenstein's pattern:
   *   > EX BLOOD
   *   > EX PATH
   *   AT 8
   *   MESSAGE "..."
   *   DONE
   */
  additionalTriggers?: Array<{ verb: string; noun: string }>;
}

export type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B" | "R";
export type NoteDuration = 1 | 2 | 4 | 8 | 16 | 32;

export interface MusicNote {
  note: NoteName;
  octave: number;
  duration: NoteDuration;
  dotted: boolean;
}

export interface Music {
  id: number;
  name: string;
  tempo: number;
  shape: number;
  volume: number;
  notes: MusicNote[];
}

export interface DaadGame {
  partNumber: number;
  title: string;
  author: string;
  version: string;
  introText?: string;
  walkthrough?: string[];
  locations: Location[];
  objects: GameObject[];
  rules: Rule[];
  flags: Flag[];
  messages: string[];
  vocabulary: VocabEntry[];
  music: Music[];
  /**
   * Custom system messages (STX overrides).
   * Sparse map: only include indices you want to override.
   * e.g. { 0: "You can't see a thing!", 7: "There's no way to go there." }
   * Indices 0-64 correspond to DAAD standard system messages.
   * Unset indices use the default English text from blank_en.dsf.
   */
  systemMessages?: Record<number, string>;
  /**
   * Status bar configuration. Controls the appearance and content
   * of the status bar at the top of the screen (WINDOW 2 in DAAD).
   */
  statusBarConfig?: StatusBarConfig;
}

export interface StatusBarConfig {
  /** DAAD PAPER color 0-15 for status bar background. Default: 4 (red) */
  paperColor: number;
  /** DAAD INK color 0-15 for status bar text. Default: 15 (white) */
  inkColor: number;
  /** Show turns counter on the right side. Default: true */
  showTurns: boolean;
  /** Show location name on the left side. Default: true */
  showLocationName: boolean;
  /** What to show on the right side: "turns", "score", "custom", or "none". Default: "turns" */
  rightContent?: "turns" | "score" | "custom" | "none";
  /** Flag ID to display when rightContent is "score" or "custom". Default: 30 (Score) */
  rightFlagId?: number;
  /** Label for the right side content. Default: "Turns: " or "Score: " */
  rightLabel?: string;
}

export type PanelType =
  | "game-info"
  | "locations"
  | "objects"
  | "rules"
  | "vocabulary"
  | "flags"
  | "messages"
  | "characters"
  | "music"
  | "preview"
  | "validation"
  | "statistics"
  | "export"
  | "compile"
  | "merge"
  | "debug"
  | "graphics";

export function createEmptyExits(): Record<Direction, number | null> {
  return {
    north: null, south: null, east: null, west: null,
    northeast: null, northwest: null, southeast: null, southwest: null,
    up: null, down: null, in: null, out: null,
  };
}

export function createDefaultGame(): DaadGame {
  return {
    partNumber: 1,
    title: "Untitled Adventure",
    author: "",
    version: "1.0",
    locations: [],
    objects: [],
    rules: [],
    flags: [
      { id: 0,  name: "dark",             description: "Set to make current room dark (system)", initialValue: 0 },
      { id: 1,  name: "objects_carried",   description: "Number of objects carried (auto-updated)", initialValue: 0 },
      { id: 30, name: "score",            description: "Player score (display in status bar)", initialValue: 0 },
      { id: 31, name: "turns",            description: "Turn counter (auto-incremented)", initialValue: 0 },
      { id: 37, name: "max_carry_objects", description: "Maximum objects player can carry", initialValue: 4 },
      { id: 38, name: "player_location",  description: "Current player location (system, read-only)", initialValue: 0 },
      { id: 52, name: "max_carry_weight",  description: "Maximum weight player can carry", initialValue: 10 },
    ],
    messages: [],
    vocabulary: [],
    music: [],
  };
}