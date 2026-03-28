const fs = require('fs');

const content = `import { useState, useRef } from "react";
import { DaadGame, Location, Direction, createEmptyExits } from "../../types/daad";

interface LocationsPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
}

interface TwoWayLinkDialog {
  show: boolean;
  fromLocationId: number;
  toLocationId: number;
  direction: Direction;
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  north: "south", south: "north", east: "west", west: "east",
  northeast: "southwest", northwest: "southeast", southeast: "northwest", southwest: "northeast",
  up: "down", down: "up", in: "out", out: "in",
};

export default function LocationsPanel({ game, setGame }: LocationsPanelProps) {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [twoWayDialog, setTwoWayDialog] = useState<TwoWayLinkDialog>({
    show: false,
    fromLocationId: 0,
    toLocationId: 0,
    direction: "north",
  });
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  const addNewLocation = () => {
    const newId = game.locations.length;
    const newLocation: Location = {
      id: newId,
      name: \`Room \${newId}\`,
      description: "An empty room.",
      exits: createEmptyExits(),
      x: Math.floor(Math.random() * 600) + 100,
      y: Math.floor(Math.random() * 400) + 100,
    };
    setGame((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
    setSelectedLocation(newId);
  };

  const handleExitChange = (locationId: number, direction: Direction, targetId: number | null) => {
    const location = game.locations.find((l) => l.id === locationId);
    if (!location) return;

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
    const fromLoc = game.locations.find(l => l.id === fromId);
    const toLoc = game.locations.find(l => l.id === toId);
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
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

  const renderConnections = () => {
    const lines: JSX.Element[] = [];
    const connections = new Map<string, { from: number; to: number; direction: Direction }[]>();

    game.locations.forEach((loc) => {
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

    connections.forEach((conns, key) => {
      const [id1, id2] = key.split("-").map(Number);
      const loc1 = game.locations.find((l) => l.id === id1);
      const loc2 = game.locations.find((l) => l.id === id2);
      if (!loc1 || !loc2) return;

      const isBidirectional = conns.length > 1;
      const offset = isBidirectional ? 8 : 0;

      conns.forEach((conn, idx) => {
        const from = game.locations.find((l) => l.id === conn.from)!;
        const to = game.locations.find((l) => l.id === conn.to)!;

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
              markerEnd={\`url(#arrowhead-\${isThisTwoWay ? 'green' : 'blue'})\`}
            />
            <text
              x={(x1 + x2) / 2}
              y={(y1 + y2) / 2 - 5}
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

  const selectedLoc = game.locations.find((l) => l.id === selectedLocation);

  return (
    <div className="panel-content" style={{ display: "flex", gap: 20 }}>
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

      {/* Room List */}
      <div style={{ width: 280 }}>
        <div style={{ marginBottom: 12 }}>
          <button className="btn btn-primary" onClick={addNewLocation}>
            + New Room
          </button>
        </div>

        <pre className="ascii-border" style={{ marginBottom: 12 }}>
{\`+--- ROOMS (\${game.locations.length}) ---+\`}
        </pre>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 500, overflowY: "auto" }}>
          {game.locations.map((loc) => (
            <div
              key={loc.id}
              className="card"
              onClick={() => setSelectedLocation(loc.id)}
              style={{
                cursor: "pointer",
                borderColor: selectedLocation === loc.id ? "var(--green-bright)" : undefined,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="card-title" style={{ fontSize: 16 }}>
                    {loc.name}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    Room {loc.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Map View */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <pre className="ascii-border">
+--- MAP VIEW ---+
          </pre>
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
            height: 600,
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
              backgroundImage: \`
                linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px)
              \`,
              backgroundSize: \`\${40 * zoom}px \${40 * zoom}px\`,
              backgroundPosition: \`\${panOffset.x}px \${panOffset.y}px\`,
              transform: \`scale(\${zoom})\`,
              transformOrigin: "0 0",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "2000px",
                height: "2000px",
                transform: \`translate(\${panOffset.x / zoom}px, \${panOffset.y / zoom}px)\`,
              }}
            >
              {renderConnections()}
              {game.locations.map((loc) => (
                <div
                  key={loc.id}
                  className="card"
                  style={{
                    position: "absolute",
                    left: loc.x,
                    top: loc.y,
                    width: 120,
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
                    const startX = e.clientX / zoom - loc.x;
                    const startY = e.clientY / zoom - loc.y;
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setGame((prev) => ({
                        ...prev,
                        locations: prev.locations.map((l) =>
                          l.id === loc.id
                            ? {
                                ...l,
                                x: (moveEvent.clientX / zoom) - startX - (panOffset.x / zoom),
                                y: (moveEvent.clientY / zoom) - startY - (panOffset.y / zoom)
                              }
                            : l
                        ),
                      }));
                    };
                    const handleMouseUp = () => {
                      document.removeEventListener("mousemove", handleMouseMove);
                      document.removeEventListener("mouseup", handleMouseUp);
                    };
                    document.addEventListener("mousemove", handleMouseMove);
                    document.addEventListener("mouseup", handleMouseUp);
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
            Shift+Drag or Middle-Click to pan
          </span>
        </div>
      </div>

      {/* Room Editor */}
      <div style={{ width: 320 }}>
        <pre className="ascii-border" style={{ marginBottom: 12 }}>
+--- ROOM EDITOR ---+
        </pre>
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
              <label className="form-label">Exits</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
                {(Object.keys(selectedLoc.exits) as Direction[]).map((dir) => {
                  const targetId = selectedLoc.exits[dir];
                  const isTwoWay = targetId !== null && isTwoWayConnection(selectedLoc.id, targetId, dir);

                  return (
                    <div key={dir} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", width: 80 }}>
                        {dir}
                      </label>
                      <select
                        className="form-input form-select"
                        value={targetId ?? ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleExitChange(selectedLoc.id, dir, val === "" ? null : parseInt(val));
                        }}
                        style={{ fontSize: 12, flex: 1 }}
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
                      {targetId !== null && (
                        <>
                          <span style={{ fontSize: 10, color: isTwoWay ? "var(--green-bright)" : "var(--blue-bright)" }}>
                            {isTwoWay ? "↔" : "→"}
                          </span>
                          <button
                            className="btn btn-danger"
                            style={{ fontSize: 10, padding: "4px 8px" }}
                            onClick={() => clearExit(selectedLoc.id, dir)}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              className="btn btn-danger"
              onClick={() => {
                setGame((prev) => ({
                  ...prev,
                  locations: prev.locations.filter((l) => l.id !== selectedLoc.id),
                }));
                setSelectedLocation(null);
              }}
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
    </div>
  );
}
`;

fs.writeFileSync('D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx', content);
console.log('LocationsPanel.tsx updated with zoom and pan functionality');
