const fs = require('fs');

const exportPanelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
let content = fs.readFileSync(exportPanelPath, 'utf8');

// Add vocabulary word value validation after carry limit validation
content = content.replace(
  /(\/\/ Check for missing carry limit flags[\s\S]*?}\s*return warnings;)/,
  `$1

    // Check vocabulary word values for parser requirements
    const directionalVerbs = game.vocabulary.filter(v => v.wordType === "verb" && v.id < 14);
    if (directionalVerbs.length > 0) {
      warnings.push({
        type: "info",
        message: \`\${directionalVerbs.length} verb(s) with ID < 14 will use "I can't go in that direction" error message.\`
      });
    }

    const conversionNouns = game.vocabulary.filter(v => v.wordType === "noun" && v.id < 20);
    if (conversionNouns.length > 0) {
      warnings.push({
        type: "info",
        message: \`\${conversionNouns.length} noun(s) with ID < 20 are conversion nouns (can be used as verbs, e.g. NORTH).\`
      });
    }

    const properNouns = game.vocabulary.filter(v => v.wordType === "noun" && v.id >= 20 && v.id < 50);
    if (properNouns.length > 0) {
      warnings.push({
        type: "info",
        message: \`\${properNouns.length} noun(s) with ID 20-49 are proper nouns (won't affect pronoun "IT").\`
      });
    }

    return warnings;`
);

fs.writeFileSync(exportPanelPath, content);
console.log('✓ Added vocabulary word value validation');
