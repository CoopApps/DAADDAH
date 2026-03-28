const fs = require('fs');

const sidebarPath = 'D:/projects/daadah/daad-builder-ui/src/components/Sidebar.tsx';
let content = fs.readFileSync(sidebarPath, 'utf8');

// Add characters menu item after objects
content = content.replace(
  /(\{ id: "objects", icon: "package", label: "Items" \},)/,
  `$1
      { id: "characters", icon: "users", label: "Characters" },`
);

fs.writeFileSync(sidebarPath, content);
console.log('✓ Added Characters menu item to Sidebar');
