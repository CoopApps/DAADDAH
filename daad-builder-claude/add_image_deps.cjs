const fs = require('fs');

const cargoPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/Cargo.toml';
let content = fs.readFileSync(cargoPath, 'utf8');

// Add image processing dependencies
content = content.replace(
  `serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "1"`,
  `serde = { version = "1", features = ["derive"] }
serde_json = "1"
thiserror = "1"
image = "0.24"
base64 = "0.21"`
);

fs.writeFileSync(cargoPath, content);
console.log('Added image processing dependencies to Cargo.toml');
