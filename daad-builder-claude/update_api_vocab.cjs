const fs = require('fs');

const apiPath = 'D:/projects/daadah/daad-builder-ui/src/api/tauri.ts';
let content = fs.readFileSync(apiPath, 'utf8');

// Add vocabulary serialization in toBackendGame function
// Find the messages line and add vocabulary after it
content = content.replace(
  /messages: game\.messages,\s*}/,
  `messages: game.messages,
    vocabulary: game.vocabulary.map(v => ({
      word: v.word,
      word_type: v.wordType === "verb" ? "Verb" : v.wordType === "noun" ? "Noun" : "Adjective",
      id: v.id,
    })),
  }`
);

// Add vocabulary deserialization in toFrontendGame function
content = content.replace(
  /messages: backendGame\.messages,\s*}/,
  `messages: backendGame.messages,
    vocabulary: backendGame.vocabulary.map((v: any) => ({
      word: v.word,
      wordType: v.word_type === "Verb" ? "verb" : v.word_type === "Noun" ? "noun" : "adjective",
      id: v.id,
    })),
  }`
);

fs.writeFileSync(apiPath, content);
console.log('Added vocabulary serialization to tauri API');
