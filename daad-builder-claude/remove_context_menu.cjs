const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Remove context menu state
content = content.replace(
  /const \[contextMenu, setContextMenu\] = useState<\{ x: number; y: number; locationId: number \} \| null>\(null\);\n/,
  ''
);

// Remove handleContextMenu function
content = content.replace(
  /const handleContextMenu = \(e: React\.MouseEvent, locationId: number\) => \{[\s\S]*?\};[\s\S]*?const handleManageImage[\s\S]*?\};/,
  ''
);

// Remove onContextMenu from room card
content = content.replace(
  /onContextMenu=\{\(e\) => handleContextMenu\(e, loc\.id\)\}\n\s+/,
  ''
);

// Remove the context menu JSX at the end (before ImageDialog)
content = content.replace(
  /\/\* Context Menu \*\/[\s\S]*?<\/>\s+\)\}\s+\/\* Image Dialog \*\//,
  '/* Image Dialog */'
);

fs.writeFileSync(panelPath, content);
console.log('Removed context menu code - button is better for Tauri');
