const fs = require('fs');
const content = `// DAAD Game Data Types

export interface Location {
  id: number;
  name: string;
  description: string;
  isDark: boolean;
  exits: Record<Direction, number | null>;
  // Visual position for the editor
  x: number;
  y: number;
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
}

export interface Flag {
  id: number;
  name: string;
  description: string;
  initialValue: number;
}

export type ProcessTable = "PRO0" | "PRO1" | "PRO2" | "PRO3";

export interface Condition {
  type: string;
  params: Record<string, unknown>;
}

export interface Action {
  type: string;
  params: Record<string, unknown>;
}

export interface Rule {
  id: number;
  name: string;
  process: ProcessTable;
  enabled: boolean;
  conditions: Condition[];
  actions: Action[];
}

export interface DaadGame {
  title: string;
  author: string;
  version: string;
  locations: Location[];
  objects: GameObject[];
  rules: Rule[];
  flags: Flag[];
  messages: string[];
}

// Panel Types
export type PanelType =
  | "game-info"
  | "locations"
  | "objects"
  | "rules"
  | "flags"
  | "messages"
  | "preview"
  | "export";

// Helper to create empty exits
export function createEmptyExits(): Record<Direction, number | null> {
  return {
    north: null,
    south: null,
    east: null,
    west: null,
    northeast: null,
    northwest: null,
    southeast: null,
    southwest: null,
    up: null,
    down: null,
    in: null,
    out: null,
  };
}

// Create default empty game
export function createDefaultGame(): DaadGame {
  return {
    title: "Untitled Adventure",
    author: "",
    version: "1.0",
    locations: [],
    objects: [],
    rules: [],
    flags: [],
    messages: [],
  };
}
`;
fs.writeFileSync('D:/projects/daadah/daad-builder-ui/src/types/daad.ts', content);
console.log('File written');
