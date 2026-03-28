const fs = require('fs');

const libPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/lib.rs';
let content = fs.readFileSync(libPath, 'utf8');

// Add image_converter module
content = content.replace(
  `pub mod types;
pub mod game;
pub mod codegen;
pub mod commands;`,
  `pub mod types;
pub mod game;
pub mod codegen;
pub mod commands;
pub mod image_converter;`
);

fs.writeFileSync(libPath, content);
console.log('Added image_converter module to lib.rs');
