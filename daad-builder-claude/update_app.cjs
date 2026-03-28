const fs = require('fs');
const path = require('path');

// Read the current App.tsx
const appPath = 'D:/projects/daadah/daad-builder-ui/src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Add WelcomeScreen import
content = content.replace(
  'import * as api from "./api/tauri";',
  'import WelcomeScreen from "./components/WelcomeScreen";\nimport * as api from "./api/tauri";'
);

// Add showWelcome state after other useState declarations
content = content.replace(
  'const [statusMessage, setStatusMessage] = useState<string | null>(null);',
  'const [statusMessage, setStatusMessage] = useState<string | null>(null);\n  const [showWelcome, setShowWelcome] = useState(true);'
);

// Modify handleLoad to hide welcome screen
content = content.replace(
  'if (loadedGame) {\n        setGame(loadedGame);\n        setIsDirty(false);\n        showStatus("Project loaded");',
  'if (loadedGame) {\n        setGame(loadedGame);\n        setIsDirty(false);\n        setShowWelcome(false);\n        showStatus("Project loaded");'
);

// Add keyboard shortcuts for Ctrl+N
content = content.replace(
  '// Keyboard shortcuts\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      if (e.ctrlKey || e.metaKey) {\n        if (e.key === "s") {',
  '// Keyboard shortcuts\n  useEffect(() => {\n    const handleKeyDown = (e: KeyboardEvent) => {\n      if (e.ctrlKey || e.metaKey) {\n        if (e.key === "n") {\n          e.preventDefault();\n          handleNewProject();\n        } else if (e.key === "s") {'
);

// Add handleNewProject function before renderPanel
content = content.replace(
  'const renderPanel = () => {',
  `const handleNewProject = useCallback(() => {
    setGame(createDefaultGame());
    setIsDirty(false);
    setShowWelcome(false);
    showStatus("New project created");
  }, [showStatus]);

  const handleLoadFromWelcome = useCallback(async () => {
    await handleLoad();
  }, [handleLoad]);

  const renderPanel = () => {`
);

// Wrap the return statement to conditionally show welcome screen
content = content.replace(
  'return (\n    <div className="app-container">',
  'if (showWelcome) {\n    return <WelcomeScreen onNewProject={handleNewProject} onLoadProject={handleLoadFromWelcome} />;\n  }\n\n  return (\n    <div className="app-container">'
);

fs.writeFileSync(appPath, content);
console.log('App.tsx updated with Welcome Screen');
