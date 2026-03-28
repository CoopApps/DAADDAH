const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ObjectsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add helper function to auto-add vocabulary
const helperFunction = `
  // Auto-add vocabulary when noun/adjective changes
  const autoAddVocabulary = (word: string, wordType: "noun" | "adjective") => {
    if (!word.trim()) return;

    const normalizedWord = word.toLowerCase().trim();
    const exists = game.vocabulary.some(
      v => v.word === normalizedWord && v.wordType === wordType
    );

    if (!exists) {
      const sameTypeWords = game.vocabulary.filter(v => v.wordType === wordType);
      const maxId = sameTypeWords.length > 0
        ? Math.max(...sameTypeWords.map(v => v.id))
        : -1;

      setGame((prev) => ({
        ...prev,
        vocabulary: [
          ...prev.vocabulary,
          {
            word: normalizedWord,
            wordType: wordType,
            id: maxId + 1,
          },
        ],
      }));
    }
  };
`;

// Add helper function after the getLocationDisplay function
content = content.replace(
  /const getLocationDisplay = \(loc: ObjectLocation\): string => \{[\s\S]*?\};/,
  (match) => match + helperFunction
);

// Update noun onChange to auto-add vocabulary
content = content.replace(
  /onChange=\{\(e\) =>\s*setGame\(\(prev\) => \(\{\s*\.\.\.prev,\s*objects: prev\.objects\.map\(\(obj\) =>\s*obj\.id === selectedObj\.id\s*\? \{ \.\.\.obj, noun: e\.target\.value \}\s*: obj\s*\),\s*\}\)\)\s*\}/,
  `onChange={(e) => {
                    const newNoun = e.target.value;
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, noun: newNoun }
                          : obj
                      ),
                    }));
                    // Auto-add to vocabulary on blur
                    if (newNoun !== selectedObj.noun) {
                      autoAddVocabulary(newNoun, "noun");
                    }
                  }}
                  onBlur={(e) => autoAddVocabulary(e.target.value, "noun")}`
);

// Update adjective onChange to auto-add vocabulary
content = content.replace(
  /onChange=\{\(e\) =>\s*setGame\(\(prev\) => \(\{\s*\.\.\.prev,\s*objects: prev\.objects\.map\(\(obj\) =>\s*obj\.id === selectedObj\.id\s*\? \{ \.\.\.obj, adjective: e\.target\.value \}\s*: obj\s*\),\s*\}\)\)\s*\}/,
  `onChange={(e) => {
                    const newAdjective = e.target.value;
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, adjective: newAdjective }
                          : obj
                      ),
                    }));
                  }}
                  onBlur={(e) => autoAddVocabulary(e.target.value, "adjective")}`
);

fs.writeFileSync(panelPath, content);
console.log('✓ Added auto-vocabulary generation to ObjectsPanel');
