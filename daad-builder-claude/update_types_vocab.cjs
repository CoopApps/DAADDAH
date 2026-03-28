const fs = require('fs');

const typesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let content = fs.readFileSync(typesPath, 'utf8');

// Add VocabEntry type after Flag interface
content = content.replace(
  `export interface Flag {
  id: number;
  name: string;
  description: string;
  initialValue: number;
}`,
  `export interface Flag {
  id: number;
  name: string;
  description: string;
  initialValue: number;
}

export type VocabType = "verb" | "noun" | "adjective";

export interface VocabEntry {
  word: string;
  wordType: VocabType;
  id: number;
}`
);

// Add vocabulary array to DaadGame interface
content = content.replace(
  `export interface DaadGame {
  title: string;
  author: string;
  version: string;
  locations: Location[];
  objects: GameObject[];
  rules: Rule[];
  flags: Flag[];
  messages: string[];
}`,
  `export interface DaadGame {
  title: string;
  author: string;
  version: string;
  locations: Location[];
  objects: GameObject[];
  rules: Rule[];
  flags: Flag[];
  messages: string[];
  vocabulary: VocabEntry[];
}`
);

// Add vocabulary to createDefaultGame
content = content.replace(
  `export function createDefaultGame(): DaadGame {
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
}`,
  `export function createDefaultGame(): DaadGame {
  return {
    title: "Untitled Adventure",
    author: "",
    version: "1.0",
    locations: [],
    objects: [],
    rules: [],
    flags: [],
    messages: [],
    vocabulary: [],
  };
}`
);

// Add vocabulary panel type
content = content.replace(
  `export type PanelType =
  | "game-info"
  | "locations"
  | "objects"
  | "rules"
  | "flags"
  | "messages"
  | "preview"
  | "export";`,
  `export type PanelType =
  | "game-info"
  | "locations"
  | "objects"
  | "rules"
  | "vocabulary"
  | "flags"
  | "messages"
  | "preview"
  | "export";`
);

fs.writeFileSync(typesPath, content);
console.log('Added vocabulary types to daad.ts');
