const fs = require('fs');

const exportPanelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
let content = fs.readFileSync(exportPanelPath, 'utf8');

// Add container capacity validation before the "return warnings" line
content = content.replace(
  /\/\/ Check for container cycles[\s\S]*?return warnings;/,
  `// Check for container cycles
    game.objects.forEach(obj => {
      if (obj.location.type === "inside") {
        const container = game.objects.find(o => o.id === obj.location.containerId);
        if (container && container.location.type === "inside" && container.location.containerId === obj.id) {
          warnings.push({
            type: "error",
            message: \`Circular container reference detected: \${obj.noun} and \${container.noun}\`
          });
        }
      }
    });

    // Check container capacity warnings
    game.objects.filter(o => o.isContainer).forEach(container => {
      const containedObjects = game.objects.filter(o =>
        o.location.type === "inside" && o.location.containerId === container.id
      );

      if (containedObjects.length > 0) {
        const totalWeight = containedObjects.reduce((sum, obj) => sum + obj.weight, 0);
        const capacity = container.containerCapacity ?? 100;

        if (totalWeight > capacity) {
          warnings.push({
            type: "warning",
            message: \`Container "\${container.adjective} \${container.noun}" is over capacity (\${totalWeight}/\${capacity} weight)\`
          });
        }
      }
    });

    // Check for dark rooms without light sources
    const darkRooms = game.locations.filter(loc => loc.isDark);
    const lightSources = game.objects.filter(obj => obj.isLightSource);

    if (darkRooms.length > 0 && lightSources.length === 0) {
      warnings.push({
        type: "warning",
        message: \`\${darkRooms.length} dark room(s) defined but no light sources available.\`
      });
    }

    return warnings;`
);

fs.writeFileSync(exportPanelPath, content);
console.log('✓ Added container capacity and light source validation');
