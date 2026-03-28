import { useState, useMemo } from "react";
import { DaadGame, Rule } from "../../types/daad";
import "../../styles/debug.css";

interface BreakpointManagerProps {
  game: DaadGame;
}

export interface Breakpoint {
  id: string;
  ruleId: number;
  ruleName: string;
  enabled: boolean;
  hitCount: number;
  condition?: string; // Optional conditional breakpoint
  createdAt: number;
}

type BreakpointFilter = "all" | "enabled" | "disabled";
type BreakpointSort = "recent" | "rule-id" | "hit-count";

export default function BreakpointManager({ game }: BreakpointManagerProps) {
  const [breakpoints, setBreakpoints] = useState<Breakpoint[]>([]);
  const [filter, setFilter] = useState<BreakpointFilter>("all");
  const [sort, setSort] = useState<BreakpointSort>("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreakpoint, setSelectedBreakpoint] = useState<Breakpoint | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBreakpointRule, setNewBreakpointRule] = useState<number | null>(null);
  const [newBreakpointCondition, setNewBreakpointCondition] = useState("");

  // Get rules for selection
  const availableRules = useMemo(() => {
    return game.rules.map((rule) => ({
      id: rule.id,
      name: rule.name || `Rule ${rule.id}`,
    }));
  }, [game.rules]);

  // Filter and sort breakpoints
  const filteredBreakpoints = useMemo(() => {
    return breakpoints
      .filter((bp) => {
        // Apply filter
        if (filter === "enabled" && !bp.enabled) return false;
        if (filter === "disabled" && bp.enabled) return false;

        // Apply search
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const nameMatch = bp.ruleName.toLowerCase().includes(searchLower);
          const idMatch = bp.ruleId.toString().includes(searchLower);
          const condMatch = bp.condition?.toLowerCase().includes(searchLower);

          if (!nameMatch && !idMatch && !condMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case "rule-id":
            return a.ruleId - b.ruleId;
          case "hit-count":
            return b.hitCount - a.hitCount;
          case "recent":
          default:
            return b.createdAt - a.createdAt;
        }
      });
  }, [breakpoints, filter, sort, searchTerm]);

  // Add a new breakpoint
  const addBreakpoint = () => {
    if (newBreakpointRule === null) return;

    const rule = game.rules.find((r) => r.id === newBreakpointRule);
    if (!rule) return;

    // Check if breakpoint already exists
    const exists = breakpoints.some((bp) => bp.ruleId === newBreakpointRule);
    if (exists) {
      alert("Breakpoint already exists for this rule");
      return;
    }

    const newBreakpoint: Breakpoint = {
      id: `bp-${Date.now()}-${Math.random()}`,
      ruleId: rule.id,
      ruleName: rule.name || `Rule ${rule.id}`,
      enabled: true,
      hitCount: 0,
      condition: newBreakpointCondition.trim() || undefined,
      createdAt: Date.now(),
    };

    setBreakpoints((prev) => [...prev, newBreakpoint]);
    setShowAddDialog(false);
    setNewBreakpointRule(null);
    setNewBreakpointCondition("");
  };

  // Remove a breakpoint
  const removeBreakpoint = (id: string) => {
    setBreakpoints((prev) => prev.filter((bp) => bp.id !== id));
    if (selectedBreakpoint?.id === id) {
      setSelectedBreakpoint(null);
    }
  };

  // Toggle breakpoint enabled state
  const toggleBreakpoint = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) => (bp.id === id ? { ...bp, enabled: !bp.enabled } : bp))
    );
  };

  // Enable all breakpoints
  const enableAll = () => {
    setBreakpoints((prev) => prev.map((bp) => ({ ...bp, enabled: true })));
  };

  // Disable all breakpoints
  const disableAll = () => {
    setBreakpoints((prev) => prev.map((bp) => ({ ...bp, enabled: false })));
  };

  // Clear all breakpoints
  const clearAll = () => {
    if (confirm("Are you sure you want to remove all breakpoints?")) {
      setBreakpoints([]);
      setSelectedBreakpoint(null);
    }
  };

  // Reset hit counts
  const resetHitCounts = () => {
    setBreakpoints((prev) => prev.map((bp) => ({ ...bp, hitCount: 0 })));
  };

  // Simulate breakpoint hit (for demo)
  const simulateHit = (id: string) => {
    setBreakpoints((prev) =>
      prev.map((bp) =>
        bp.id === id ? { ...bp, hitCount: bp.hitCount + 1 } : bp
      )
    );
  };

  // Export breakpoints
  const exportBreakpoints = () => {
    const data = JSON.stringify(breakpoints, null, 2);
    navigator.clipboard.writeText(data);
    console.log("Breakpoints exported to clipboard");
  };

  return (
    <div className="breakpoint-manager">
      {/* Header */}
      <div className="breakpoint-manager-header">
        <h3>Breakpoint Manager</h3>
        <div className="breakpoint-manager-stats">
          {filteredBreakpoints.length} / {breakpoints.length} breakpoints
        </div>
      </div>

      {/* Controls */}
      <div className="breakpoint-manager-controls">
        {/* Search */}
        <input
          type="text"
          className="breakpoint-search"
          placeholder="Search breakpoints..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Filter */}
        <div className="breakpoint-control-group">
          <label>Filter:</label>
          <select
            className="breakpoint-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as BreakpointFilter)}
          >
            <option value="all">All</option>
            <option value="enabled">Enabled Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="breakpoint-control-group">
          <label>Sort:</label>
          <select
            className="breakpoint-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as BreakpointSort)}
          >
            <option value="recent">Most Recent</option>
            <option value="rule-id">Rule ID</option>
            <option value="hit-count">Hit Count</option>
          </select>
        </div>

        {/* Actions */}
        <button
          className="breakpoint-btn add-btn"
          onClick={() => setShowAddDialog(true)}
          title="Add new breakpoint"
        >
          + Add
        </button>
      </div>

      {/* Breakpoint List */}
      <div className="breakpoint-list">
        {filteredBreakpoints.length === 0 ? (
          <div className="breakpoint-empty">
            {breakpoints.length === 0
              ? "No breakpoints set. Click '+ Add' to create one."
              : "No breakpoints match the current filter."}
          </div>
        ) : (
          filteredBreakpoints.map((bp) => (
            <div
              key={bp.id}
              className={`breakpoint-entry ${bp.enabled ? "enabled" : "disabled"} ${
                selectedBreakpoint?.id === bp.id ? "selected" : ""
              }`}
              onClick={() => setSelectedBreakpoint(bp)}
            >
              <div className="breakpoint-header">
                <button
                  className="breakpoint-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBreakpoint(bp.id);
                  }}
                  title={bp.enabled ? "Disable breakpoint" : "Enable breakpoint"}
                >
                  {bp.enabled ? "●" : "○"}
                </button>
                <span className="breakpoint-name">{bp.ruleName}</span>
                <span className="breakpoint-id">#{bp.ruleId}</span>
                <span className="breakpoint-hits" title="Number of times hit">
                  {bp.hitCount} hits
                </span>
                <button
                  className="breakpoint-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBreakpoint(bp.id);
                  }}
                  title="Remove breakpoint"
                >
                  ✕
                </button>
              </div>
              {bp.condition && (
                <div className="breakpoint-condition">
                  Condition: <code>{bp.condition}</code>
                </div>
              )}
              {selectedBreakpoint?.id === bp.id && (
                <div className="breakpoint-details">
                  <div className="breakpoint-detail-row">
                    <strong>Rule ID:</strong> {bp.ruleId}
                  </div>
                  <div className="breakpoint-detail-row">
                    <strong>Status:</strong>{" "}
                    {bp.enabled ? (
                      <span className="status-enabled">Enabled</span>
                    ) : (
                      <span className="status-disabled">Disabled</span>
                    )}
                  </div>
                  <div className="breakpoint-detail-row">
                    <strong>Hit Count:</strong> {bp.hitCount}
                  </div>
                  {bp.condition && (
                    <div className="breakpoint-detail-row">
                      <strong>Condition:</strong> <code>{bp.condition}</code>
                    </div>
                  )}
                  <div className="breakpoint-actions">
                    <button
                      className="breakpoint-action-btn"
                      onClick={() => simulateHit(bp.id)}
                    >
                      Simulate Hit
                    </button>
                    <button
                      className="breakpoint-action-btn"
                      onClick={() => {
                        setBreakpoints((prev) =>
                          prev.map((b) =>
                            b.id === bp.id ? { ...b, hitCount: 0 } : b
                          )
                        );
                      }}
                    >
                      Reset Count
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="breakpoint-footer">
        <button className="breakpoint-bulk-btn" onClick={enableAll}>
          Enable All
        </button>
        <button className="breakpoint-bulk-btn" onClick={disableAll}>
          Disable All
        </button>
        <button className="breakpoint-bulk-btn" onClick={resetHitCounts}>
          Reset Counts
        </button>
        <button className="breakpoint-bulk-btn" onClick={clearAll}>
          Clear All
        </button>
        <button className="breakpoint-bulk-btn" onClick={exportBreakpoints}>
          Export
        </button>
      </div>

      {/* Add Breakpoint Dialog */}
      {showAddDialog && (
        <div className="breakpoint-dialog-overlay" onClick={() => setShowAddDialog(false)}>
          <div className="breakpoint-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="breakpoint-dialog-header">
              <h3>Add Breakpoint</h3>
              <button
                className="breakpoint-dialog-close"
                onClick={() => setShowAddDialog(false)}
              >
                ✕
              </button>
            </div>
            <div className="breakpoint-dialog-body">
              <div className="breakpoint-dialog-field">
                <label>Rule:</label>
                <select
                  className="breakpoint-dialog-select"
                  value={newBreakpointRule ?? ""}
                  onChange={(e) =>
                    setNewBreakpointRule(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                >
                  <option value="">Select a rule...</option>
                  {availableRules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      #{rule.id} - {rule.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="breakpoint-dialog-field">
                <label>Condition (optional):</label>
                <input
                  type="text"
                  className="breakpoint-dialog-input"
                  placeholder="e.g., flag[5] > 10"
                  value={newBreakpointCondition}
                  onChange={(e) => setNewBreakpointCondition(e.target.value)}
                />
                <small className="breakpoint-dialog-hint">
                  Leave empty for unconditional breakpoint
                </small>
              </div>
            </div>
            <div className="breakpoint-dialog-footer">
              <button
                className="breakpoint-dialog-btn cancel"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </button>
              <button
                className="breakpoint-dialog-btn confirm"
                onClick={addBreakpoint}
                disabled={newBreakpointRule === null}
              >
                Add Breakpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
