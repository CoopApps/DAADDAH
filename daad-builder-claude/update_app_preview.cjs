const fs = require('fs');

const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Add PreviewPanel import
content = content.replace(
  /(import ExportPanel from "\.\/components\/panels\/ExportPanel";)/,
  `$1\nimport PreviewPanel from "./components/panels/PreviewPanel";`
);

// Replace preview case
content = content.replace(
  /case "preview":\s*return \(\s*<div className="panel-content">[\s\S]*?<\/div>\s*\);/,
  `case "preview":
        return <PreviewPanel game={game} />;`
);

// Add "characters" to titles if not already there
if (!content.includes('characters: "Character Editor"')) {
  content = content.replace(
    /(const titles: Record<PanelType, string> = \{[^}]*objects: "Item Editor",)/,
    `$1\n      characters: "Character Editor",`
  );
}

fs.writeFileSync(appPath, content);
console.log('✓ Updated App.tsx with PreviewPanel');
