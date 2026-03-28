import { useState, useMemo } from "react";
import { DaadGame } from "../../types/daad";
import "../../styles/debug.css";

interface FlagInspectorProps {
  game: DaadGame;
  setGame: (game: DaadGame | ((prev: DaadGame) => DaadGame)) => void;
}

type FlagFilter = "all" | "set" | "unset" | "named";
type FlagDisplay = "decimal" | "hex" | "binary";

export default function FlagInspector({ game, setGame }: FlagInspectorProps) {
  const [filter, setFilter] = useState<FlagFilter>("all");
  const [display, setDisplay] = useState<FlagDisplay>("decimal");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFlag, setEditingFlag] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // DAAD has 256 flags (0-255)
  const FLAG_COUNT = 256;

  // Create map of flag names from game data
  const flagNames = useMemo(() => {
    const names: Record<number, string> = {};
    game.flags.forEach((flag) => {
      if (flag.name && flag.name.trim()) {
        names[flag.id] = flag.name;
      }
    });
    return names;
  }, [game.flags]);

  // Get current flag values (initialize to 0 if not set)
  const getFlagValue = (flagId: number): number => {
    const flag = game.flags.find((f) => f.id === flagId);
    return flag?.initialValue ?? 0;
  };

  // Format value based on display mode
  const formatValue = (value: number): string => {
    switch (display) {
      case "hex":
        return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
      case "binary":
        return `0b${value.toString(2).padStart(8, "0")}`;
      default:
        return value.toString();
    }
  };

  // Filter flags
  const filteredFlags = useMemo(() => {
    const flags: Array<{ id: number; value: number; name?: string }> = [];

    for (let i = 0; i < FLAG_COUNT; i++) {
      const value = getFlagValue(i);
      const name = flagNames[i];

      // Apply filter
      if (filter === "set" && value === 0) continue;
      if (filter === "unset" && value !== 0) continue;
      if (filter === "named" && !name) continue;

      // Apply search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const idMatch = i.toString().includes(searchLower);
        const nameMatch = name?.toLowerCase().includes(searchLower);
        const valueMatch = value.toString().includes(searchLower);

        if (!idMatch && !nameMatch && !valueMatch) continue;
      }

      flags.push({ id: i, value, name });
    }

    return flags;
  }, [filter, searchTerm, game.flags, flagNames]);

  // Handle flag value update
  const updateFlagValue = (flagId: number, newValue: number) => {
    setGame((prev) => {
      const existingFlag = prev.flags.find((f) => f.id === flagId);

      if (existingFlag) {
        // Update existing flag
        return {
          ...prev,
          flags: prev.flags.map((f) =>
            f.id === flagId ? { ...f, initialValue: newValue } : f
          ),
        };
      } else {
        // Create new flag entry
        return {
          ...prev,
          flags: [
            ...prev.flags,
            {
              id: flagId,
              name: "",
              initialValue: newValue,
              description: "",
            },
          ],
        };
      }
    });
  };

  // Start editing a flag
  const startEditing = (flagId: number, currentValue: number) => {
    setEditingFlag(flagId);
    setEditValue(currentValue.toString());
  };

  // Save edited value
  const saveEdit = (flagId: number) => {
    const newValue = parseInt(editValue, 10);
    if (!isNaN(newValue) && newValue >= 0 && newValue <= 255) {
      updateFlagValue(flagId, newValue);
    }
    setEditingFlag(null);
    setEditValue("");
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingFlag(null);
    setEditValue("");
  };

  // Keyboard handler for edit field
  const handleEditKeyDown = (e: React.KeyboardEvent, flagId: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit(flagId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  return (
    <div className="flag-inspector">
      {/* Header */}
      <div className="flag-inspector-header">
        <h3>Flag Inspector</h3>
        <div className="flag-inspector-stats">
          {filteredFlags.length} / {FLAG_COUNT} flags
        </div>
      </div>

      {/* Controls */}
      <div className="flag-inspector-controls">
        {/* Search */}
        <input
          type="text"
          className="flag-search"
          placeholder="Search flags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter */}
        <div className="flag-filter-group">
          <label>Filter:</label>
          <select
            className="flag-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FlagFilter)}
          >
            <option value="all">All Flags</option>
            <option value="set">Set Only</option>
            <option value="unset">Unset Only</option>
            <option value="named">Named Only</option>
          </select>
        </div>

        {/* Display Mode */}
        <div className="flag-display-group">
          <label>Display:</label>
          <select
            className="flag-display"
            value={display}
            onChange={(e) => setDisplay(e.target.value as FlagDisplay)}
          >
            <option value="decimal">Decimal</option>
            <option value="hex">Hexadecimal</option>
            <option value="binary">Binary</option>
          </select>
        </div>
      </div>

      {/* Flag List */}
      <div className="flag-list">
        <div className="flag-list-header">
          <div className="flag-col-id">ID</div>
          <div className="flag-col-name">Name</div>
          <div className="flag-col-value">Value</div>
          <div className="flag-col-actions">Actions</div>
        </div>

        <div className="flag-list-body">
          {filteredFlags.length === 0 ? (
            <div className="flag-list-empty">
              No flags match the current filter
            </div>
          ) : (
            filteredFlags.map(({ id, value, name }) => (
              <div
                key={id}
                className={`flag-row ${value !== 0 ? "flag-row-set" : ""}`}
              >
                <div className="flag-col-id">{id}</div>
                <div className="flag-col-name">
                  {name || <span className="flag-no-name">—</span>}
                </div>
                <div className="flag-col-value">
                  {editingFlag === id ? (
                    <input
                      type="number"
                      className="flag-value-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, id)}
                      onBlur={() => saveEdit(id)}
                      autoFocus
                      min={0}
                      max={255}
                    />
                  ) : (
                    <span
                      className="flag-value-display"
                      onDoubleClick={() => startEditing(id, value)}
                      title="Double-click to edit"
                    >
                      {formatValue(value)}
                    </span>
                  )}
                </div>
                <div className="flag-col-actions">
                  {editingFlag === id ? (
                    <>
                      <button
                        className="flag-action-btn flag-save-btn"
                        onClick={() => saveEdit(id)}
                        title="Save (Enter)"
                      >
                        ✓
                      </button>
                      <button
                        className="flag-action-btn flag-cancel-btn"
                        onClick={cancelEdit}
                        title="Cancel (Esc)"
                      >
                        ✗
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flag-action-btn"
                        onClick={() => startEditing(id, value)}
                        title="Edit value"
                      >
                        ✎
                      </button>
                      <button
                        className="flag-action-btn"
                        onClick={() => updateFlagValue(id, 0)}
                        title="Clear flag"
                        disabled={value === 0}
                      >
                        ⌫
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer with quick actions */}
      <div className="flag-inspector-footer">
        <button
          className="flag-bulk-action"
          onClick={() => {
            setGame((prev) => ({
              ...prev,
              flags: prev.flags.map((f) => ({ ...f, initialValue: 0 })),
            }));
          }}
          title="Clear all flag values"
        >
          Clear All Flags
        </button>
        <button
          className="flag-bulk-action"
          onClick={() => {
            // Export flags as JSON for debugging
            const flagData = filteredFlags.map(({ id, value, name }) => ({
              id,
              name: name || null,
              value,
            }));
            console.log("Flag Inspector Export:", flagData);
            navigator.clipboard.writeText(JSON.stringify(flagData, null, 2));
          }}
          title="Copy filtered flags to clipboard as JSON"
        >
          Export to Clipboard
        </button>
      </div>
    </div>
  );
}
