const fs = require('fs');

const exportPanelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
let content = fs.readFileSync(exportPanelPath, 'utf8');

// Remove the first early return (after dark room validation)
content = content.replace(
  /(if \(darkRooms\.length > 0 && lightSources\.length === 0\) \{[\s\S]*?\}\s*)\n\s*return warnings;\n\s*\/\/ Check for missing carry limit flags/,
  '$1\n    // Check for missing carry limit flags'
);

// Remove the second early return (after carry limit validation)
content = content.replace(
  /(if \(maxCarryWeight\.initialValue < 1\) \{[\s\S]*?\}\s*)\n\s*return warnings;\n\s*\/\/ Check vocabulary word values/,
  '$1\n    // Check vocabulary word values'
);

// The third return at the end should stay - it's the correct final return

fs.writeFileSync(exportPanelPath, content);
console.log('✓ Fixed early return statements in ExportPanel validation');
