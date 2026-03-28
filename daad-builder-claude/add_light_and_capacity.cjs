const fs = require('fs');

// Update Rust Object struct
const typesPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let typesContent = fs.readFileSync(typesPath, 'utf8');

typesContent = typesContent.replace(
  /pub struct Object \{[\s\S]*?pub icon: String,\s*\}/,
  `pub struct Object {
    pub id: u8,
    pub name: String,
    pub description: String,
    /// "key"
    pub noun: String,
    /// "rusty"
    pub adjective: String,
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,
    pub is_light_source: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_capacity: Option<u8>,
    /// Emoji or icon identifier
    pub icon: String,
}`
);

fs.writeFileSync(typesPath, typesContent);
console.log('✓ Updated Rust Object type with isLightSource and containerCapacity');

// Update TypeScript GameObject interface
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

tsContent = tsContent.replace(
  /export interface GameObject \{[\s\S]*?\}/,
  `export interface GameObject {
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
  containerCapacity?: number;
}`
);

fs.writeFileSync(tsTypesPath, tsContent);
console.log('✓ Updated TypeScript GameObject type with isLightSource and containerCapacity');
