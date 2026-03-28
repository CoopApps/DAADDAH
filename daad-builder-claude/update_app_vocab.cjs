const fs = require('fs');

const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Add import for VocabularyPanel
content = content.replace(
  `import MessagesPanel from "./components/panels/MessagesPanel";`,
  `import MessagesPanel from "./components/panels/MessagesPanel";
import VocabularyPanel from "./components/panels/VocabularyPanel";`
);

// Add vocabulary case in renderPanel function
content = content.replace(
  `case "messages":
        return <MessagesPanel game={game} setGame={updateGame} />;`,
  `case "messages":
        return <MessagesPanel game={game} setGame={updateGame} />;
      case "vocabulary":
        return <VocabularyPanel game={game} setGame={updateGame} />;`
);

// Update panel titles
content = content.replace(
  `const titles: Record<PanelType, string> = {
      "game-info": "Story Information",
      locations: "Room Editor",
      objects: "Item Editor",
      rules: "Response Editor",
      flags: "Variable Manager",
      messages: "Text Editor",
      preview: "Play Test",
      export: "Export Game",
    };`,
  `const titles: Record<PanelType, string> = {
      "game-info": "Story Information",
      locations: "Room Editor",
      objects: "Item Editor",
      rules: "Response Editor",
      vocabulary: "Word Dictionary",
      flags: "Variable Manager",
      messages: "Text Editor",
      preview: "Play Test",
      export: "Export Game",
    };`
);

fs.writeFileSync(appPath, content);
console.log('Added VocabularyPanel to App.tsx');
