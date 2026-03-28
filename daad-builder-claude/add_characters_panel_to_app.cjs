const fs = require('fs');

// Update PanelType in types file
const typesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let typesContent = fs.readFileSync(typesPath, 'utf8');

typesContent = typesContent.replace(
  /export type PanelType = "game-info" \| "locations" \| "objects" \|/,
  'export type PanelType = "game-info" | "locations" | "objects" | "characters" |'
);

fs.writeFileSync(typesPath, typesContent);

// Update App.tsx
const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let appContent = fs.readFileSync(appPath, 'utf8');

// Add import
appContent = appContent.replace(
  /(import ObjectsPanel from "\.\/components\/panels\/ObjectsPanel";)/,
  `$1\nimport CharactersPanel from "./components/panels/CharactersPanel";`
);

// Add case in renderPanel
appContent = appContent.replace(
  /(case "objects":[\s\S]*?return <ObjectsPanel game=\{game\} setGame=\{updateGame\} \/>;)/,
  `$1
      case "characters":
        return <CharactersPanel game={game} setGame={updateGame} />;`
);

fs.writeFileSync(appPath, appContent);

console.log('✓ Added Characters panel to App.tsx');
