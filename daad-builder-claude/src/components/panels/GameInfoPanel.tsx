import { useState } from "react";
import { DaadGame, StatusBarConfig } from "../../types/daad";
import { SYSTEM_MESSAGES } from "../../data/systemMessages";

interface GameInfoPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  onNavigateToPanel?: (panel: string) => void;
}

const DAAD_COLORS = [
  { name: "Black", hex: "#000000" }, { name: "Blue", hex: "#0000AA" },
  { name: "Green", hex: "#00AA00" }, { name: "Cyan", hex: "#00AAAA" },
  { name: "Red", hex: "#AA0000" }, { name: "Magenta", hex: "#AA00AA" },
  { name: "Brown", hex: "#AA5500" }, { name: "Light Gray", hex: "#AAAAAA" },
  { name: "Dark Gray", hex: "#555555" }, { name: "Light Blue", hex: "#5555FF" },
  { name: "Light Green", hex: "#55FF55" }, { name: "Light Cyan", hex: "#55FFFF" },
  { name: "Light Red", hex: "#FF5555" }, { name: "Light Magenta", hex: "#FF55FF" },
  { name: "Yellow", hex: "#FFFF55" }, { name: "White", hex: "#FFFFFF" },
];

export default function GameInfoPanel({ game, setGame, onNavigateToPanel }: GameInfoPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(false);
  const [showSystemMessages, setShowSystemMessages] = useState(false);
  const [stxFilter, setStxFilter] = useState<string>("all");

  const updateField = (field: keyof DaadGame, value: string | number) => {
    setGame((prev) => ({ ...prev, [field]: value }));
  };

  const updateStatusBar = (updates: Partial<StatusBarConfig>) => {
    setGame((prev) => ({
      ...prev,
      statusBarConfig: {
        paperColor: prev.statusBarConfig?.paperColor ?? 4,
        inkColor: prev.statusBarConfig?.inkColor ?? 15,
        showTurns: prev.statusBarConfig?.showTurns ?? true,
        showLocationName: prev.statusBarConfig?.showLocationName ?? true,
        ...updates,
      },
    }));
  };

  const updateSystemMessage = (index: number, text: string) => {
    setGame((prev) => {
      const msgs = { ...(prev.systemMessages || {}) };
      const defaultMsg = SYSTEM_MESSAGES.find(s => s.id === index);
      if (text === "" || text === defaultMsg?.defaultText) {
        delete msgs[index];
      } else {
        msgs[index] = text;
      }
      return { ...prev, systemMessages: Object.keys(msgs).length > 0 ? msgs : undefined };
    });
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

      {/* Status Bar Configuration */}
      <div className="card" style={{ marginTop: 16 }}>
        <button
          onClick={() => setShowStatusBar(!showStatusBar)}
          style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, color: "var(--amber-bright)", fontSize: 14, fontWeight: 600 }}
        >
          {showStatusBar ? "▼" : "▶"} Status Bar
        </button>
        {showStatusBar && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Background Color</label>
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 200 }}>
                  {DAAD_COLORS.map((c, i) => (
                    <div key={i} title={`${i}: ${c.name}`}
                      onClick={() => updateStatusBar({ paperColor: i })}
                      style={{
                        width: 20, height: 20, background: c.hex, cursor: "pointer",
                        border: (game.statusBarConfig?.paperColor ?? 4) === i ? "2px solid var(--green-bright)" : "1px solid #333",
                      }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label" style={{ fontSize: 11 }}>Text Color</label>
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 200 }}>
                  {DAAD_COLORS.map((c, i) => (
                    <div key={i} title={`${i}: ${c.name}`}
                      onClick={() => updateStatusBar({ inkColor: i })}
                      style={{
                        width: 20, height: 20, background: c.hex, cursor: "pointer",
                        border: (game.statusBarConfig?.inkColor ?? 15) === i ? "2px solid var(--green-bright)" : "1px solid #333",
                      }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <label style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12, cursor: "pointer" }}>
                <input type="checkbox" checked={game.statusBarConfig?.showLocationName ?? true}
                  onChange={e => updateStatusBar({ showLocationName: e.target.checked })} />
                Show location name
              </label>
              <div>
                <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Right Side</label>
                <select className="form-input form-select" style={{ fontSize: 11, width: 130 }}
                  value={game.statusBarConfig?.rightContent ?? "turns"}
                  onChange={e => {
                    const val = e.target.value;
                    updateStatusBar({
                      rightContent: val as any,
                      showTurns: val === "turns",
                      rightLabel: val === "score" ? "Score: " : val === "turns" ? "Turns: " : game.statusBarConfig?.rightLabel,
                    });
                  }}>
                  <option value="turns">Turns</option>
                  <option value="score">Score</option>
                  <option value="custom">Custom Flag</option>
                  <option value="daytime">Day / Time</option>
                  <option value="none">None</option>
                </select>
              </div>
              {(game.statusBarConfig?.rightContent === "custom" || game.statusBarConfig?.rightContent === "score") && (
                <div style={{ display: "flex", gap: 4 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Label</label>
                    <input className="form-input" style={{ fontSize: 11, width: 70 }}
                      value={game.statusBarConfig?.rightLabel ?? (game.statusBarConfig?.rightContent === "score" ? "Score: " : "")}
                      onChange={e => updateStatusBar({ rightLabel: e.target.value })} />
                  </div>
                  {game.statusBarConfig?.rightContent === "custom" && (
                    <div>
                      <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Flag</label>
                      <input className="form-input" type="number" style={{ fontSize: 11, width: 50 }}
                        value={game.statusBarConfig?.rightFlagId ?? 30} min={0} max={255}
                        onChange={e => updateStatusBar({ rightFlagId: parseInt(e.target.value) || 30 })} />
                    </div>
                  )}
                </div>
              )}
              {game.statusBarConfig?.rightContent === "daytime" && (
                <div style={{ display: "flex", gap: 4 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Day Flag</label>
                    <input className="form-input" type="number" style={{ fontSize: 11, width: 50 }}
                      value={game.statusBarConfig?.dayFlagId ?? 93} min={0} max={255}
                      onChange={e => updateStatusBar({ dayFlagId: parseInt(e.target.value) || 93 })} />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Time Flag</label>
                    <input className="form-input" type="number" style={{ fontSize: 11, width: 50 }}
                      value={game.statusBarConfig?.timeFlagId ?? 138} min={0} max={255}
                      onChange={e => updateStatusBar({ timeFlagId: parseInt(e.target.value) || 138 })} />
                  </div>
                </div>
              )}
            </div>
            <div style={{
              padding: "4px 8px", fontSize: 12, fontFamily: "monospace", marginTop: 8,
              background: DAAD_COLORS[game.statusBarConfig?.paperColor ?? 4].hex,
              color: DAAD_COLORS[game.statusBarConfig?.inkColor ?? 15].hex,
            }}>
              {(game.statusBarConfig?.showLocationName ?? true) ? "Study" : ""}
              {(() => {
                const rc = game.statusBarConfig?.rightContent ?? "turns";
                if (rc === "none") return "";
                if (rc === "daytime") return "                    Day 1  Morn";
                const label = game.statusBarConfig?.rightLabel ?? (rc === "score" ? "Score: " : "Turns: ");
                return "                    " + label + "0";
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Graphics Layout */}
      <div className="card" style={{ marginTop: 16 }}>
        <h3 style={{ margin: "0 0 8px", color: "var(--cyan-bright)", fontSize: 14 }}>Graphics Layout</h3>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div>
            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Image Height (rows)</label>
            <input className="form-input" type="number" style={{ fontSize: 11, width: 60 }}
              value={game.imageHeight ?? 0} min={0} max={24}
              onChange={e => setGame({ ...game, imageHeight: parseInt(e.target.value) || 0 })} />
          </div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.3 }}>
            {(game.imageHeight ?? 0) === 0 ? "No graphics — text only" :
             `${(game.imageHeight ?? 0) * 8}px image area. Status bar at top, graphics below, text fills rest.`}
            {(game.imageHeight ?? 0) === 13 && " (Rabenstein default)"}
          </div>
        </div>
      </div>

      {/* System Messages (STX) */}
      <div className="card" style={{ marginTop: 16 }}>
        <button
          onClick={() => setShowSystemMessages(!showSystemMessages)}
          style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left", padding: 0, color: "var(--cyan-bright)", fontSize: 14, fontWeight: 600 }}
        >
          {showSystemMessages ? "▼" : "▶"} System Messages ({Object.keys(game.systemMessages || {}).length} overrides)
        </button>
        {showSystemMessages && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <select className="form-input form-select" style={{ fontSize: 11, flex: 1 }}
                value={stxFilter} onChange={e => setStxFilter(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="responses">Responses</option>
                <option value="errors">Errors</option>
                <option value="descriptions">Descriptions</option>
                <option value="prompts">Prompts</option>
              </select>
              {Object.keys(game.systemMessages || {}).length > 0 && (
                <button className="btn btn-danger" style={{ fontSize: 10, padding: "4px 8px" }}
                  onClick={() => setGame(prev => ({ ...prev, systemMessages: undefined }))}>
                  Reset All
                </button>
              )}
            </div>
            <div style={{ maxHeight: 400, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {SYSTEM_MESSAGES
                .filter(m => stxFilter === "all" || m.category === stxFilter)
                .map(msg => (
                  <div key={msg.id} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
                    <span style={{ color: "var(--text-dim)", minWidth: 24, textAlign: "right" }}>
                      {msg.id}
                    </span>
                    <span style={{ color: "var(--amber-bright)", minWidth: 100, fontSize: 10 }} title={msg.description}>
                      {msg.name}
                    </span>
                    <input
                      className="form-input"
                      style={{ flex: 1, fontSize: 11, fontFamily: "monospace" }}
                      value={game.systemMessages?.[msg.id] ?? ""}
                      placeholder={msg.defaultText}
                      onChange={e => updateSystemMessage(msg.id, e.target.value)}
                    />
                  </div>
                ))}
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
