const fs = require('fs');

let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');

// 1. Add compile to Test section
content = content.replace(
  '{ id: "export", icon: "download", label: "Export" },\n    ],',
  `{ id: "export", icon: "download", label: "Export" },
      { id: "compile", icon: "hammer", label: "Compile" },
    ],`
);

// 2. Add hammer icon to the icon mapping
content = content.replace(
  'download: "[↓]",',
  `download: "[↓]",
    hammer: "[⚒]",`
);

fs.writeFileSync('src/components/Sidebar.tsx', content, 'utf8');
console.log('✓ Added Compile to Sidebar');
