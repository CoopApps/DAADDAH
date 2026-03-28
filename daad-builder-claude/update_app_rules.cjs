const fs = require('fs');

const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Add import for RulesPanel
content = content.replace(
  `import VocabularyPanel from "./components/panels/VocabularyPanel";`,
  `import VocabularyPanel from "./components/panels/VocabularyPanel";
import RulesPanel from "./components/panels/RulesPanel";`
);

// Replace rules placeholder with actual panel
content = content.replace(
  `case "rules":
        return (
          <div className="panel-content">
            <div className="alert alert-warning">
              <span className="alert-icon">!</span>
              <span>Rules Editor - Coming Soon</span>
            </div>
          </div>
        );`,
  `case "rules":
        return <RulesPanel game={game} setGame={updateGame} />;`
);

fs.writeFileSync(appPath, content);
console.log('Added RulesPanel to App.tsx');
