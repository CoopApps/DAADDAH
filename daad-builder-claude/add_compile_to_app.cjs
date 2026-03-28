const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add import
content = content.replace(
  'import ExportPanel from "./components/panels/ExportPanel";',
  `import ExportPanel from "./components/panels/ExportPanel";
import { CompilePanel } from "./components/panels/CompilePanel";`
);

// 2. Add case in renderPanel
content = content.replace(
  'case "export":\n        return <ExportPanel game={game} />;',
  `case "export":
        return <ExportPanel game={game} />;
      case "compile":
        return <CompilePanel game={game} />;`
);

// 3. Add to titles object
content = content.replace(
  'export: "Export Game",\n    };',
  `export: "Export Game",
      compile: "Compile Game",
    };`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('✓ Added CompilePanel to App.tsx');
