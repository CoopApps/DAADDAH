const fs = require('fs');

// 1. Add introText to TypeScript DaadGame interface
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

if (!tsContent.includes('introText?:')) {
  tsContent = tsContent.replace(
    /(export interface DaadGame \{[\s\S]*?version: string;)/,
    `$1\n  introText?: string;  // Introductory text shown before game starts`
  );
  fs.writeFileSync(tsTypesPath, tsContent);
  console.log('✓ Added introText to TypeScript DaadGame interface');
}

// 2. Add intro_text to Rust Game struct
const rustTypesPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let rustContent = fs.readFileSync(rustTypesPath, 'utf8');

if (!rustContent.includes('pub intro_text:')) {
  rustContent = rustContent.replace(
    /(pub struct Game \{[\s\S]*?pub version: String,)/,
    `$1\n    #[serde(skip_serializing_if = "Option::is_none")]\n    pub intro_text: Option<String>,`
  );
  fs.writeFileSync(rustTypesPath, rustContent);
  console.log('✓ Added intro_text to Rust Game struct');
}

console.log('✓ Intro text field added to type definitions');
