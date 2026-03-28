const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add isDark to new location
content = content.replace(
  `const newLocation: Location = {
      id: newId,
      name: \`Room \${newId}\`,
      description: "An empty room.",
      exits: createEmptyExits(),
      x: Math.floor(Math.random() * 600) + 100,
      y: Math.floor(Math.random() * 400) + 100,
    };`,
  `const newLocation: Location = {
      id: newId,
      name: \`Room \${newId}\`,
      description: "An empty room.",
      isDark: false,
      exits: createEmptyExits(),
      x: Math.floor(Math.random() * 600) + 100,
      y: Math.floor(Math.random() * 400) + 100,
    };`
);

fs.writeFileSync(panelPath, content);
console.log('Fixed location creation to include isDark');
