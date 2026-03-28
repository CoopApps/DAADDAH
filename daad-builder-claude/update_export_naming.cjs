const fs = require('fs');

const exportPanelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
let content = fs.readFileSync(exportPanelPath, 'utf8');

// Update default file path to use PARTx naming
content = content.replace(
  /defaultPath: `\$\{game\.title\.replace\(\/\[^a-zA-Z0-9\]\/g, "_"\)\}\.dsc`/,
  `defaultPath: \`PART\${game.partNumber}.dsc\``
);

fs.writeFileSync(exportPanelPath, content);
console.log('✓ Updated export to use PARTx.dsc naming convention');
