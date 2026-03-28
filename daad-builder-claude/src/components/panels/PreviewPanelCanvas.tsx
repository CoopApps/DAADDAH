import { useState, useRef, useEffect, useCallback } from "react";
import { DaadGame } from "../../types/daad";
import { processCommand, executePRO2, GameState, EngineContext } from "../../engine/ruleEngine";
import { DEFAULT_AUTO_WALK_SPEED } from "../../utils/constants";
import { PlatformId, PLATFORMS, PLATFORM_LIST } from "../../types/platforms";
import CanvasGameDisplay, { GameDisplayContext } from "./CanvasGameDisplay";

interface PreviewPanelProps {
  game: DaadGame;
}

export default function PreviewPanelCanvas({ game }: PreviewPanelProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentLocation: 0,
    inventory: [],
    flags: new Map((game.flags || []).map(f => [f.id, f.initialValue])),
    messages: [],
    gameOver: false,
    objectLocations: new Map(),
  });
  const [showingIntro, setShowingIntro] = useState(true);
  const [input, setInput] = useState("");
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const [autoWalkQueue, setAutoWalkQueue] = useState<string[]>([]);
  const [autoWalkSpeed, setAutoWalkSpeed] = useState<number>(DEFAULT_AUTO_WALK_SPEED);
  const autoWalkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("msdos");
  const [zoom, setZoom] = useState<number>(2);
  const displayContextRef = useRef<GameDisplayContext | null>(null);

  // Initialize game
  useEffect(() => {
    resetGame();
  }, [game]);

  // Auto-walkthrough queue processor
  useEffect(() => {
    if (!isAutoWalking || autoWalkQueue.length === 0) {
      if (isAutoWalking && autoWalkQueue.length === 0) {
        setIsAutoWalking(false);
        addOutput("\n=== AUTO-WALKTHROUGH COMPLETE ===\n");
      }
      return;
    }

    const timeoutId = setTimeout(() => {
      const [nextCommand, ...remainingCommands] = autoWalkQueue;
      console.log(`[AUTO-WALKTHROUGH] Executing: "${nextCommand}" (${remainingCommands.length} remaining)`);

      handleCommand(nextCommand);
      setAutoWalkQueue(remainingCommands);
    }, autoWalkSpeed);

    autoWalkTimeoutRef.current = timeoutId;

    return () => {
      clearTimeout(timeoutId);
      if (autoWalkTimeoutRef.current) {
        clearTimeout(autoWalkTimeoutRef.current);
        autoWalkTimeoutRef.current = null;
      }
    };
  }, [isAutoWalking, autoWalkQueue, autoWalkSpeed]);

  const resetGame = () => {
    const initialState: GameState = {
      currentLocation: 0,
      inventory: [],
      flags: new Map((game.flags || []).map(f => [f.id, f.initialValue])),
      messages: [],
      gameOver: false,
      objectLocations: new Map(),
    };
    setGameState(initialState);
    setShowingIntro(true);

    // Clear canvas
    if (displayContextRef.current) {
      displayContextRef.current.clear();
    }

    displayWelcome();
  };

  const saveGameState = (slot: number = 0) => {
    try {
      const saveData = {
        gameState: {
          currentLocation: gameState.currentLocation,
          inventory: gameState.inventory,
          flags: Array.from(gameState.flags.entries()),
          messages: gameState.messages,
          gameOver: gameState.gameOver,
          objectLocations: Array.from(gameState.objectLocations.entries()),
        },
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(`daad_save_slot_${slot}`, JSON.stringify(saveData));
      addOutput(`\n[Game saved to slot ${slot}]`);
      return true;
    } catch (err) {
      addOutput(`\n[Error saving game: ${err}]`);
      return false;
    }
  };

  const loadGameState = (slot: number = 0) => {
    try {
      const saveDataStr = localStorage.getItem(`daad_save_slot_${slot}`);
      if (!saveDataStr) {
        addOutput(`\n[No saved game in slot ${slot}]`);
        return false;
      }

      const saveData = JSON.parse(saveDataStr);
      const loadedState: GameState = {
        currentLocation: saveData.gameState.currentLocation,
        inventory: saveData.gameState.inventory,
        flags: new Map(saveData.gameState.flags),
        messages: saveData.gameState.messages,
        gameOver: saveData.gameState.gameOver,
        objectLocations: new Map(saveData.gameState.objectLocations),
      };

      setGameState(loadedState);

      if (displayContextRef.current) {
        displayContextRef.current.clear();
      }

      addOutput(`\n[Game loaded from slot ${slot}]`);
      describeLocationById(loadedState.currentLocation);
      return true;
    } catch (err) {
      addOutput(`\n[Error loading game: ${err}]`);
      return false;
    }
  };

  const displayWelcome = () => {
    if (game.introText && showingIntro) {
      addOutput(game.introText);
      addOutput("\n\n[Press Enter to begin]");
      return;
    }
    setShowingIntro(false);
    addOutput(`\n${game.title || "Untitled Adventure"}`);
    addOutput(`By ${game.author || "Unknown"}\n`);
    describeLocation();
  };

  const describeLocationById = (locationId: number) => {
    const loc = (game.locations || []).find(l => l.id === locationId);
    if (!loc) {
      addOutput("You are nowhere.");
      return;
    }

    // Display location image if available
    if (loc.image && displayContextRef.current) {
      const platform = PLATFORMS[selectedPlatform];
      const platformImages = loc.image.platformImages;

      if (platformImages && platformImages[selectedPlatform]) {
        const platformImage = platformImages[selectedPlatform];
        if (platformImage.imageData) {
          // Draw platform-specific image
          displayContextRef.current.drawPlatformImage(
            platformImage.imageData,
            loc.image.yPosition || 0
          );
        }
      }
    }

    addOutput(`\n${loc.name}`);
    addOutput(loc.description);

    // List objects at location
    const objectsHere = (game.objects || []).filter(obj => {
      const objLocation = gameState.objectLocations.get(obj.id) || obj.location;
      return objLocation.type === "at" && objLocation.locationId === locationId;
    });

    if (objectsHere.length > 0) {
      addOutput("\nYou can see:");
      objectsHere.forEach(obj => {
        const name = obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun;
        addOutput(`  ${name}`);
      });
    }

    // List characters (PSI) at location
    const charactersHere = (game.objects || []).filter(obj => {
      if (!obj.isPSI) return false;
      const objLocation = gameState.objectLocations.get(obj.id) || obj.location;
      return objLocation.type === "at" && objLocation.locationId === locationId;
    });

    if (charactersHere.length > 0) {
      charactersHere.forEach(char => {
        const name = char.adjective ? `${char.adjective} ${char.noun}` : char.noun;
        addOutput(`  ${name} is here.`);
      });
    }

    // List exits
    const exits: string[] = [];
    (Object.keys(loc.exits) as Array<keyof typeof loc.exits>).forEach(dir => {
      if (loc.exits[dir] !== null) {
        exits.push(dir);
      }
    });
    if (exits.length > 0) {
      addOutput(`\nExits: ${exits.join(", ")}`);
    }
  };

  const describeLocation = () => {
    describeLocationById(gameState.currentLocation);
  };

  const addOutput = (text: string) => {
    if (displayContextRef.current) {
      displayContextRef.current.writeText(text + "\n");
      displayContextRef.current.present();
    }
  };

  const handleCommand = (cmd: string) => {
    // Handle intro screen
    if (showingIntro && game.introText) {
      setShowingIntro(false);
      if (displayContextRef.current) {
        displayContextRef.current.clear();
      }
      setInput("");
      describeLocation();
      return;
    }

    if (!cmd.trim()) return;

    // Show user input
    addOutput(`> ${cmd}`);
    setInput("");

    // Create engine context
    const context: EngineContext = {
      game,
      state: gameState,
      setState: setGameState,
      addOutput
    };

    // Try to process command through rule engine
    const handled = processCommand(cmd, context);

    // After rule processing, check if DESC action was called
    setTimeout(() => {
      executePRO2({ game, state: gameState, setState: setGameState, addOutput });
    }, 0);

    // If no rule handled it, fall back to built-in commands
    if (!handled) {
      const words = cmd.toLowerCase().trim().split(/\s+/);
      const verb = words[0];
      const noun = words.slice(1).join(" ");

      // Direction mapping
      const directionMap: Record<string, string> = {
        "n": "north", "north": "north",
        "s": "south", "south": "south",
        "e": "east", "east": "east",
        "w": "west", "west": "west",
        "ne": "northeast", "northeast": "northeast",
        "nw": "northwest", "northwest": "northwest",
        "se": "southeast", "southeast": "southeast",
        "sw": "southwest", "southwest": "southwest",
        "u": "up", "up": "up",
        "d": "down", "down": "down",
        "in": "in",
        "out": "out",
      };

      // Movement
      const direction = directionMap[verb];
      if (direction) {
        const loc = (game.locations || []).find(l => l.id === gameState.currentLocation);
        if (loc) {
          const targetId = loc.exits[direction as keyof typeof loc.exits];
          if (targetId !== null && targetId !== undefined) {
            setGameState(prev => ({ ...prev, currentLocation: targetId }));
            setTimeout(() => {
              executePRO2({ game, state: { ...gameState, currentLocation: targetId }, setState: setGameState, addOutput });
              describeLocationById(targetId);
            }, 0);
            return;
          } else {
            addOutput("You can't go that way.");
            return;
          }
        }
      }

      // Look
      if (verb === "look" || verb === "l") {
        describeLocation();
        return;
      }

      // Save/Load
      if (verb === "save") {
        const slot = words[1] ? parseInt(words[1]) : 0;
        if (isNaN(slot) || slot < 0 || slot > 9) {
          addOutput("Usage: SAVE [0-9] (default slot 0)");
        } else {
          saveGameState(slot);
        }
        return;
      }

      if (verb === "load") {
        const slot = words[1] ? parseInt(words[1]) : 0;
        if (isNaN(slot) || slot < 0 || slot > 9) {
          addOutput("Usage: LOAD [0-9] (default slot 0)");
        } else {
          loadGameState(slot);
        }
        return;
      }

      // Inventory
      if (verb === "inventory" || verb === "i") {
        if (gameState.inventory.length === 0) {
          addOutput("You are carrying nothing.");
        } else {
          addOutput("You are carrying:");
          gameState.inventory.forEach(objId => {
            const obj = (game.objects || []).find(o => o.id === objId);
            if (obj) {
              const name = obj.adjective ? `${obj.adjective} ${obj.noun}` : obj.noun;
              addOutput(`  ${name}`);
            }
          });
        }
        return;
      }

      // Examine
      if (verb === "examine" || verb === "x") {
        const obj = (game.objects || []).find(o => {
          if (!(o.noun.toLowerCase() === noun || (o.adjective && o.adjective.toLowerCase() === noun))) {
            return false;
          }
          const objLocation = gameState.objectLocations.get(o.id) || o.location;
          return (objLocation.type === "at" && objLocation.locationId === gameState.currentLocation) ||
                 gameState.inventory.includes(o.id);
        });
        if (obj) {
          addOutput(obj.description);
        } else {
          addOutput("You don't see that here.");
        }
        return;
      }

      // Get/Take
      if (verb === "get" || verb === "take") {
        const obj = (game.objects || []).find(o =>
          (o.noun.toLowerCase() === noun || (o.adjective && o.adjective.toLowerCase() === noun)) &&
          o.isTakeable
        );

        if (!obj) {
          addOutput("You don't see that here, or you can't take it.");
          return;
        }

        if (gameState.inventory.includes(obj.id)) {
          addOutput("You already have that.");
          return;
        }

        const objLocation = gameState.objectLocations.get(obj.id) || obj.location;
        if (!(objLocation.type === "at" && objLocation.locationId === gameState.currentLocation)) {
          addOutput("You don't see that here.");
          return;
        }

        const newObjectLocations = new Map(gameState.objectLocations);
        newObjectLocations.set(obj.id, { type: "carried" });
        setGameState(prev => ({
          ...prev,
          inventory: [...prev.inventory, obj.id],
          objectLocations: newObjectLocations
        }));
        addOutput(`You take the ${obj.adjective ? obj.adjective + ' ' : ''}${obj.noun}.`);
        return;
      }

      // Drop
      if (verb === "drop") {
        const obj = (game.objects || []).find(o =>
          (o.noun.toLowerCase() === noun || (o.adjective && o.adjective.toLowerCase() === noun)) &&
          gameState.inventory.includes(o.id)
        );
        if (obj) {
          const newObjectLocations = new Map(gameState.objectLocations);
          newObjectLocations.set(obj.id, { type: "at", locationId: gameState.currentLocation });
          setGameState(prev => ({
            ...prev,
            inventory: prev.inventory.filter(id => id !== obj.id),
            objectLocations: newObjectLocations
          }));
          addOutput(`You drop the ${obj.adjective ? obj.adjective + ' ' : ''}${obj.noun}.`);
        } else {
          addOutput("You're not carrying that.");
        }
        return;
      }

      // Help
      if (verb === "help") {
        addOutput("\nAvailable commands:");
        addOutput("  NORTH, SOUTH, EAST, WEST (N, S, E, W)");
        addOutput("  UP, DOWN, IN, OUT");
        addOutput("  LOOK (L) - Look around");
        addOutput("  EXAMINE (X) <object> - Examine something");
        addOutput("  GET/TAKE <object> - Pick up an object");
        addOutput("  DROP <object> - Drop an object");
        addOutput("  INVENTORY (I) - List what you're carrying");
        addOutput("  HELP - Show this help");
        return;
      }

      addOutput("I don't understand that command. Type HELP for commands.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
  };

  const autoWalkthrough = () => {
    if (isAutoWalking) {
      setIsAutoWalking(false);
      setAutoWalkQueue([]);
      addOutput("\n=== AUTO-WALKTHROUGH STOPPED ===\n");
      return;
    }

    if (showingIntro && game.introText) {
      setShowingIntro(false);
      if (displayContextRef.current) {
        displayContextRef.current.clear();
      }
      describeLocation();
    }

    addOutput("\n=== AUTO-WALKTHROUGH STARTED ===\n");

    const commandQueue: string[] = game.walkthrough && game.walkthrough.length > 0
      ? game.walkthrough
      : ["look", "inventory", "help"];

    setAutoWalkQueue(commandQueue);
    setIsAutoWalking(true);
  };

  const handleCanvasReady = useCallback((context: GameDisplayContext) => {
    displayContextRef.current = context;

    // Display welcome when canvas is ready
    if (game.introText && showingIntro) {
      context.writeText(game.introText + "\n\n[Press Enter to begin]\n");
      context.present();
    }
  }, [game.introText, showingIntro]);

  const platform = PLATFORMS[selectedPlatform];
  const displayWidth = platform.resolution.width * zoom;

  return (
    <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        {/* Control Bar */}
        <div style={{ marginBottom: 12, display: "flex", gap: 8, width: "100%", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={resetGame}>
            Restart Game
          </button>
          <button
            className={isAutoWalking ? "btn btn-danger" : "btn btn-secondary"}
            onClick={autoWalkthrough}
            title={isAutoWalking ? "Stop auto-walkthrough" : "Test all interactions automatically"}
          >
            {isAutoWalking ? "⏸ Stop Auto" : "▶ Auto Walkthrough"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-dim)" }}>Speed:</label>
            <input
              type="range"
              min="500"
              max="3000"
              step="500"
              value={autoWalkSpeed}
              onChange={(e) => setAutoWalkSpeed(Number(e.target.value))}
              style={{ width: 100 }}
              title={`${autoWalkSpeed}ms between commands`}
            />
            <span style={{ fontSize: 11, color: "var(--text-dim)", minWidth: 60 }}>
              {autoWalkSpeed < 1000 ? "Fast" : autoWalkSpeed < 2000 ? "Medium" : "Slow"}
            </span>
          </div>

          <div style={{ borderLeft: "1px solid var(--border-color)", height: 20, margin: "0 8px" }} />

          {/* Platform Selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: "bold" }}>Platform:</label>
            <select
              className="form-input form-select"
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformId)}
              style={{ fontSize: 11, padding: "4px 8px" }}
            >
              {PLATFORM_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </div>

          {/* Zoom Control */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: "bold" }}>Zoom:</label>
            <select
              className="form-input form-select"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              style={{ fontSize: 11, padding: "4px 8px", width: 80 }}
            >
              <option value="1">100%</option>
              <option value="1.5">150%</option>
              <option value="2">200%</option>
              <option value="2.5">250%</option>
              <option value="3">300%</option>
            </select>
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Platform Info */}
          <div style={{ fontSize: 10, color: "var(--text-dim)", textAlign: "right" }}>
            {platform.resolution.width}×{platform.resolution.height} • {platform.paletteSize} colors
          </div>
        </div>

        {/* Canvas Game Display */}
        <div style={{ marginBottom: 12 }}>
          <CanvasGameDisplay
            platform={platform}
            zoom={zoom}
            onReady={handleCanvasReady}
          />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, width: displayWidth }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--cyan-bright)",
              fontFamily: "'Share Tech Mono', monospace"
            }}>
              &gt;
            </span>
            <input
              type="text"
              className="form-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your command here..."
              autoFocus
              style={{
                paddingLeft: 30,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 13
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>

        <div style={{ marginTop: 12, padding: 12, backgroundColor: "var(--bg-dark)", borderRadius: 4, fontSize: 11, color: "var(--text-dim)", width: displayWidth }}>
          <strong>Platform Mode:</strong> Testing on {platform.displayName} ({platform.resolution.width}×{platform.resolution.height}, {platform.colorDepth}-bit color)
          <br />
          <strong>Restrictions:</strong> {platform.restrictions.description}
        </div>
      </div>
    </div>
  );
}
