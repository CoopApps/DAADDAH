import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { DaadGame, PanelType, createDefaultGame } from "./types/daad";
import { useHistory } from "./hooks/useHistory";
import * as db from "./services/database";
import { normalizeGameState } from "./services/gameNormalizer";
import Sidebar from "./components/Sidebar";
import ProjectManager from "./components/ProjectManager";
import WelcomeScreen from "./components/WelcomeScreen";
import SearchPanel from "./components/SearchPanel";
import BackupManager from "./components/BackupManager";
import TemplateSelector from "./components/TemplateSelector";
import Toast from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";
import ErrorBoundary from "./components/ErrorBoundary";
import HelpSystem from "./components/help/HelpSystem";
import TutorialSystem from "./components/tutorial/TutorialSystem";
import { GameTemplate } from "./data/templates";
import * as api from "./api/tauri";
import { toBackendGame, toFrontendGame } from "./api/tauri";
import { AUTO_SAVE_DEBOUNCE, RESTORE_AUTO_SAVE_DELAY, STATUS_MESSAGE_DURATION, UNDO_STATUS_DURATION } from "./utils/constants";
import { useToast } from "./hooks/useToast";
import { launchAiAssistance, stopAiAssistance, checkAiStatus } from "./api/tauri";

// Lazy-loaded panels for code splitting
const GameInfoPanel = lazy(() => import("./components/panels/GameInfoPanel"));
const ValidationPanel = lazy(() => import("./components/panels/ValidationPanel"));
const StatisticsPanel = lazy(() => import("./components/panels/StatisticsPanel"));
const LocationsPanel = lazy(() => import("./components/panels/LocationsPanel"));
const ObjectsPanel = lazy(() => import("./components/panels/ObjectsPanel"));
const CharactersPanel = lazy(() => import("./components/panels/CharactersPanel"));
const FlagsPanel = lazy(() => import("./components/panels/FlagsPanel"));
const MessagesPanel = lazy(() => import("./components/panels/MessagesPanel"));
const MusicPanel = lazy(() => import("./components/panels/MusicPanel"));
const VocabularyPanel = lazy(() => import("./components/panels/VocabularyPanel"));
const RulesPanel = lazy(() => import("./components/panels/RulesPanel"));
const ExportPanel = lazy(() => import("./components/panels/ExportPanel"));
const CompilePanel = lazy(() => import("./components/panels/CompilePanel"));
const PreviewPanel = lazy(() => import("./components/panels/PreviewPanelCanvas"));
const MergePanel = lazy(() => import("./components/panels/MergePanel"));
const DebugPanel = lazy(() => import("./components/panels/DebugPanel"));
const GraphicsPanel = lazy(() => import("./components/panels/GraphicsPanel"));

/** Loading fallback for lazy-loaded panels */
function PanelLoading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      color: "var(--text-dim)"
    }}>
      Loading panel...
    </div>
  );
}

