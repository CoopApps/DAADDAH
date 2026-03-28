const fs = require('fs');

// Update Rust Game struct
const typesPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let typesContent = fs.readFileSync(typesPath, 'utf8');

typesContent = typesContent.replace(
  /pub struct Game \{[\s\S]*?pub messages: Vec<Message>,\s*\}/,
  `pub struct Game {
    pub title: String,
    pub author: String,
    pub version: String,
    pub max_carry_objects: u8,
    pub max_carry_weight: u8,
    pub vocabulary: Vec<VocabularyWord>,
    pub locations: Vec<Location>,
    pub objects: Vec<Object>,
    pub connections: Vec<Connection>,
    pub rules: Vec<Rule>,
    pub messages: Vec<Message>,
}`
);

fs.writeFileSync(typesPath, typesContent);
console.log('✓ Updated Rust Game type with carry limits');

// Update TypeScript DaadGame interface
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

tsContent = tsContent.replace(
  /export interface DaadGame \{[\s\S]*?messages: Message\[\];\s*\}/,
  `export interface DaadGame {
  title: string;
  author: string;
  version: string;
  maxCarryObjects: number;
  maxCarryWeight: number;
  vocabulary: VocabularyWord[];
  locations: Location[];
  objects: GameObject[];
  rules: Rule[];
  messages: Message[];
}`
);

fs.writeFileSync(tsTypesPath, tsContent);
console.log('✓ Updated TypeScript DaadGame type with carry limits');
