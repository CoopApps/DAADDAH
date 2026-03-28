const fs = require('fs');

const previewPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/PreviewPanel.tsx';
let content = fs.readFileSync(previewPath, 'utf8');

// 1. Add showingIntro state
if (!content.includes('showingIntro')) {
  content = content.replace(
    /(const \[input, setInput\] = useState\(""\);)/,
    `const [showingIntro, setShowingIntro] = useState(true);\n  $1`
  );
  console.log('✓ Added showingIntro state');
}

// 2. Update resetGame to show intro
content = content.replace(
  /(const resetGame = \(\) => \{[\s\S]*?setGameState\(initialState\);[\s\S]*?setHistory\(\[\]\);)/,
  `$1\n    setShowingIntro(true);`
);

// 3. Update displayWelcome to check for intro
content = content.replace(
  /(const displayWelcome = \(\) => \{)/,
  `$1\n    if (game.introText && showingIntro) {\n      addOutput(game.introText);\n      addOutput("\\n\\n[Press Enter to begin]");\n      return;\n    }\n    setShowingIntro(false);`
);

// 4. Update handleCommand to handle intro
content = content.replace(
  /(const handleCommand = \(cmd: string\) => \{[\s\S]*?setInput\(""\);)/,
  `$1\n\n    // Handle intro screen\n    if (showingIntro && game.introText) {\n      setShowingIntro(false);\n      setHistory([]);\n      describeLocation();\n      return;\n    }`
);

fs.writeFileSync(previewPath, content);
console.log('✓ Updated PreviewPanel with intro text handling');