function App() {
  const historyResult = useHistory<DaadGame>(normalizeGameState(createDefaultGame()));
  const { state: game, set: setGameRaw, undo, redo, reset: resetGame, canUndo, canRedo } = historyResult;

  // Wrap setGame to ensure normalization on every update
  // NOTE: useHistory's `set` takes a direct value, not a function updater
  const setGame = useCallback((updater: DaadGame | ((prev: DaadGame) => DaadGame)) => {
    if (typeof updater === 'function') {
      // Function updater: get current state, normalize it, call updater, normalize result
      const normalized = normalizeGameState(game);
      const result = updater(normalized);
      const finalResult = normalizeGameState(result);
      setGameRaw(finalResult);
    } else {
      // Direct value: normalize and set
      setGameRaw(normalizeGameState(updater));
    }
  }, [game, setGameRaw]);

  const { toasts, hideToast, success, error, warning, info } = useToast();
  const [activePanel, setActivePanel] = useState<PanelType>("game-info");
  const [isDirty, setIsDirty] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [projectManagerMode, setProjectManagerMode] = useState<"save" | "load" | null>(null);
  const [selectItemId, setSelectItemId] = useState<number | undefined>(undefined);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null);
  const [aiActive, setAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Initialize database on mount and cleanup on unmount
  useEffect(() => {
    db.initDatabase().catch(err => {
      console.error('[Database] Failed to initialize:', err);
      error(`Database initialization failed: ${err instanceof Error ? err.message : 'Unknown error'}. Some features may not work.`);
    });

    // Cleanup on unmount
    return () => {
      db.closeDatabase().catch(err => {
        console.error('[Database] Failed to close:', err);
      });
    };
  }, [error]);
  // Listen for MCP/Claude updates from HTTP API
  useEffect(() => {
    let unlisten: (() => void) | null = null;

    // Listen for the simple signal that MCP changed the game
    // Then fetch fresh state from the API
    listen('mcp-game-changed', async () => {
      // debug: console.log('[MCP] Game changed signal received, fetching fresh state...');
      try {
        const response = await fetch('http://localhost:3042/api/game');
        if (response.ok) {
          const gameData = await response.json();
          // debug: console.log('[MCP] Fetched game state:', gameData);
          // Use toFrontendGame to convert from backend format (snake_case) to frontend format (camelCase)
          setGame(toFrontendGame(gameData));
          setShowWelcome(false);
          success('Game updated from Claude!');
        } else {
          console.error('[MCP] Failed to fetch game state:', response.status);
        }
      } catch (err) {
        console.error('[MCP] Failed to fetch game state:', err);
      }
    }).then(fn => {
      unlisten = fn;
    }).catch(err => {
      console.error('[MCP] Failed to setup event listener:', err);
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [setGame, setShowWelcome, success]);


  // Auto-save to SQLite database every time game changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      db.autoSave(game).catch(err => {
        console.error('[Database] Auto-save failed:', err);
        error(`Auto-save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      });
    }, AUTO_SAVE_DEBOUNCE);

    return () => clearTimeout(timer);
  }, [game, error]);

  // Sync game state to MCP API whenever it changes (for Claude/MCP integration)
  useEffect(() => {
    // Only sync if we have a valid game with a title (not default empty state)
    if (game.title && game.title.trim() !== '') {
      const backendGame = toBackendGame(game);
      invoke('sync_game_to_api', { game: backendGame }).catch(err => {
        console.error('[MCP] Failed to sync game to API:', err);
      });
    }
  }, [game]);

  // Manual auto-save restore function (no longer automatic on mount)
  const handleLoadAutoSave = async () => {
    try {
      const savedGame = await db.loadAutoSave();
      if (savedGame) {
        setConfirmDialog({
          message: "Auto-saved game found.\n\nRestore it?",
          onConfirm: () => {
            resetGame(normalizeGameState(savedGame));
            setShowWelcome(false);
            success("Auto-saved game restored");
          },
        });
      } else {
        info("No auto-save found");
      }
    } catch (err) {
      console.error('[Database] Failed to restore auto-save:', err);
      error(`Failed to restore auto-save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Show status message temporarily
  const showStatus = useCallback((message: string, duration = STATUS_MESSAGE_DURATION) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), duration);
  }, []);

  // Handle save to file
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage("Saving project...");
    try {
      const path = await api.saveGame(game);
      if (path) {
        setIsDirty(false);
        showStatus(`Saved: ${path}`);
      }
    } catch (err) {
      showStatus(`Error saving: ${err}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [game, showStatus]);

  // Handle save to database (via modal)
  const handleSaveToDatabase = useCallback(async (projectName: string) => {
    setIsLoading(true);
    setLoadingMessage("Saving to database...");
    try {
      const projectId = await db.saveProject(projectName, game);
      setIsDirty(false);
      setProjectManagerMode(null);
      showStatus(`Saved to database: ${projectName} (ID: ${projectId})`);
    } catch (err) {
      showStatus(`Error saving to database: ${err}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [game, showStatus]);

  // Handle load from database (via modal)
  const handleLoadFromDatabase = useCallback(async (projectId: number, projectName: string) => {
    setIsLoading(true);
    setLoadingMessage("Loading from database...");
    try {
      const loadedGame = await db.loadProject(projectId);

      if (loadedGame) {
        resetGame(normalizeGameState(loadedGame));
        setShowWelcome(false);
        setIsDirty(false);
        setProjectManagerMode(null);
        showStatus(`Loaded: ${projectName}`);
      }
    } catch (err) {
      showStatus(`Error loading from database: ${err}`);
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [resetGame, showStatus, setShowWelcome]);

  // Handle load
  const handleLoad = useCallback(async () => {
    const performLoad = async () => {
      setIsLoading(true);
      setLoadingMessage("Loading project...");
      try {
        const loadedGame = await api.loadGame();
        if (loadedGame) {
          resetGame(normalizeGameState(loadedGame));
          setIsDirty(false);
          setShowWelcome(false);
          success("Project loaded");
        }
      } catch (err) {
        error(`Error loading: ${err}`);
      } finally {
        setIsLoading(false);
        setLoadingMessage(null);
      }
    };

    // Check for unsaved changes
    if (isDirty) {
      setConfirmDialog({
        message: "You have unsaved changes. Loading a new project will discard them. Continue?",
        onConfirm: performLoad,
      });
    } else {
      await performLoad();
    }
  }, [isDirty, resetGame, success, error]);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessage("Validating project...");
    try {
      const warnings = await api.validateGame(game);

      const performExport = async () => {
        setIsLoading(true);
        setLoadingMessage("Exporting project...");
        try {
          const path = await api.exportDaadToFile(game);
          if (path) {
            showStatus(`Exported to: ${path}`);
          }
        } catch (err) {
          showStatus(`Error exporting: ${err}`);
        } finally {
          setIsLoading(false);
          setLoadingMessage(null);
        }
      };

      if (warnings.length > 0) {
        setIsLoading(false);
        setLoadingMessage(null);
        const warningList = warnings.slice(0, 5).join("\n• ");
        const moreWarnings = warnings.length > 5 ? `\n\n...and ${warnings.length - 5} more warnings.` : "";
        setConfirmDialog({
          message: `Your project has ${warnings.length} validation warning${warnings.length > 1 ? 's' : ''}:\n\n• ${warningList}${moreWarnings}\n\nDo you want to export anyway?`,
          onConfirm: performExport,
        });
      } else {
        await performExport();
      }
    } catch (err) {
      showStatus(`Error validating: ${err}`);
      setIsLoading(false);
      setLoadingMessage(null);
    }
  }, [game, showStatus]);

  const handleNewProject = useCallback(() => {
    const showTemplateSelector = () => {
      setShowTemplateSelector(true);
    };

    // Check for unsaved changes
    if (isDirty) {
      setConfirmDialog({
        message: "You have unsaved changes. Creating a new project will discard them. Continue?",
        onConfirm: showTemplateSelector,
      });
    } else {
      showTemplateSelector();
    }
  }, [isDirty]);

  const handleTemplateSelect = useCallback((template: GameTemplate) => {
    resetGame(normalizeGameState(template.game));
    setIsDirty(false);
    setShowWelcome(false);
    showStatus(`Created from template: ${template.name}`);
  }, [resetGame, showStatus]);

  // Track dirty state when game changes
  const updateGame = useCallback((newGame: DaadGame | ((prev: DaadGame) => DaadGame)) => {
    // Always use functional update form to avoid stale closures
    setGame(newGame);
    setIsDirty(true);
  }, [setGame]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          if (canUndo) {
            undo();
            showStatus("Undo", UNDO_STATUS_DURATION);
          }
        } else if (e.key === "z" && e.shiftKey) {
          e.preventDefault();
          if (canRedo) {
            redo();
            showStatus("Redo", UNDO_STATUS_DURATION);
          }
        } else if (e.key === "n") {
          e.preventDefault();
          handleNewProject();
        } else if (e.key === "s") {
          e.preventDefault();
          handleSave();
        } else if (e.key === "o") {
          e.preventDefault();
          handleLoad();
        } else if (e.key === "e") {
          e.preventDefault();
          handleExport();
        } else if (e.key === "f") {
          e.preventDefault();
          setSearchOpen(true);
        } else if (e.key === "b") {
          e.preventDefault();
          setShowBackupManager(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave, handleLoad, handleExport, handleNewProject, undo, redo, canUndo, canRedo, showStatus]);

  // Check AI status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkAiStatus();
        setAiActive(status);
      } catch {
        setAiActive(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle AI assistance toggle
  const handleAiToggle = useCallback(async () => {
    setAiLoading(true);
    try {
      if (aiActive) {
        const result = await stopAiAssistance();
        setAiActive(false);
        success(result);
      } else {
        const result = await launchAiAssistance();
        setAiActive(true);
        success(result);
      }
    } catch (err) {
      error(`AI Assistance error: ${err}`);
    } finally {
      setAiLoading(false);
    }
  }, [aiActive, success, error]);

  const handleLoadFromWelcome = useCallback(async () => {
    await handleLoad();
  }, [handleLoad]);

  const renderPanel = () => {
    switch (activePanel) {
      case "game-info":
        return <GameInfoPanel game={game} setGame={updateGame} onNavigateToPanel={(panel) => setActivePanel(panel as PanelType)} />;
      case "locations":
        return <LocationsPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "objects":
        return <ObjectsPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "characters":
        return <CharactersPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "flags":
        return <FlagsPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "messages":
        return <MessagesPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "music":
        return <MusicPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "vocabulary":
        return <VocabularyPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "rules":
        return <RulesPanel game={game} setGame={updateGame} selectItemId={selectItemId} />;
      case "preview":
        return <PreviewPanel game={game} />;
      case "validation":
        return <ValidationPanel game={game} setGame={updateGame} onNavigate={(panel, itemId) => {
          setActivePanel(panel as PanelType);
          setSelectItemId(itemId);
        }} />;
      case "statistics":
        return <StatisticsPanel game={game} />;
      case "export":
        return <ExportPanel game={game} />;
      case "compile":
        return <CompilePanel game={game} />;
      case "merge":
        return <MergePanel game={game} setGame={updateGame} />;
      case "debug":
        return <DebugPanel game={game} setGame={updateGame} />;
      case "graphics":
        return <GraphicsPanel game={game} setGame={updateGame} onNavigateToPanel={(panel, itemId) => { setActivePanel(panel as any); if (itemId !== undefined) setSelectItemId(itemId); }} />;
      default:
        return null;
    }
  };

  const getPanelTitle = (): string => {
    const titles: Record<PanelType, string> = {
      "game-info": "Story Information",
      locations: "Room Editor",
      objects: "Item Editor",
      characters: "Character Editor",
      rules: "Response Editor",
      vocabulary: "Word Dictionary",
      flags: "Variable Manager",
      messages: "Text Editor",
      music: "Music Editor",
      preview: "Play Test",
      graphics: "Graphics Preview",
      statistics: "Statistics",
      validation: "Validate Game",
      export: "Export Game",
      compile: "Compile Game",
      merge: "Merge Data",
      debug: "Debug Tools",
    };
    return titles[activePanel];
  };

  if (showWelcome) {
    return (
      <>
        <WelcomeScreen onNewProject={handleNewProject} onLoadProject={handleLoadFromWelcome} />
        {/* Template Selector must be rendered even on welcome screen */}
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={handleTemplateSelect}
        />
        {/* Confirm Dialog for unsaved changes */}
        <ConfirmDialog
          isOpen={!!confirmDialog}
          message={confirmDialog?.message || ""}
          onConfirm={confirmDialog?.onConfirm || (() => {})}
          onCancel={() => {
            confirmDialog?.onCancel?.();
            setConfirmDialog(null);
          }}
          type="warning"
        />
      </>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <span className="logo">DAAD BUILDER</span>
          <span className="logo-sub">
            v0.1.0 // {game.title}{isDirty ? " *" : ""}
          </span>
        </div>
        <div className="toolbar">
          <button
            className="toolbar-btn"
            title="Undo (Ctrl+Z)"
            onClick={() => {
              undo();
              showStatus("Undo", UNDO_STATUS_DURATION);
            }}
            disabled={!canUndo}
            style={{ opacity: canUndo ? 1 : 0.4 }}
          >
            ↶
          </button>
          <button
            className="toolbar-btn"
            title="Redo (Ctrl+Shift+Z)"
            onClick={() => {
              redo();
              showStatus("Redo", UNDO_STATUS_DURATION);
            }}
            disabled={!canRedo}
            style={{ opacity: canRedo ? 1 : 0.4 }}
          >
            ↷
          </button>
          <button className="toolbar-btn" title="Search (Ctrl+F)" onClick={() => setSearchOpen(true)}>
            🔍
          </button>
          <button className="toolbar-btn" title="New Project (Ctrl+N)" onClick={handleNewProject}>
            New
          </button>
          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />
          <button className="toolbar-btn" title="Load from File (Ctrl+O)" onClick={handleLoad}>
            📂 Load File
          </button>
          <button className="toolbar-btn" title="Save to File (Ctrl+S)" onClick={handleSave}>
            💾 Save File{isDirty ? " *" : ""}
          </button>
          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />
          <button className="toolbar-btn" title="Load from Database" onClick={() => setProjectManagerMode("load")}>
            📚 Load DB
          </button>
          <button className="toolbar-btn" title="Save to Database" onClick={() => setProjectManagerMode("save")}>
            💿 Save DB
          </button>
          <button className="toolbar-btn" title="Load Auto-save" onClick={handleLoadAutoSave}>
            ⏮️ Auto-save
          </button>
          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />
          <button className="toolbar-btn" title="Backup Manager (Ctrl+B)" onClick={() => setShowBackupManager(true)}>
            💾 Backups
          </button>
          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />
          <button className="toolbar-btn" title="Export DAAD (Ctrl+E)" onClick={handleExport}>
            Export
          </button>
          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />
          <button
            className={`toolbar-btn ai-btn ${aiActive ? "ai-active" : ""}`}
            title={aiActive ? "AI Assistance Active - Click to stop" : "Launch AI Assistance (Claude Desktop)"}
            onClick={handleAiToggle}
            disabled={aiLoading}
          >
            {aiLoading ? "..." : aiActive ? "🤖 AI Active" : "🤖 AI Assist"}
          </button>
        </div>
      </header>

      {/* Status Bar */}
      {statusMessage && (
        <div className="status-bar">
          {statusMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <Sidebar activePanel={activePanel} onPanelChange={setActivePanel} />

        <div className="panel-area">
          <div className="panel-header">
            <h2 className="panel-title">{getPanelTitle()}</h2>
          </div>
          <ErrorBoundary
            onError={(err, errorInfo) => {
              error(`Panel error: ${err.message}`);
              console.error("[Panel Error]", err, errorInfo);
            }}
          >
            <Suspense fallback={<PanelLoading />}>
              {renderPanel()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Global Search */}
      <SearchPanel
        game={game}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={(panel, id) => {
          setActivePanel(panel);
          setSelectItemId(id);
          setSearchOpen(false);
        }}
      />

      {/* Project Manager Modal */}
      {projectManagerMode && (
        <ProjectManager
          mode={projectManagerMode}
          currentProjectName={game.title}
          onSave={handleSaveToDatabase}
          onLoad={handleLoadFromDatabase}
          onClose={() => setProjectManagerMode(null)}
          onConfirm={(message, onConfirm) => {
            setConfirmDialog({
              message,
              onConfirm,
            });
          }}
          onError={error}
          onSuccess={success}
        />
      )}

      {/* Backup Manager */}
      <BackupManager
        isOpen={showBackupManager}
        onClose={() => setShowBackupManager(false)}
        game={game}
        setGame={(newGame) => {
          resetGame(normalizeGameState(newGame));
          setIsDirty(false);
        }}
        projectName={game.title}
        onConfirm={(message, onConfirm) => {
          setConfirmDialog({
            message,
            onConfirm,
          });
        }}
        onError={error}
        onSuccess={success}
      />

      {/* Template Selector */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelect={handleTemplateSelect}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDialog}
        message={confirmDialog?.message || ""}
        onConfirm={confirmDialog?.onConfirm || (() => {})}
        onCancel={() => {
          confirmDialog?.onCancel?.();
          setConfirmDialog(null);
        }}
        type="warning"
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Loading"
        >
          <div
            style={{
              fontFamily: "'Press Start 2P'",
              fontSize: 14,
              color: "var(--green-bright)",
              textShadow: "0 0 10px var(--green-bright)",
              animation: "pulse 1s infinite",
            }}
          >
            {loadingMessage || "Loading..."}
          </div>
          <div
            style={{
              marginTop: 20,
              width: 200,
              height: 8,
              backgroundColor: "var(--bg-secondary)",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "var(--green-bright)",
                animation: "loadingBar 1.5s ease-in-out infinite",
              }}
            />
          </div>
        </div>
      )}

      {/* Help System */}
      <HelpSystem currentPanel={activePanel} />

      {/* Tutorial System */}
      <TutorialSystem
        onNavigate={setActivePanel}
        currentPanel={activePanel}
      />
    </div>
  );
}

export default App;
