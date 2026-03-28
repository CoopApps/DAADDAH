import { useState } from "react";
import { DaadGame } from "../../types/daad";

interface GameInfoPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  onNavigateToPanel?: (panel: string) => void;
}

export default function GameInfoPanel({ game, setGame, onNavigateToPanel }: GameInfoPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateField = (field: keyof DaadGame, value: string | number) => {
    setGame((prev) => ({ ...prev, [field]: value }));
  };

  const updateFlag = (flagId: number, value: number) => {
    setGame((prev) => ({
      ...prev,
      flags: (prev.flags || []).map(f => f.id === flagId ? { ...f, initialValue: value } : f)
    }));
  };

  const getFlag = (flagId: number): number => {
    return (game.flags || []).find(f => f.id === flagId)?.initialValue ?? 0;
  };

  const createNewLocation = () => {
    // Find next available ID (handles gaps from deletions)
    const existingIds = (game.locations || []).map(l => l.id);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
    const newLocation = {
      id: newId,
      name: `Room ${newId}`,
      description: "An empty room.",
      isDark: false,
      exits: {
        north: null, south: null, east: null, west: null,
        northeast: null, northwest: null, southeast: null, southwest: null,
        up: null, down: null, in: null, out: null,
      },
      x: 100,
      y: 100,
    };
    setGame((prev) => ({
      ...prev,
      locations: [...prev.locations, newLocation],
    }));
    if (onNavigateToPanel) onNavigateToPanel("locations");
  };

  const createNewObject = () => {
    // Find next available ID (handles gaps from deletions)
    const existingIds = (game.objects || []).map(o => o.id);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
    const newObject = {
      id: newId,
      noun: "",
      adjective: "",
      description: `Item ${newId}`,
      icon: "📦",
      weight: 1,
      location: { type: "limbo" as const },
      isContainer: false,
      isWearable: false,
      isTakeable: true,
      isLightSource: false,
      isPSI: false,
    };
    setGame((prev) => ({
      ...prev,
      objects: [...prev.objects, newObject],
    }));
    if (onNavigateToPanel) onNavigateToPanel("objects");
  };

  const createNewRule = () => {
    // Find next available ID (handles gaps from deletions)
    const existingIds = (game.rules || []).map(r => r.id);
    const newId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;
    const newRule = {
      id: newId,
      name: `Rule ${newId}`,
      process: "PRO0" as const,
      enabled: true,
      conditions: [],
      actions: [],
    };
    setGame((prev) => ({
      ...prev,
      rules: [...prev.rules, newRule],
    }));
    if (onNavigateToPanel) onNavigateToPanel("rules");
  };

  const createNewFlag = () => {
    const usedIds = new Set((game.flags || []).map(f => f.id));
    let newId = 1;
    while (usedIds.has(newId)) newId++;

    const newFlag = {
      id: newId,
      name: `flag_${newId}`,
      description: "",
      initialValue: 0,
    };
    setGame((prev) => ({
      ...prev,
      flags: [...prev.flags, newFlag],
    }));
    if (onNavigateToPanel) onNavigateToPanel("flags");
  };

  const titleEmpty = !game.title || game.title.trim() === "";
  const maxCarryObjects = getFlag(37);
  const maxCarryWeight = getFlag(52);
  const invalidCarryLimits = maxCarryObjects < 1 || maxCarryObjects > 255 || maxCarryWeight < 1 || maxCarryWeight > 255;

  return (
    <div className="panel-content">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-value">{(game.locations || []).length}</div>
          <div className="stat-label">Rooms</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(game.objects || []).length}</div>
          <div className="stat-label">Items</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(game.rules || []).length}</div>
          <div className="stat-label">Responses</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(game.flags || []).length}</div>
          <div className="stat-label">Variables</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{(game.messages || []).length}</div>
          <div className="stat-label">Messages</div>
        </div>
      </div>

      {/* Form Fields - Two Column Layout */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="form-group">
            <label className="form-label">
              Game Title {titleEmpty && <span style={{ color: "var(--red-bright)" }}>*</span>}
            </label>
            <input
              type="text"
              className="form-input"
              value={game.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Enter game title..."
              style={{ borderColor: titleEmpty ? "var(--red-bright)" : undefined }}
            />
            {titleEmpty && (
              <div style={{ fontSize: 11, color: "var(--red-bright)", marginTop: 4 }}>
                Title is required
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Author</label>
            <input
              type="text"
              className="form-input"
              value={game.author}
              onChange={(e) => updateField("author", e.target.value)}
              placeholder="Enter author name..."
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div className="form-group">
            <label className="form-label" title="Maximum number of objects the player can carry at once">
              Max Carry Objects (Flag 37) ℹ️
            </label>
            <input
              type="number"
              className="form-input"
              value={maxCarryObjects}
              min={1}
              max={255}
              onChange={(e) => updateFlag(37, parseInt(e.target.value) || 1)}
              style={{ borderColor: invalidCarryLimits ? "var(--amber-bright)" : undefined }}
            />
            {(maxCarryObjects < 1 || maxCarryObjects > 255) && (
              <div style={{ fontSize: 11, color: "var(--amber-bright)", marginTop: 4 }}>
                Must be between 1-255
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" title="Maximum total weight the player can carry">
              Max Carry Weight (Flag 52) ℹ️
            </label>
            <input
              type="number"
              className="form-input"
              value={maxCarryWeight}
              min={1}
              max={255}
              onChange={(e) => updateFlag(52, parseInt(e.target.value) || 1)}
              style={{ borderColor: invalidCarryLimits ? "var(--amber-bright)" : undefined }}
            />
            {(maxCarryWeight < 1 || maxCarryWeight > 255) && (
              <div style={{ fontSize: 11, color: "var(--amber-bright)", marginTop: 4 }}>
                Must be between 1-255
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Introductory Text</label>
          <textarea
            className="form-input"
            value={game.introText || ""}
            onChange={(e) => setGame({ ...game, introText: e.target.value })}
            rows={4}
            placeholder="Enter text to display before the game starts (press Enter to begin)..."
            maxLength={1024}
          />
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
            {(game.introText || "").length}/1024 characters
          </div>
        </div>

        {/* Advanced Settings - Collapsible */}
        <div style={{ marginTop: 12 }}>
          <button
            className="btn btn-secondary"
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ fontSize: 12, padding: "6px 12px" }}
          >
            {showAdvanced ? "▼" : "▶"} Advanced Settings
          </button>
        </div>

        {showAdvanced && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border-color)" }}>
            <div className="form-group">
              <label className="form-label">Part Number</label>
              <input
                type="number"
                className="form-input"
                value={game.partNumber}
                min={1}
                max={99}
                onChange={(e) => updateField("partNumber", parseInt(e.target.value) || 1)}
              />
              <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                For multi-part games (PART1, PART2, etc.). Most games use 1.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Version</label>
              <input
                type="text"
                className="form-input"
                value={game.version}
                onChange={(e) => updateField("version", e.target.value)}
                placeholder="1.0"
              />
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--green-bright)" }}>
          Quick Actions
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <button className="btn btn-primary" onClick={createNewLocation}>
            + New Room
          </button>
          <button className="btn btn-primary" onClick={createNewObject}>
            + New Item
          </button>
          <button className="btn btn-secondary" onClick={createNewRule}>
            + New Response
          </button>
          <button className="btn btn-secondary" onClick={createNewFlag}>
            + New Variable
          </button>
        </div>
      </div>
    </div>
  );
}
