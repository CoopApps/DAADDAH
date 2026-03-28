const fs = require('fs');

const locationsPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(locationsPath, 'utf8');

// Update handleMapMouseDown to allow left-click without Shift
content = content.replace(
  'if (e.button === 1 || (e.button === 0 && e.shiftKey)) {',
  'if (e.button === 0 || e.button === 1) {'
);

// Update help text to remove Shift reference
content = content.replace(
  'Shift+Drag or Middle-Click to pan',
  'Click and drag to pan'
);

fs.writeFileSync(locationsPath, content);
console.log('Updated panning interaction - removed Shift key requirement');
