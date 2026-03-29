import { useState, useEffect } from "react";
import { DaadGame, Flag } from "../../types/daad";
import { SYSTEM_FLAGS, isSystemFlag, getSystemFlag, USER_FLAG_RANGE } from "../../data/systemFlags";
import BatchEditor from "../BatchEditor";
import { useDebounce } from "../../hooks/useDebounce";
import { STATUS_MESSAGE_DURATION } from "../../utils/constants";

interface FlagsPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteDialogState {
  show: boolean;
  flag: Flag | null;
  usageCount: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export default function FlagsPanel({ game, setGame, selectItemId }: FlagsPanelProps) {
  const [selectedFlag, setSelectedFlag] = useState<number | null>(null);
  const [showSystemFlagsRef, setShowSystemFlagsRef] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    show: false,
    flag: null,
    usageCount: 0,
  });
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [idConflictMessage, setIdConflictMessage] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchEditor, setShowBatchEditor] = useState(false);

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedFlag(selectItemId);
    }
  }, [selectItemId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedFlag) return;

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        const flag = (game.flags || []).find((f) => f.id === selectedFlag);
        if (flag) initiateDelete(flag);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFlag, game.flags]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), STATUS_MESSAGE_DURATION);
  };

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
    setSelectedIds(filteredFlags.map((flag) => flag.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Count flag usage in rules
  const getFlagUsageCount = (flagId: number): number => {
    let count = 0;
    (game.rules || []).forEach((rule) => {
      rule.conditions.forEach((cond) => {
        Object.values(cond.params).forEach((param) => {
          if (param === flagId) count++;
        });
      });
      rule.actions.forEach((action) => {
        Object.values(action.params).forEach((param) => {
          if (param === flagId) count++;
        });
      });
    });
    return count;
  };

  const addNewFlag = () => {
    // Find first unused ID (0-255), preferring user range (64-255)
    const usedIds = new Set((game.flags || []).map((f) => f.id));
    let newId = USER_FLAG_RANGE.min; // Start at 64 (user-safe range)
    while (usedIds.has(newId) && newId < 256) newId++;

    if (newId >= 256) {
      showToast("Maximum 256 flags reached!", "error");
      return;
    }

    const newFlag: Flag = {
      id: newId,
      name: `FLAG_${newId}`,
      description: "",
      initialValue: 0,
    };

    setGame((prev) => ({
      ...prev,
      flags: [...(prev.flags || []), newFlag].sort((a, b) => a.id - b.id),
    }));

    setSelectedFlag(newId);
    showToast(`Flag ${newId} created`, "success");
  };

  const initiateDelete = (flag: Flag) => {
    const usageCount = getFlagUsageCount(flag.id);
    setDeleteDialog({ show: true, flag, usageCount });
  };

  const confirmDeleteFlag = () => {
    if (!deleteDialog.flag) return;
    const flagId = deleteDialog.flag.id;

    setGame((prev) => ({
      ...prev,
      flags: (prev.flags || []).filter((f) => f.id !== flagId),
    }));

    setSelectedFlag(null);
    setDeleteDialog({ show: false, flag: null, usageCount: 0 });
    showToast(`Flag ${flagId} deleted`, "success");
  };

  const selectedFl = (game.flags || []).find((f) => f.id === selectedFlag);

  // Filter flags by search term
  const filteredFlags = (game.flags || []).filter((flag) => {
    if (!debouncedSearchTerm) return true;
    const search = debouncedSearchTerm.toLowerCase();
    return (
      flag.name.toLowerCase().includes(search) ||
      flag.description.toLowerCase().includes(search) ||
      flag.id.toString().includes(search)
    );
  });

  return (
    <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            padding: "12px 20px",
            backgroundColor:
              toast.type === "error"
                ? "var(--red-dim)"
                : toast.type === "info"
                ? "var(--blue-dim)"
                : "var(--green-dim)",
            color: "var(--text-primary)",
            border: `2px solid ${
              toast.type === "error"
                ? "var(--red-bright)"
                : toast.type === "info"
                ? "var(--blue-bright)"
                : "var(--green-bright)"
            }`,
            borderRadius: 4,
            zIndex: 1000,
            fontFamily: "'Press Start 2P'",
            fontSize: 10,
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && deleteDialog.flag && (
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
          onClick={() => setDeleteDialog({ show: false, flag: null, usageCount: 0 })}
        >
          <div
            className="card"
            style={{ maxWidth: 500, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--red-bright)", marginBottom: 16 }}>
              Delete Flag {deleteDialog.flag.id}?
            </h3>
            <p style={{ marginBottom: 16 }}>
              <strong>{deleteDialog.flag.name}</strong>
              {deleteDialog.flag.description && (
                <>
                  <br />
                  <span style={{ color: "var(--text-dim)", fontSize: 11 }}>
                    {deleteDialog.flag.description}
                  </span>
                </>
              )}
            </p>

            {deleteDialog.usageCount > 0 && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: "rgba(255, 191, 0, 0.15)",
                  border: "2px solid var(--amber-medium)",
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <div style={{ color: "var(--amber-bright)", fontWeight: "bold", fontSize: 11 }}>
                  ⚠ This flag is used {deleteDialog.usageCount} time{deleteDialog.usageCount !== 1 ? "s" : ""} in rules
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 8 }}>
                  References will remain but become invalid. Update rules manually after deletion.
                </div>
              </div>
            )}

            {isSystemFlag(deleteDialog.flag.id) && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: "rgba(255, 0, 0, 0.15)",
                  border: "2px solid var(--red-medium)",
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <div style={{ color: "var(--red-bright)", fontWeight: "bold", fontSize: 11 }}>
                  ⚠ WARNING: System Flag
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 8 }}>
                  This flag is in the DAAD system range (0-63). Deleting may cause interpreter errors.
                </div>
              </div>
            )}

            <p style={{ color: "var(--text-dim)", fontSize: 11, marginBottom: 20 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteFlag}
                style={{ flex: 1 }}
              >
                Delete Flag
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteDialog({ show: false, flag: null, usageCount: 0 })}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Editor */}
      <BatchEditor
        isOpen={showBatchEditor}
        onClose={() => setShowBatchEditor(false)}
        game={game}
        setGame={setGame}
        targetType="flags"
        selectedIds={selectedIds}
      />

      {/* Main Content */}
      <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
        {/* Flag List */}
        <div style={{ width: 280, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <button className="btn btn-primary" onClick={addNewFlag}>
                + New Variable
              </button>
              <span style={{ color: "var(--text-dim)", marginLeft: 12, fontSize: 14 }}>
                {(game.flags || []).length}/256
              </span>
            </div>
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
            <button
              className="btn btn-secondary"
              style={{ fontSize: 10 }}
              onClick={() => setShowSystemFlagsRef(!showSystemFlagsRef)}
            >
              {showSystemFlagsRef ? "Hide" : "Show"} System Flags (0-63)
            </button>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search flags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", fontSize: 11 }}
            />
          </div>

          {/* System Flags Reference */}
          {showSystemFlagsRef && (
            <div style={{ marginBottom: 12, maxHeight: 300, overflowY: "auto", border: "1px solid var(--cyan-dim)", padding: 8, fontSize: 10 }}>
              <div style={{ color: "var(--cyan-bright)", fontWeight: "bold", marginBottom: 8 }}>
                DAAD System Flags (0-63)
              </div>
              <div style={{ color: "var(--amber-medium)", fontSize: 9, marginBottom: 12 }}>
                ⚠ These flags are managed by the DAAD interpreter. Use flags 64-255 for your game.
              </div>
              {SYSTEM_FLAGS.map(sf => (
                <div key={sf.id} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid var(--cyan-darker)" }}>
                  <div style={{ color: "var(--green-bright)", fontFamily: "monospace" }}>
                    Flag {sf.id}: {sf.name} {sf.readonly && <span style={{ color: "var(--red-medium)" }}>[READ-ONLY]</span>}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 9 }}>
                    {sf.description}
                  </div>
                  {sf.defaultValue !== undefined && (
                    <div style={{ color: "var(--blue-bright)", fontSize: 9 }}>
                      Default: {sf.defaultValue}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredFlags.length === 0 ? (
              <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center", fontSize: 11 }}>
                {searchTerm ? "No flags match your search" : "No flags defined"}
              </div>
            ) : (
              filteredFlags.map((flag) => {
                const isSystem = isSystemFlag(flag.id);
                const usageCount = getFlagUsageCount(flag.id);
                return (
                  <div
                    key={flag.id}
                    className="card"
                    onClick={() => selectionMode ? toggleItemSelection(flag.id) : setSelectedFlag(flag.id)}
                    style={{
                      cursor: "pointer",
                      padding: 12,
                      borderColor: selectionMode
                        ? selectedIds.includes(flag.id)
                          ? "var(--blue-bright)"
                          : undefined
                        : selectedFlag === flag.id
                        ? "var(--green-bright)"
                        : isSystem
                        ? "var(--amber-medium)"
                        : undefined,
                      backgroundColor: selectionMode && selectedIds.includes(flag.id)
                        ? "rgba(66, 153, 225, 0.1)"
                        : isSystem
                        ? "rgba(255, 191, 0, 0.1)"
                        : undefined,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {selectionMode && (
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(flag.id)}
                            onChange={() => toggleItemSelection(flag.id)}
                            style={{ width: 16, height: 16 }}
                          />
                        )}
                        <div>
                          <span style={{ color: isSystem ? "var(--amber-medium)" : "var(--green-dim)", fontFamily: "'Press Start 2P'", fontSize: 8 }}>
                            #{flag.id} {isSystem && "⚠"}
                          </span>
                          <span style={{ marginLeft: 12, color: "var(--text-primary)" }}>
                            {flag.name}
                          </span>
                          {usageCount > 0 && (
                            <span style={{ marginLeft: 8, color: "var(--blue-bright)", fontSize: 9 }}>
                              ({usageCount} use{usageCount !== 1 ? "s" : ""})
                            </span>
                          )}
                        </div>
                      </div>
                      <span style={{ color: "var(--blue-bright)", fontFamily: "monospace" }}>
                        = {flag.initialValue}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Flag Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {selectedFl ? (
            <div className="card" style={{ overflowY: "auto" }}>
              {/* System Flag Warning */}
              {isSystemFlag(selectedFl.id) && (
                <div style={{
                  padding: 12,
                  marginBottom: 16,
                  backgroundColor: "rgba(255, 191, 0, 0.15)",
                  border: "2px solid var(--amber-medium)",
                  borderRadius: 4
                }}>
                  <div style={{ color: "var(--amber-bright)", fontWeight: "bold", marginBottom: 8, fontSize: 12 }}>
                    ⚠ WARNING: System Flag Range
                  </div>
                  <div style={{ color: "var(--text-primary)", fontSize: 11, lineHeight: 1.5 }}>
                    Flag #{selectedFl.id} is in the DAAD system range (0-63).
                    {(() => {
                      const sysFlag = getSystemFlag(selectedFl.id);
                      if (sysFlag) {
                        return (
                          <>
                            <br /><br />
                            <strong style={{ color: "var(--cyan-bright)" }}>{sysFlag.name}:</strong>
                            <br />
                            {sysFlag.description}
                            {sysFlag.readonly && (
                              <>
                                <br /><br />
                                <span style={{ color: "var(--red-bright)" }}>
                                  This flag is READ-ONLY (managed by interpreter).
                                </span>
                              </>
                            )}
                          </>
                        );
                      }
                      return null;
                    })()}
                    <br /><br />
                    <span style={{ color: "var(--green-bright)" }}>
                      Recommended: Use flags 64-255 for your game variables.
                    </span>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Variable ID (0-255)</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedFl.id}
                  min={0}
                  max={255}
                  onChange={(e) => {
                    const newId = parseInt(e.target.value);
                    if (newId < 0 || newId > 255) return;
                    if ((game.flags || []).some((f) => f.id === newId && f.id !== selectedFl.id)) {
                      setIdConflictMessage(`Flag ID ${newId} is already in use!`);
                      showToast(`Flag ID ${newId} is already in use!`, "error");
                      setTimeout(() => setIdConflictMessage(null), STATUS_MESSAGE_DURATION);
                      return;
                    }
                    if (newId < 64 && !isSystemFlag(newId)) {
                      setIdConflictMessage(`Warning: Flag ${newId} is in the system range (0-63). Use 64-255 for game variables.`);
                      setTimeout(() => setIdConflictMessage(null), STATUS_MESSAGE_DURATION * 2);
                    }
                    if (isSystemFlag(newId)) {
                      const sf = getSystemFlag(newId);
                      if (sf?.readonly) {
                        setIdConflictMessage(`Flag ${newId} (${sf.name}) is read-only — managed by the DAAD interpreter!`);
                        showToast(`Flag ${newId} is read-only!`, "error");
                        setTimeout(() => setIdConflictMessage(null), STATUS_MESSAGE_DURATION);
                        return;
                      }
                    }
                    setIdConflictMessage(null);
                    setGame((prev) => ({
                      ...prev,
                      flags: (prev.flags || [])
                        .map((f) => (f.id === selectedFl.id ? { ...f, id: newId } : f))
                        .sort((a, b) => a.id - b.id),
                    }));
                    setSelectedFlag(newId);
                  }}
                  style={{
                    borderColor: idConflictMessage ? "var(--red-bright)" : undefined,
                  }}
                />
                {idConflictMessage ? (
                  <div style={{ fontSize: 10, color: "var(--red-bright)", marginTop: 4 }}>
                    {idConflictMessage}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
                    User-safe range: 64-255 | System range: 0-63
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedFl.name}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      flags: (prev.flags || []).map((f) =>
                        f.id === selectedFl.id ? { ...f, name: e.target.value } : f
                      ),
                    }))
                  }
                  placeholder="e.g., SCORE, HEALTH, DOOR_OPEN"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input form-textarea"
                  value={selectedFl.description}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      flags: (prev.flags || []).map((f) =>
                        f.id === selectedFl.id ? { ...f, description: e.target.value } : f
                      ),
                    }))
                  }
                  placeholder="What does this flag track?"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Value (0-255)</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedFl.initialValue}
                  min={0}
                  max={255}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      flags: (prev.flags || []).map((f) =>
                        f.id === selectedFl.id
                          ? { ...f, initialValue: Math.min(255, Math.max(0, parseInt(e.target.value) || 0)) }
                          : f
                      ),
                    }))
                  }
                />
              </div>

              {/* Common flag presets */}
              <div style={{ marginTop: 20 }}>
                <label className="form-label">Quick Presets</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {[
                    { name: "SCORE", desc: "Player's score" },
                    { name: "HEALTH", desc: "Player's health" },
                    { name: "TURNS", desc: "Turn counter" },
                    { name: "LIGHT", desc: "Light source active" },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      className="btn btn-secondary"
                      style={{ fontSize: 10, padding: "8px 12px" }}
                      onClick={() =>
                        setGame((prev) => ({
                          ...prev,
                          flags: (prev.flags || []).map((f) =>
                            f.id === selectedFl.id
                              ? { ...f, name: preset.name, description: preset.desc }
                              : f
                          ),
                        }))
                      }
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-danger"
                style={{ marginTop: 24 }}
                onClick={() => initiateDelete(selectedFl)}
              >
                Delete Flag
              </button>
            </div>
          ) : (
            <div className="card" style={{ color: "var(--text-dim)", textAlign: "center", padding: 48 }}>
              <p style={{ fontSize: 20 }}>Select a flag</p>
              <p>to edit its properties</p>
              <p style={{ marginTop: 20, fontSize: 14 }}>
                Variables are numbers (0-255) used to track game state
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
