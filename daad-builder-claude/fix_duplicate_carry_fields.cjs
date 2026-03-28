const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/GameInfoPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Remove the duplicate fields that reference game.maxCarryObjects and game.maxCarryWeight
content = content.replace(
  /\s*<div className="form-group">\s*<label className="form-label">Max Carry Objects \(Flag 37\)<\/label>\s*<input\s*type="number"\s*className="form-input"\s*value=\{game\.maxCarryObjects\}[\s\S]*?<\/div>\s*<\/div>\s*<div className="form-group">\s*<label className="form-label">Max Carry Weight \(Flag 52\)<\/label>\s*<input\s*type="number"\s*className="form-input"\s*value=\{game\.maxCarryWeight\}[\s\S]*?<\/div>\s*<\/div>/,
  ''
);

fs.writeFileSync(panelPath, content);
console.log('✓ Removed duplicate carry limit fields from GameInfoPanel');
