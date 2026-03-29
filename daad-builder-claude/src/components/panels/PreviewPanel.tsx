import { useState, useRef, useEffect } from "react";
import { DaadGame } from "../../types/daad";
import { processCommand, executePRO2, GameState, EngineContext } from "../../engine/ruleEngine";
import { DEFAULT_AUTO_WALK_SPEED } from "../../utils/constants";
import { PlatformId, PLATFORMS, PLATFORM_LIST } from "../../types/platforms";

interface PreviewPanelProps {
  game: DaadGame;
}

export default function PreviewPanel({ game }: PreviewPanelProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentLocation: 0,
    inventory: [],
    flags: new Map((game.flags || []).map(f => [f.id, f.initialValue])),
    messages: [],
    gameOver: false,
    objectLocations: new Map(), // Initialize empty, will use game object locations as defaults
  });
  const [showingIntro, setShowingIntro] = useState(true);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Array<{ type: "output" | "input" | "image"; text: string; imageData?: string }>>([]);
  const outputRef = useRef<HTMLDivElement>(null);
  const [isAutoWalking, setIsAutoWalking] = useState(false);
  const [autoWalkQueue, setAutoWalkQueue] = useState<string[]>([]);
  const [autoWalkSpeed, setAutoWalkSpeed] = useState<number>(DEFAULT_AUTO_WALK_SPEED);
  const autoWalkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("msdos");
  const [zoom, setZoom] = useState<number>(2);

  // Initialize game
  useEffect(() => {
    // Debug: Check game structure
    console.log("[PREVIEW] Game loaded, checking location structure:");
    const loc1 = (game.locations || []).find(l => l.id === 1);
    if (loc1) {
      console.log("  Location 1 name:", loc1.name);
      console.log("  Location 1 exits:", loc1.exits);
      console.log("  Has 'in' exit:", loc1.exits?.in);
      console.log("  Has 'connections' property:", ('connections' in loc1));
    }
    resetGame();
  }, [game]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-walkthrough queue processor
  useEffect(() => {
    if (!isAutoWalking || autoWalkQueue.length === 0) {
      if (isAutoWalking && autoWalkQueue.length === 0) {
        // Queue is empty, walkthrough complete
        setIsAutoWalking(false);
        addOutput("\n=== AUTO-WALKTHROUGH COMPLETE ===\n");
      }
      return;
    }

    // Process next command in queue
    const timeoutId = setTimeout(() => {
      const [nextCommand, ...remainingCommands] = autoWalkQueue;
      console.log(`[AUTO-WALKTHROUGH] Executing: "${nextCommand}" (${remainingCommands.length} remaining)`);

      handleCommand(nextCommand);
      setAutoWalkQueue(remainingCommands);
    }, autoWalkSpeed);

    // Store timeout ref for cleanup
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
      objectLocations: new Map(), // Initialize empty, will use game object locations as defaults
    };
    setGameState(initialState);
    setHistory([]);
    setShowingIntro(true);
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
        history: history,
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
      setHistory(saveData.history || []);
      addOutput(`\n[Game loaded from slot ${slot}]`);
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

    console.log(`=== DESCRIBING LOCATION ${loc.id}: ${loc.name} ===`);
    console.log("Exits data:", JSON.stringify(loc.exits, null, 2));

    // Display location image if available
    if (loc.image && loc.image.sourceData) {
      addImage(loc.image.sourceData);
    }

    addOutput(`\n${loc.name}`);
    addOutput(loc.description);

    // List objects at location (check state map first, fall back to game object location)
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

    // List characters (PSI) at location (check state map first)
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
    setHistory(prev => [...prev, { type: "output", text }]);
  };

  const addImage = (imageData: string) => {
    setHistory(prev => [...prev, { type: "image", text: "", imageData }]);
  };

  const handleCommand = (cmd: string) => {
    // Handle intro screen - allow empty input (just Enter key)
    if (showingIntro && game.introText) {
      setShowingIntro(false);
      setHistory([]);
      setInput("");
      describeLocation();
      return;
    }

    if (!cmd.trim()) return;

    setHistory(prev => [...prev, { type: "input", text: `> ${cmd}` }]);
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

    // After rule processing, check if DESC action was called (GOTO happened)
    // DESC is used after GOTO to describe the new location
    setTimeout(() => {
      setHistory(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry?.type === "output" && lastEntry.text === "[DESC]") {
          // Remove [DESC] marker
          const newHistory = prev.slice(0, -1);
          setHistory(newHistory);

          // Wait for state to update, then execute PRO2 and describe
          setTimeout(() => {
            executePRO2({ game, state: gameState, setState: setGameState, addOutput });
            describeLocation();
          }, 10);

          return newHistory;
        } else {
          // No GOTO happened, execute PRO2 normally
          executePRO2(context);
        }
        return prev;
      });
    }, 0);

    // If no rule handled it, fall back to built-in commands
    if (!handled) {
      const words = cmd.toLowerCase().trim().split(/\s+/);
      const verb = words[0];
      const noun = words.slice(1).join(" ");

      // Map common abbreviations to full direction names
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

      // Basic movement commands
      const direction = directionMap[verb];
      if (direction) {
        const loc = (game.locations || []).find(l => l.id === gameState.currentLocation);
        if (loc) {
          const targetId = loc.exits[direction as keyof typeof loc.exits];
          console.log(`Movement: from location ${loc.id} (${loc.name}) going ${direction} to target ${targetId}`);
          console.log("All exits:", loc.exits);
          if (targetId !== null && targetId !== undefined) {
            setGameState(prev => ({ ...prev, currentLocation: targetId }));
            // Execute PRO2 after movement
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

      // Save game
      if (verb === "save") {
        const slot = words[1] ? parseInt(words[1]) : 0;
        if (isNaN(slot) || slot < 0 || slot > 9) {
          addOutput("Usage: SAVE [0-9] (default slot 0)");
        } else {
          saveGameState(slot);
        }
        return;
      }

      // Load game
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
          // Check state map first, fall back to game object location
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

        // Check if already carrying it
        if (gameState.inventory.includes(obj.id)) {
          addOutput("You already have that.");
          return;
        }

        // Check if it's at current location (check state map first)
        const objLocation = gameState.objectLocations.get(obj.id) || obj.location;
        if (!(objLocation.type === "at" && objLocation.locationId === gameState.currentLocation)) {
          addOutput("You don't see that here.");
          return;
        }

        // Take the object - add to inventory and remove from location in state map
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
          // Drop at current location - update state map
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

      // Default: command not understood
      addOutput("I don't understand that command. Type HELP for commands.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCommand(input);
  };

  const autoWalkthrough = () => {
    console.log("[AUTO-WALKTHROUGH] Button clicked, isAutoWalking:", isAutoWalking);

    if (isAutoWalking) {
      // Stop auto-walkthrough
      console.log("[AUTO-WALKTHROUGH] Stopping...");
      setIsAutoWalking(false);
      setAutoWalkQueue([]);
      addOutput("\n=== AUTO-WALKTHROUGH STOPPED ===\n");
      return;
    }

    // Handle intro screen first
    if (showingIntro && game.introText) {
      console.log("[AUTO-WALKTHROUGH] Clearing intro screen...");
      setShowingIntro(false);
      setHistory([]);
      describeLocation();
    }

    // Start auto-walkthrough
    console.log("[AUTO-WALKTHROUGH] Starting...");
    addOutput("\n=== AUTO-WALKTHROUGH STARTED ===\n");

    // Use game.walkthrough if available, otherwise fall back to basic test
    const commandQueue: string[] = game.walkthrough && game.walkthrough.length > 0
      ? game.walkthrough
      : [
      // Generic fallback walkthrough
      "look",
      "inventory",
      "help",
    ];

    console.log(`[AUTO-WALKTHROUGH] Queued ${commandQueue.length} commands`);
    setAutoWalkQueue(commandQueue);
    setIsAutoWalking(true);
  };

  const platform = PLATFORMS[selectedPlatform];
  const displayWidth = platform.resolution.width * zoom;
  const displayHeight = platform.resolution.height * zoom;

  return (
    <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", alignItems: "center" }}>
        {/* Control Bar */}
        <div style={{ marginBottom: 12, display: "flex", gap: 8, width: "100%", flexWrap: "wrap", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={resetGame}>
            Restart Game
          </button>
          <button className="btn btn-secondary" onClick={() => saveGameState(0)}
            title="Save game state to slot 0">
            Save
          </button>
          <button className="btn btn-secondary" onClick={() => loadGameState(0)}
            title="Load game state from slot 0">
            Load
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

        {/* Game Output - Platform-specific container */}
        <div
          style={{
            width: displayWidth,
            height: displayHeight,
            marginBottom: 12,
            border: "3px solid var(--green-bright)",
            boxShadow: "0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)",
            borderRadius: 8,
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#000000",
          }}
        >
          {/* Platform Label */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              background: "rgba(0, 255, 65, 0.9)",
              color: "#000",
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: "bold",
              textAlign: "center",
              zIndex: 10,
              fontFamily: "'Press Start 2P', monospace",
            }}
          >
            {platform.displayName}
          </div>

          {/* Game Output */}
          <div
            ref={outputRef}
            style={{
              width: "100%",
              height: "100%",
              padding: 20,
              paddingTop: 32,
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: Math.max(10, 13 / zoom),
              overflowY: "auto",
              overflowX: "hidden",
              backgroundColor: "#000000",
              color: platform.palette?.[7] || "#D7D7D7", // Use platform's brightest color for text
            }}
          >
            {history.map((item, idx) => {
            if (item.type === "image" && item.imageData) {
              return (
                <div key={idx} style={{ marginBottom: 12, textAlign: "center" }}>
                  <img
                    src={item.imageData}
                    alt="Location"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      imageRendering: "pixelated",
                      border: "2px solid var(--border)",
                      borderRadius: 4
                    }}
                  />
                </div>
              );
            }
            return (
              <div
                key={idx}
                style={{
                  color: item.type === "input"
                    ? (platform.palette?.[5] || "#00D7D7") // Use platform cyan
                    : (platform.palette?.[7] || "#D7D7D7"), // Use platform white
                  marginBottom: item.type === "output" ? 4 : 8,
                  whiteSpace: "pre-wrap"
                }}
              >
                {item.text}
              </div>
            );
          })}
          </div>
        </div>

        {/* Input Form - Platform width */}
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
