const fs = require('fs');

const sidebarPath = 'D:/projects/daadah/daad-builder-ui/src/components/Sidebar.tsx';
let content = fs.readFileSync(sidebarPath, 'utf8');

// Add characters menu item after objects in World section
content = content.replace(
  /(\{ id: "objects", icon: "gem", label: "Items" \},)\s*\],/,
  `$1
      { id: "characters", icon: "users", label: "Characters" },
    ],`
);

// Add users icon mapping
content = content.replace(
  /(gem: "\[I\]",)/,
  `$1
    users: "[C]",`
);

fs.writeFileSync(sidebarPath, content);
console.log('✓ Added Characters menu item to Sidebar with icon');
