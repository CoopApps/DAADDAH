const fs = require('fs');

const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Add import for ExportPanel
content = content.replace(
  `import RulesPanel from "./components/panels/RulesPanel";`,
  `import RulesPanel from "./components/panels/RulesPanel";
import ExportPanel from "./components/panels/ExportPanel";`
);

// Replace export placeholder with actual panel
content = content.replace(
  `case "export":
        return (
          <div className="panel-content">
            <div className="alert alert-warning">
              <span className="alert-icon">!</span>
              <span>Export Panel - Coming Soon</span>
            </div>
          </div>
        );`,
  `case "export":
        return <ExportPanel game={game} />;`
);

fs.writeFileSync(appPath, content);
console.log('✓ Added ExportPanel to App.tsx');
