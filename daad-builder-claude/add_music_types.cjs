const fs = require('fs');

// 1. Add music types to TypeScript
const tsTypesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let tsContent = fs.readFileSync(tsTypesPath, 'utf8');

// Add Music note type
if (!tsContent.includes('export interface MusicNote')) {
  const musicTypes = `
export type NoteName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B" | "R"; // R = rest
export type NoteDuration = 1 | 2 | 4 | 8 | 16 | 32;

export interface MusicNote {
  note: NoteName;
  octave: number; // 3-6
  duration: NoteDuration; // 1=whole, 2=half, 4=quarter, 8=eighth, 16=sixteenth, 32=thirty-second
  dotted: boolean; // extends duration by 50%
}

export interface Music {
  id: number;
  name: string;
  tempo: number; // BPM (40-240)
  shape: number; // Waveform shape (0-7)
  volume: number; // 0-15000
  notes: MusicNote[];
}
`;

  // Add before DaadGame interface
  tsContent = tsContent.replace(
    /export interface DaadGame \{/,
    `${musicTypes}\nexport interface DaadGame {`
  );

  fs.writeFileSync(tsTypesPath, tsContent);
  console.log('✓ Added Music types to TypeScript');
}

// Add music array to DaadGame interface
if (!tsContent.includes('music: Music[]')) {
  tsContent = fs.readFileSync(tsTypesPath, 'utf8');
  tsContent = tsContent.replace(
    /(vocabulary: VocabEntry\[\];)/,
    `$1\n  music: Music[];`
  );
  fs.writeFileSync(tsTypesPath, tsContent);
  console.log('✓ Added music array to DaadGame');
}

// Add music to PanelType
if (!tsContent.includes('"music"')) {
  tsContent = fs.readFileSync(tsTypesPath, 'utf8');
  tsContent = tsContent.replace(
    /\| "messages"/,
    `| "messages"\n  | "music"`
  );
  fs.writeFileSync(tsTypesPath, tsContent);
  console.log('✓ Added music to PanelType');
}

// 2. Add to Rust types
const rustTypesPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let rustContent = fs.readFileSync(rustTypesPath, 'utf8');

if (!rustContent.includes('pub struct Music')) {
  const rustMusic = `
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MusicNote {
    pub note: String,
    pub octave: u8,
    pub duration: u8,
    pub dotted: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Music {
    pub id: u8,
    pub name: String,
    pub tempo: u16,
    pub shape: u8,
    pub volume: u16,
    pub notes: Vec<MusicNote>,
}
`;

  // Add before Game struct
  rustContent = rustContent.replace(
    /#\[derive\(Debug, Serialize, Deserialize\)\]\npub struct Game \{/,
    `${rustMusic}\n#[derive(Debug, Serialize, Deserialize)]\npub struct Game {`
  );

  fs.writeFileSync(rustTypesPath, rustContent);
  console.log('✓ Added Music types to Rust');
}

// Add music field to Game struct
if (!rustContent.includes('pub music:')) {
  rustContent = fs.readFileSync(rustTypesPath, 'utf8');
  rustContent = rustContent.replace(
    /(pub vocabulary: Vec<VocabEntry>,)/,
    `$1\n    pub music: Vec<Music>,`
  );
  fs.writeFileSync(rustTypesPath, rustContent);
  console.log('✓ Added music field to Rust Game struct');
}

console.log('✓ Music data structures added successfully');
