const fs = require('fs');

const exportPanelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
let content = fs.readFileSync(exportPanelPath, 'utf8');

// Add validation for carry limits after dark room validation
content = content.replace(
  /(\/\/ Check for dark rooms without light sources[\s\S]*?}\s*return warnings;)/,
  `$1

    // Check for missing carry limit flags
    const maxCarryObjects = game.flags.find(f => f.id === 37);
    const maxCarryWeight = game.flags.find(f => f.id === 52);

    if (!maxCarryObjects) {
      warnings.push({
        type: "warning",
        message: "Flag 37 (Max Carry Objects) not defined. Add it in the Flags panel or Game Info."
      });
    } else if (maxCarryObjects.initialValue < 1) {
      warnings.push({
        type: "warning",
        message: "Max Carry Objects (Flag 37) should be at least 1."
      });
    }

    if (!maxCarryWeight) {
      warnings.push({
        type: "warning",
        message: "Flag 52 (Max Carry Weight) not defined. Add it in the Flags panel or Game Info."
      });
    } else if (maxCarryWeight.initialValue < 1) {
      warnings.push({
        type: "warning",
        message: "Max Carry Weight (Flag 52) should be at least 1."
      });
    }

    return warnings;`
);

fs.writeFileSync(exportPanelPath, content);
console.log('✓ Added carry limit validation to ExportPanel');
