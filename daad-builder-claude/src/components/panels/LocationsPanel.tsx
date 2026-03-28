import { useState, useRef, useEffect } from "react";
import { DaadGame, Location, Direction, createEmptyExits } from "../../types/daad";
import ImageDialog from "../ImageDialog";
import BatchEditor from "../BatchEditor";

interface LocationsPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface TwoWayLinkDialog {
  show: boolean;
  fromLocationId: number;
  toLocationId: number;
  direction: Direction;
}

interface DeleteConfirmDialog {
  show: boolean;
  location: Location | null;
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  north: "south", south: "north", east: "west", west: "east",
  northeast: "southwest", northwest: "southeast", southeast: "northwest", southwest: "northeast",
  up: "down", down: "up", in: "out", out: "in",
};

const COMMON_DIRECTIONS: Direction[] = ["north", "south", "east", "west", "up", "down"];
const DIAGONAL_DIRECTIONS: Direction[] = ["northeast", "northwest", "southeast", "southwest"];
const SPECIAL_DIRECTIONS: Direction[] = ["in", "out"];

export default function LocationsPanel({ game, setGame, selectItemId }: LocationsPanelProps) {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchEditor, setShowBatchEditor] = useState(false);

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedLocation(selectItemId);
    }
  }, [selectItemId]);
  const [twoWayDialog, setTwoWayDialog] = useState<TwoWayLinkDialog>({
    show: false,
    fromLocationId: 0,
    toLocationId: 0,
    direction: "north",
  });
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    show: false,
    location: null,
  });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showAllDirections, setShowAllDirections] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [imageDialogLocation, setImageDialogLocation] = useState<Location | null>(null);

  // Ref to track active drag listeners for cleanup
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup drag listeners on unmount
  useEffect(() => {
    return () => {
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
      }
    };
  }, []);

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds([]);
  };

  const toggleItemSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    setSelectedIds((game.locations || []).map((loc) => loc.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Find smart placement for new room near existing rooms
  const findSmartPlacement = (): { x: number; y: number } => {
    if ((game.locations || []).length === 0) {
      return { x: 400, y: 300 }; // Center of typical viewport
    }

    // Find average position
    const locations = game.locations || [];
    const avgX = locations.reduce((sum, loc) => sum + loc.x, 0) / locations.length;
    const avgY = locations.reduce((sum, loc) => sum + loc.y, 0) / locations.length;

    // Place new room offset from average
    let newX = avgX + 200;
    let newY = avgY + 100;

    // Check for overlaps and adjust
    let attempts = 0;
    while (attempts < 20) {
      const hasOverlap = locations.some(loc => {
        const dx = Math.abs(loc.x - newX);
        const dy = Math.abs(loc.y - newY);
        return dx < 150 && dy < 80;
      });

      if (!hasOverlap) break;

      newX += 150;
      if (newX > 1000) {
        newX = 100;
        newY += 100;
      }
      attempts++;
    }

    return { x: newX, y: newY };
  };

  const addNewLocation = () => {
    const newId = (game.locations || []).length;
    const placement = findSmartPlacement();
    const newLocation: Location = {
      id: newId,
      name: `Room ${newId}`,
      description: "An empty room.",
      isDark: false,
      exits: createEmptyExits(),
      ...placement,
    };
    setGame((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
    setSelectedLocation(newId);
  };

  const handleExitChange = (locationId: number, direction: Direction, targetId: number | null) => {
    const location = (game.locations || []).find((l) => l.id === locationId);
    if (!location) return;

    // Prevent creating new connections while two-way dialog is open (race condition guard)
    if (twoWayDialog.show) return;

    const previousTarget = location.exits[direction];
    const isNewConnection = previousTarget === null && targetId !== null;

    setGame((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === locationId
          ? { ...loc, exits: { ...loc.exits, [direction]: targetId } }
          : loc
      ),
    }));

    if (isNewConnection && targetId !== null) {
      setTwoWayDialog({
        show: true,
        fromLocationId: locationId,
        toLocationId: targetId,
        direction,
      });
    }
  };

  const clearExit = (locationId: number, direction: Direction) => {
    setGame((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === locationId
          ? { ...loc, exits: { ...loc.exits, [direction]: null } }
          : loc
      ),
    }));
  };

  const isTwoWayConnection = (fromId: number, toId: number, direction: Direction): boolean => {
    const fromLoc = (game.locations || []).find(l => l.id === fromId);
    const toLoc = (game.locations || []).find(l => l.id === toId);
    if (!fromLoc || !toLoc) return false;

    const oppositeDir = OPPOSITE_DIRECTIONS[direction];
    return fromLoc.exits[direction] === toId && toLoc.exits[oppositeDir] === fromId;
  };

  const handleTwoWayResponse = (createReverse: boolean) => {
    if (createReverse) {
      const oppositeDir = OPPOSITE_DIRECTIONS[twoWayDialog.direction];
      setGame((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.id === twoWayDialog.toLocationId
            ? { ...loc, exits: { ...loc.exits, [oppositeDir]: twoWayDialog.fromLocationId } }
            : loc
        ),
      }));
    }
    setTwoWayDialog({ show: false, fromLocationId: 0, toLocationId: 0, direction: "north" });
  };

  const handleDeleteRoom = (location: Location) => {
    setDeleteDialog({ show: true, location });
  };

  const confirmDeleteRoom = () => {
    if (!deleteDialog.location) return;

    const locationId = deleteDialog.location.id;

    // Remove the location and renumber IDs
    setGame((prev) => {
      const filteredLocations = prev.locations
        .filter((l) => l.id !== locationId)
        .map((loc, index) => {
          // Renumber IDs to be consecutive starting from 0
          const newId = index;

          // Update exits to reflect new IDs
          const updatedExits = { ...loc.exits };
          Object.keys(updatedExits).forEach((dir) => {
            const exitId = updatedExits[dir as Direction];
            if (exitId === null) return;

            // If exit pointed to deleted room, remove it
            if (exitId === locationId) {
              updatedExits[dir as Direction] = null;
            }
            // If exit pointed to room after deleted one, decrement ID
            else if (exitId > locationId) {
              updatedExits[dir as Direction] = exitId - 1;
            }
          });

          return {
            ...loc,
            id: newId,
            exits: updatedExits,
          };
        });

      return {
        ...prev,
        locations: filteredLocations,
      };
    });

    setSelectedLocation(null);
    setDeleteDialog({ show: false, location: null });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMapMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleSaveImage = (locationId: number, imageData: Location["image"]) => {
    setGame((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === locationId ? { ...loc, image: imageData } : loc
      ),
    }));
    setImageDialogLocation(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLocation) return;

      // Don't trigger delete if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const loc = (game.locations || []).find(l => l.id === selectedLocation);
        if (loc) {
          e.preventDefault();
          handleDeleteRoom(loc);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLocation, game.locations]);

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    const connections = new Map<string, { from: number; to: number; direction: Direction }[]>();

    (game.locations || []).forEach((loc) => {
      Object.entries(loc.exits).forEach(([dir, targetId]) => {
        if (targetId !== null) {
          const key = [loc.id, targetId].sort().join("-");
          if (!connections.has(key)) {
            connections.set(key, []);
          }
          connections.get(key)!.push({ from: loc.id, to: targetId, direction: dir as Direction });
        }
      });
    });

    connections.forEach((conns) => {
      const isBidirectional = conns.length > 1;
      const offset = isBidirectional ? 8 : 0;

      conns.forEach((conn, idx) => {
        const from = (game.locations || []).find((l) => l.id === conn.from);
        const to = (game.locations || []).find((l) => l.id === conn.to);

        // Skip if either location doesn't exist (broken reference)
        if (!from || !to) return;

        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / length;
        const uy = dy / length;

        const perpX = -uy * (idx === 0 ? offset : -offset);
        const perpY = ux * (idx === 0 ? offset : -offset);

        const x1 = from.x + 60 + perpX;
        const y1 = from.y + 30 + perpY;
        const x2 = to.x + 60 + perpX;
        const y2 = to.y + 30 + perpY;

        const isThisTwoWay = isTwoWayConnection(conn.from, conn.to, conn.direction);
        const strokeColor = isThisTwoWay ? "var(--green-bright)" : "var(--blue-bright)";

        lines.push(
          <g key={conn.from + "-" + conn.to + "-" + conn.direction}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={strokeColor}
              strokeWidth="2"
              markerEnd={`url(#arrowhead-${isThisTwoWay ? 'green' : 'blue'})`}
            />
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 + (
                ['north', 'northeast', 'northwest', 'east', 'up', 'in'].includes(conn.direction) ? -8 :
                ['south', 'southeast', 'southwest', 'west', 'down', 'out'].includes(conn.direction) ? 12 :
                0
              )}
              fill="var(--amber-bright)"
              fontSize="10"
              fontFamily="monospace"
            >
              {conn.direction}
            </text>
          </g>
        );
      });
    });

    return (
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <defs>
          <marker
            id="arrowhead-blue"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="var(--blue-bright)" />
          </marker>
          <marker
            id="arrowhead-green"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" fill="var(--green-bright)" />
          </marker>
        </defs>
        {lines}
      </svg>
    );
  };

  const selectedLoc = (game.locations || []).find((l) => l.id === selectedLocation);

  // Filter locations by search term (if you want to add filtering later)
  const filteredLocations = game.locations;

  // Get used and unused directions
  const usedDirections: Direction[] = [];
  const unusedDirections: Direction[] = [];

  if (selectedLoc) {
    (Object.keys(selectedLoc.exits) as Direction[]).forEach((dir) => {
      if (selectedLoc.exits[dir] !== null) {
        usedDirections.push(dir);
      } else {
        unusedDirections.push(dir);
      }
    });
  }

  return (
    <div className="panel-content" style={{ display: "flex", gap: 20, height: "calc(100vh - 180px)" }}>
      {/* Batch Editor */}
      <BatchEditor
        isOpen={showBatchEditor}
        onClose={() => setShowBatchEditor(false)}
        game={game}
        setGame={setGame}
        targetType="locations"
        selectedIds={selectedIds}
      />

      {/* Two-Way Link Dialog */}
      {twoWayDialog.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ maxWidth: 400, padding: 24 }}>
            <h3 style={{ marginBottom: 16, color: "var(--green-bright)" }}>Create Two-Way Link?</h3>
            <p style={{ marginBottom: 24 }}>
              You connected Room {twoWayDialog.fromLocationId} to Room {twoWayDialog.toLocationId} via{" "}
              <strong>{twoWayDialog.direction}</strong>.
            </p>
            <p style={{ marginBottom: 24, color: "var(--text-dim)" }}>
              Do you want to automatically create the reverse link (
              <strong>{OPPOSITE_DIRECTIONS[twoWayDialog.direction]}</strong>)?
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" onClick={() => handleTwoWayResponse(true)}>
                Yes, Create Two-Way
              </button>
              <button className="btn btn-secondary" onClick={() => handleTwoWayResponse(false)}>
                No, One-Way Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && deleteDialog.location && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ maxWidth: 500, padding: 24 }}>
            <h3 style={{ marginBottom: 16, color: "var(--red-bright)" }}>⚠️ Delete Room?</h3>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>{deleteDialog.location.name}</strong>?
            </p>
            <div style={{ backgroundColor: "rgba(255, 0, 0, 0.1)", padding: 12, borderRadius: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
                <strong>This will:</strong>
              </p>
              <ul style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 20 }}>
                <li>Permanently delete this room</li>
                <li>Remove all exits leading to/from this room</li>
                <li>Renumber all room IDs to maintain consecutive order</li>
                <li>This action cannot be undone (use Ctrl+Z after closing this dialog)</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-danger" onClick={confirmDeleteRoom}>
                Yes, Delete Room
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteDialog({ show: false, location: null })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room List */}
      <div style={{ width: 280, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary" onClick={addNewLocation} style={{ width: "100%" }}>
            + New Room
          </button>
          <button
            className={selectionMode ? "btn btn-secondary" : "btn"}
            onClick={toggleSelectionMode}
            style={{ width: "100%", fontSize: 12 }}
          >
            {selectionMode ? "✓ Selection Mode" : "☐ Multi-Select"}
          </button>
          {selectionMode && (
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="btn"
                onClick={selectAll}
                style={{ flex: 1, fontSize: 11, padding: "4px 8px" }}
              >
                Select All
              </button>
              <button
                className="btn"
                onClick={deselectAll}
                style={{ flex: 1, fontSize: 11, padding: "4px 8px" }}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowBatchEditor(true)}
                disabled={selectedIds.length === 0}
                style={{ flex: 1, fontSize: 11, padding: "4px 8px" }}
              >
                Edit ({selectedIds.length})
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--green-bright)" }}>
          ROOMS ({(game.locations || []).length})
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto" }}>
          {(game.locations || []).map((loc) => (
            <div
              key={loc.id}
              className="card"
              onClick={() => selectionMode ? toggleItemSelection(loc.id) : setSelectedLocation(loc.id)}
              style={{
                cursor: "pointer",
                borderColor: selectionMode
                  ? selectedIds.includes(loc.id)
                    ? "var(--blue-bright)"
                    : undefined
                  : selectedLocation === loc.id
                  ? "var(--green-bright)"
                  : undefined,
                backgroundColor: selectionMode && selectedIds.includes(loc.id)
                  ? "rgba(66, 153, 225, 0.1)"
                  : undefined,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(loc.id)}
                      onChange={() => toggleItemSelection(loc.id)}
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div className="card-title" style={{ fontSize: 16 }}>
                      {loc.name}
                    </div>
                    <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                      Room {loc.id}
                      {loc.image && <span style={{ marginLeft: 8, color: "var(--green-bright)" }}>📷</span>}
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: "4px 8px", minWidth: "auto" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageDialogLocation(loc);
                  }}
                  title="Manage image for this room"
                >
                  🖼️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map View */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--green-bright)" }}>
            MAP VIEW
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <button className="btn btn-secondary" style={{ fontSize: 10, padding: "4px 8px" }} onClick={resetView}>
              Reset View
            </button>
          </div>
        </div>
        <div
          ref={mapRef}
          style={{
            position: "relative",
            flex: 1,
            minHeight: 400,
            border: "2px solid var(--green-bright)",
            borderRadius: 4,
            overflow: "hidden",
            backgroundColor: "#000000",
            cursor: isPanning ? "grabbing" : "grab",
          }}
          onWheel={handleWheel}
          onMouseDown={handleMapMouseDown}
          onMouseMove={handleMapMouseMove}
          onMouseUp={handleMapMouseUp}
          onMouseLeave={handleMapMouseUp}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: `
                linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
              backgroundPosition: `${panOffset.x % (40 * zoom)}px ${panOffset.y % (40 * zoom)}px`,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              }}
            >
              {renderConnections()}
              {(game.locations || []).map((loc) => (
                <div
                  key={loc.id}
                  className="card"
                  style={{
                    position: "absolute",
                    left: loc.x,
                    top: loc.y,
                    width: 120,
                    transform: `scale(${1 / zoom})`,
                    cursor: isPanning ? "grabbing" : "move",
                    borderColor: selectedLocation === loc.id ? "var(--green-bright)" : undefined,
                    pointerEvents: isPanning ? "none" : "auto",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocation(loc.id);
                  }}
                  onMouseDown={(e) => {
                    if (isPanning || e.shiftKey) return;
                    e.stopPropagation();
                    const rect = mapRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const startX = (e.clientX - rect.left - panOffset.x) / zoom - loc.x;
                    const startY = (e.clientY - rect.top - panOffset.y) / zoom - loc.y;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setGame((prev) => ({
                        ...prev,
                        locations: prev.locations.map((l) =>
                          l.id === loc.id
                            ? {
                                ...l,
                                x: (moveEvent.clientX - rect.left - panOffset.x) / zoom - startX,
                                y: (moveEvent.clientY - rect.top - panOffset.y) / zoom - startY
                              }
                            : l
                        ),
                      }));
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                      dragCleanupRef.current = null;
                    };
                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);

                    // Store cleanup function
                    dragCleanupRef.current = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };
                  }}
                >
                  <div className="card-title" style={{ fontSize: 12 }}>
                    {loc.name}
                  </div>
                  <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                    Room {loc.id}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-dim)", display: "flex", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 20, height: 2, backgroundColor: "var(--green-bright)" }}></div>
            <span>Two-Way</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 20, height: 2, backgroundColor: "var(--blue-bright)" }}></div>
            <span>One-Way</span>
          </div>
          <span style={{ marginLeft: "auto", color: "var(--text-dim)", fontSize: 11 }}>
            Drag to pan • Scroll to zoom • Delete key to remove
          </span>
        </div>
      </div>

      {/* Room Editor */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "var(--green-bright)" }}>
          ROOM EDITOR
        </div>
        {selectedLoc ? (
          <div className="card">
            <div className="form-group">
              <label className="form-label">Room Name</label>
              <input
                type="text"
                className="form-input"
                value={selectedLoc.name}
                onChange={(e) =>
                  setGame((prev) => ({
                    ...prev,
                    locations: prev.locations.map((loc) =>
                      loc.id === selectedLoc.id ? { ...loc, name: e.target.value } : loc
                    ),
                  }))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={selectedLoc.description}
                onChange={(e) =>
                  setGame((prev) => ({
                    ...prev,
                    locations: prev.locations.map((loc) =>
                      loc.id === selectedLoc.id ? { ...loc, description: e.target.value } : loc
                    ),
                  }))
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedLoc.isDark}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      locations: prev.locations.map((loc) =>
                        loc.id === selectedLoc.id ? { ...loc, isDark: e.target.checked } : loc
                      ),
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                Dark Room
              </label>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Dark rooms require a light source
              </p>
            </div>

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label">Exits ({usedDirections.length}/12)</label>
                {unusedDirections.length > 0 && (
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: 10, padding: "4px 8px" }}
                    onClick={() => setShowAllDirections(!showAllDirections)}
                  >
                    {showAllDirections ? "Hide Unused" : "Show All"}
                  </button>
                )}
              </div>

              {/* Used Exits */}
              {usedDirections.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {usedDirections.map((dir) => {
                    const targetId = selectedLoc.exits[dir];
                    const isTwoWay = targetId !== null && isTwoWayConnection(selectedLoc.id, targetId, dir);

                    return (
                      <div key={dir} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase" }}>
                          {dir} {isTwoWay ? "↔" : "→"}
                        </label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <select
                            className="form-input form-select"
                            value={targetId ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleExitChange(selectedLoc.id, dir, val === "" ? null : parseInt(val));
                            }}
                            style={{ fontSize: 11, flex: 1 }}
                          >
                            <option value="">None</option>
                            {game.locations
                              .filter((l) => l.id !== selectedLoc.id)
                              .map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                  {loc.name}
                                </option>
                              ))}
                          </select>
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: 10, padding: "4px 8px", minWidth: "auto" }}
                            onClick={() => clearExit(selectedLoc.id, dir)}
                            title="Clear exit"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Unused Exits (Collapsible) */}
              {showAllDirections && unusedDirections.length > 0 && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                  paddingTop: usedDirections.length > 0 ? 12 : 0,
                  borderTop: usedDirections.length > 0 ? "1px solid var(--border-color)" : "none"
                }}>
                  {unusedDirections.map((dir) => (
                    <div key={dir} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <label style={{ fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase" }}>
                        {dir}
                      </label>
                      <select
                        className="form-input form-select"
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) handleExitChange(selectedLoc.id, dir, parseInt(val));
                        }}
                        style={{ fontSize: 11 }}
                      >
                        <option value="">None</option>
                        {game.locations
                          .filter((l) => l.id !== selectedLoc.id)
                          .map((loc) => (
                            <option key={loc.id} value={loc.id}>
                              {loc.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className="btn btn-danger"
              onClick={() => handleDeleteRoom(selectedLoc)}
            >
              Delete Room
            </button>
          </div>
        ) : (
          <div className="card" style={{ color: "var(--text-dim)", textAlign: "center", padding: 48 }}>
            <p style={{ fontSize: 16 }}>Select a room</p>
            <p style={{ fontSize: 12 }}>Click a room on the map to edit</p>
          </div>
        )}
      </div>

      {/* Image Dialog */}
      {imageDialogLocation && (
        <ImageDialog
          location={imageDialogLocation}
          onClose={() => setImageDialogLocation(null)}
          onSave={(imageData) => handleSaveImage(imageDialogLocation.id, imageData)}
        />
      )}
    </div>
  );
}
