const fs = require('fs');

// Update Rust types
const typesRsPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let typesRs = fs.readFileSync(typesRsPath, 'utf8');

typesRs = typesRs.replace(
  /(pub struct Object \{[^}]*pub is_light_source: bool,)/,
  `$1
    pub is_psi: bool,`
);

fs.writeFileSync(typesRsPath, typesRs);

// Update TypeScript types
const typesTsPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let typesTs = fs.readFileSync(typesTsPath, 'utf8');

// Add isPSI to GameObject interface
typesTs = typesTs.replace(
  /(export interface GameObject \{[^}]*isLightSource: boolean;)/,
  `$1
  isPSI: boolean;`
);

// Update createDefaultGame to include isPSI in new objects
typesTs = typesTs.replace(
  /(isLightSource: false,)/,
  `$1
      isPSI: false,`
);

fs.writeFileSync(typesTsPath, typesTs);

console.log('✓ Added isPSI flag to object types');
