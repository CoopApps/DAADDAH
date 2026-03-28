const fs = require('fs');

// 1. Add music to sidebar
const sidebarPath = 'D:/projects/daadah/daad-builder-ui/src/components/Sidebar.tsx';
let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

if (!sidebarContent.includes('"music"')) {
  sidebarContent = sidebarContent.replace(
    /(\{ id: "messages", icon: "comment", label: "Text" \},)/,
    `$1\n      { id: "music", icon: "music", label: "Music" },`
  );

  // Add music icon
  sidebarContent = sidebarContent.replace(
    /(comment: "\[T\]",)/,
    `$1\n    music: "[M]",`
  );

  fs.writeFileSync(sidebarPath, sidebarContent);
  console.log('✓ Added music to sidebar');
}

// 2. Add music to App.tsx
const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Add import
if (!appContent.includes('import MusicPanel')) {
  appContent = appContent.replace(
    /(import MessagesPanel from "\.\/components\/panels\/MessagesPanel";)/,
    `$1\nimport MusicPanel from "./components/panels/MusicPanel";`
  );
  console.log('✓ Added MusicPanel import');
}

// Add case in renderPanel
if (!appContent.includes('case "music"')) {
  appContent = appContent.replace(
    /(case "messages":\s*return <MessagesPanel[\s\S]*?\/>;)/,
    `$1\n      case "music":\n        return <MusicPanel game={game} setGame={setGame} />;`
  );
  console.log('✓ Added music case to renderPanel');
}

// Add title
if (!appContent.includes('music: "Music"')) {
  appContent = appContent.replace(
    /(messages: "Text Messages",)/,
    `$1\n      music: "Music",`
  );
  console.log('✓ Added music title');
}

fs.writeFileSync(appPath, appContent);

// 3. Update createDefaultGame to include music array
const typesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let typesContent = fs.readFileSync(typesPath, 'utf8');

if (!typesContent.includes('music: []')) {
  typesContent = typesContent.replace(
    /(vocabulary: \[\],)/,
    `$1\n    music: [],`
  );
  fs.writeFileSync(typesPath, typesContent);
  console.log('✓ Added music to createDefaultGame');
}

console.log('✓ Music panel integrated successfully!');
