import { useState, useEffect } from "react";
import { DaadGame } from "../../types/daad";
import BatchEditor from "../BatchEditor";
import { useDebounce } from "../../hooks/useDebounce";
import { STATUS_MESSAGE_DURATION } from "../../utils/constants";
import { SYSTEM_MESSAGES, isSystemMessage, getSystemMessage } from "../../data/systemMessages";

interface MessagesPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteDialogState {
  show: boolean;
  messageIndex: number | null;
  usageCount: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export default function MessagesPanel({ game, setGame, selectItemId }: MessagesPanelProps) {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    show: false,
    messageIndex: null,
    usageCount: 0,
  });
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchEditor, setShowBatchEditor] = useState(false);

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedMessage(selectItemId);
    }
  }, [selectItemId]);

  // Track if editText differs from saved message
  useEffect(() => {
    if (selectedMessage !== null) {
      setHasUnsavedChanges(editText !== game.messages?.[selectedMessage]);
    }
  }, [editText, selectedMessage, game.messages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if (e.ctrlKey && e.key === "s" && selectedMessage !== null) {
        e.preventDefault();
        saveMessage();
      }

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") &&
          selectedMessage !== null &&
          document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        initiateDelete(selectedMessage);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMessage, editText]);

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
    setSelectedIds(filteredMessages.map((item) => item.index));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  // Count message usage in rules
  const getMessageUsageCount = (messageIndex: number): number => {
    let count = 0;
    (game.rules || []).forEach((rule) => {
      rule.conditions.forEach((cond) => {
        Object.values(cond.params).forEach((param) => {
          if (param === messageIndex) count++;
        });
      });
      rule.actions.forEach((action) => {
        // MES, MESSAGE, SYSMESS, XMES, XMESSAGE actions use message indices
        if (["MES", "MESSAGE", "SYSMESS", "XMES", "XMESSAGE"].includes(action.type)) {
          Object.values(action.params).forEach((param) => {
            if (param === messageIndex) count++;
          });
        }
      });
    });
    return count;
  };

  const addNewMessage = () => {
    if ((game.messages || []).length >= 255) {
      showToast("Maximum 255 messages reached!", "error");
      return;
    }

    setGame((prev) => ({
      ...prev,
      messages: [...(prev.messages || []), "New message"],
    }));
    const newIndex = (game.messages || []).length;
    setSelectedMessage(newIndex);
    setEditText("New message");
    setHasUnsavedChanges(false);
    showToast(`Message ${newIndex} created`, "success");
  };

  const initializeSystemMessages = () => {
    const messages = game.messages || [];

    // If already have 53+ messages, ask confirmation
    if (messages.length >= 53) {
      if (!confirm(`You already have ${messages.length} messages. Initialize system messages (0-52) with defaults? This will overwrite existing messages 0-52.`)) {
        return;
      }
    }

    // Create array with at least 53 slots
    const newMessages: string[] = [];

    // Fill with system messages (0-52)
    for (let i = 0; i <= 52; i++) {
      const sysMsg = getSystemMessage(i);
      newMessages[i] = sysMsg ? sysMsg.defaultText : messages[i] || `System message ${i}`;
    }

    // Preserve any existing custom messages (53+)
    for (let i = 53; i < messages.length; i++) {
      newMessages[i] = messages[i];
    }

    setGame((prev) => ({
      ...prev,
      messages: newMessages,
    }));

    showToast("System messages 0-52 initialized!", "success");
  };

  const selectMessage = (index: number) => {
    setSelectedMessage(index);
    setEditText(game.messages?.[index] || "");
    setHasUnsavedChanges(false);
  };

  const saveMessage = () => {
    if (selectedMessage === null) return;
    setGame((prev) => ({
      ...prev,
      messages: (prev.messages || []).map((msg, i) =>
        i === selectedMessage ? editText : msg
      ),
    }));
    setHasUnsavedChanges(false);
    showToast(`Message ${selectedMessage} saved`, "success");
  };

  const initiateDelete = (messageIndex: number) => {
    const usageCount = getMessageUsageCount(messageIndex);
    setDeleteDialog({ show: true, messageIndex, usageCount });
  };

  const confirmDeleteMessage = () => {
    if (deleteDialog.messageIndex === null) return;
    const messageIndex = deleteDialog.messageIndex;

    setGame((prev) => {
      // Remove the message
      const newMessages = (prev.messages || []).filter((_, i) => i !== messageIndex);

      // Update all rule references to account for index shift
      const updatedRules = (prev.rules || []).map((rule) => ({
        ...rule,
        // Conditions typically don't reference messages, so skip for now
        // In DAAD, messages are primarily used in actions like MES/MESSAGE
        conditions: rule.conditions,
        actions: rule.actions.map((action) => {
          // Only update message-related actions
          if (["MES", "MESSAGE", "SYSMESS", "XMES", "XMESSAGE"].includes(action.type)) {
            return {
              ...action,
              params: Object.fromEntries(
                Object.entries(action.params).map(([key, value]) => {
                  if (typeof value === "number") {
                    if (value === messageIndex) {
                      return [key, 0]; // Fallback to message 0
                    } else if (value > messageIndex) {
                      return [key, value - 1]; // Shift down
                    }
                  }
                  return [key, value];
                })
              ),
            };
          }
          return action;
        }),
      }));

      return {
        ...prev,
        messages: newMessages,
        rules: updatedRules,
      };
    });

    setSelectedMessage(null);
    setEditText("");
    setDeleteDialog({ show: false, messageIndex: null, usageCount: 0 });
    showToast(`Message ${messageIndex} deleted and references updated`, "success");
  };

  // Filter messages by search term
  const filteredMessages = (game.messages || [])
    .map((msg, index) => ({ msg, index }))
    .filter(({ msg, index }) => {
      if (!debouncedSearchTerm) return true;
      const search = debouncedSearchTerm.toLowerCase();
      return (
        msg.toLowerCase().includes(search) ||
        index.toString().includes(search)
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
      {deleteDialog.show && deleteDialog.messageIndex !== null && (
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
          onClick={() => setDeleteDialog({ show: false, messageIndex: null, usageCount: 0 })}
        >
          <div
            className="card"
            style={{ maxWidth: 500, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--red-bright)", marginBottom: 16 }}>
              Delete Message {deleteDialog.messageIndex}?
            </h3>
            <p style={{ marginBottom: 16, fontFamily: "monospace", color: "var(--text-dim)" }}>
              "{(game.messages?.[deleteDialog.messageIndex] || "").substring(0, 100)}
              {(game.messages?.[deleteDialog.messageIndex] || "").length > 100 ? "..." : ""}"
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
                  ⚠ This message is used {deleteDialog.usageCount} time{deleteDialog.usageCount !== 1 ? "s" : ""} in rules
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 8 }}>
                  Rule references will be updated to message 0 (fallback).
                </div>
              </div>
            )}

            <div
              style={{
                padding: 12,
                backgroundColor: "rgba(0, 191, 255, 0.15)",
                border: "2px solid var(--blue-medium)",
                borderRadius: 4,
                marginBottom: 16,
              }}
            >
              <div style={{ color: "var(--blue-bright)", fontWeight: "bold", fontSize: 11 }}>
                ℹ Index Shift Warning
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 8 }}>
                All messages after #{deleteDialog.messageIndex} will shift down by 1.
                Rule references will be automatically updated.
              </div>
            </div>

            <p style={{ color: "var(--text-dim)", fontSize: 11, marginBottom: 20 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteMessage}
                style={{ flex: 1 }}
              >
                Delete Message
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteDialog({ show: false, messageIndex: null, usageCount: 0 })}
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
        targetType="messages"
        selectedIds={selectedIds}
      />

      {/* Main Content */}
      <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
        {/* Message List */}
        <div style={{ width: 350, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <button className="btn btn-primary" onClick={addNewMessage} style={{ width: "100%" }}>
                  + Add Message
                </button>
                <span style={{ color: "var(--text-dim)", marginLeft: 12, fontSize: 14 }}>
                  {(game.messages || []).length}/255
                </span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={initializeSystemMessages}
                style={{ fontSize: 11, padding: "8px 12px", whiteSpace: "nowrap" }}
                title="Initialize system messages 0-52 with DAAD defaults"
              >
                📋 Init System
              </button>
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
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", fontSize: 11 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredMessages.length === 0 ? (
              <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center", fontSize: 11 }}>
                {searchTerm ? "No messages match your search" : "No messages defined"}
              </div>
            ) : (
              filteredMessages.map(({ msg, index }) => {
                const usageCount = getMessageUsageCount(index);
                const sysMsg = isSystemMessage(index) ? getSystemMessage(index) : null;
                return (
                  <div
                    key={index}
                    className="card"
                    onClick={() => selectionMode ? toggleItemSelection(index) : selectMessage(index)}
                    style={{
                      cursor: "pointer",
                      padding: 12,
                      borderColor: selectionMode
                        ? selectedIds.includes(index)
                          ? "var(--blue-bright)"
                          : undefined
                        : selectedMessage === index
                        ? "var(--green-bright)"
                        : sysMsg
                        ? "var(--amber-dim)"
                        : undefined,
                      backgroundColor: selectionMode && selectedIds.includes(index)
                        ? "rgba(66, 153, 225, 0.1)"
                        : sysMsg
                        ? "rgba(255, 200, 0, 0.05)"
                        : undefined,
                    }}
                  >
                    <div style={{ display: "flex", gap: 12 }}>
                      {selectionMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(index)}
                          onChange={() => toggleItemSelection(index)}
                          style={{ width: 16, height: 16 }}
                        />
                      )}
                      <span style={{
                        color: sysMsg ? "var(--amber-bright)" : "var(--amber-medium)",
                        fontFamily: "'Press Start 2P'",
                        fontSize: 8,
                        minWidth: 40
                      }}>
                        #{index}
                      </span>
                      <div style={{ flex: 1, overflow: "hidden" }}>
                        {sysMsg && (
                          <div style={{ color: "var(--amber-bright)", fontSize: 9, marginBottom: 4, fontWeight: "bold" }}>
                            📋 {sysMsg.name}
                          </div>
                        )}
                        <div style={{
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {msg.length > 50 ? msg.slice(0, 50) + "..." : msg}
                        </div>
                        {usageCount > 0 && (
                          <div style={{ color: "var(--blue-bright)", fontSize: 9, marginTop: 4 }}>
                            ({usageCount} use{usageCount !== 1 ? "s" : ""})
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Message Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {selectedMessage !== null ? (
            <div className="card" style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Press Start 2P'", fontSize: 10, color: "var(--amber-bright)" }}>
                  MESSAGE #{selectedMessage}
                </span>
                {hasUnsavedChanges && (
                  <span style={{ color: "var(--amber-medium)", fontSize: 10 }}>
                    * Unsaved changes
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Message Text</label>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: 200, fontFamily: "'VT323', monospace", fontSize: 16 }}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter message text..."
                />
              </div>

              {/* System Message Info */}
              {isSystemMessage(selectedMessage) && (
                <div style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "rgba(255, 200, 0, 0.1)",
                  border: "1px solid var(--amber-dim)",
                  borderRadius: 4
                }}>
                  <div style={{ color: "var(--amber-bright)", fontSize: 12, marginBottom: 4, fontWeight: "bold" }}>
                    📋 System Message #{selectedMessage}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 11 }}>
                    <strong>{getSystemMessage(selectedMessage)?.name}</strong> - {getSystemMessage(selectedMessage)?.description}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 4 }}>
                    Category: {getSystemMessage(selectedMessage)?.category}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 8, color: "var(--text-dim)", fontSize: 14 }}>
                Character count: {editText.length}
                {editText.length > 255 && (
                  <span style={{ color: "var(--amber-bright)", marginLeft: 8 }}>
                    (⚠ Long messages may be truncated on some platforms)
                  </span>
                )}
              </div>

              {/* Preview */}
              <div style={{ marginTop: 20 }}>
                <label className="form-label">Preview</label>
                <div
                  style={{
                    background: "var(--bg-dark)",
                    border: "2px solid var(--green-dim)",
                    padding: 16,
                    marginTop: 8,
                    fontFamily: "'VT323', monospace",
                    fontSize: 18,
                    color: "var(--green-bright)",
                    whiteSpace: "pre-wrap",
                    minHeight: 100,
                  }}
                >
                  {editText || "(empty message)"}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  className="btn btn-primary"
                  onClick={saveMessage}
                  disabled={!hasUnsavedChanges}
                  style={{
                    opacity: hasUnsavedChanges ? 1 : 0.5,
                    cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
                  }}
                >
                  Save Changes {hasUnsavedChanges ? "*" : ""}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => initiateDelete(selectedMessage)}
                >
                  Delete
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 10, color: "var(--text-dim)" }}>
                Keyboard shortcuts: Ctrl+S to save, Delete to remove
              </div>
            </div>
          ) : (
            <div className="card" style={{ color: "var(--text-dim)", textAlign: "center", padding: 48 }}>
              <p style={{ fontSize: 20 }}>Select a message</p>
              <p>to edit its content</p>
              <p style={{ marginTop: 20, fontSize: 14 }}>
                Messages are reusable text displayed during gameplay
              </p>
            </div>
          )}

          {/* Common messages hint */}
          {selectedMessage === null && (
            <div style={{ marginTop: 24 }}>
              <div className="card" style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                <p style={{ fontWeight: "bold", color: "var(--cyan-bright)", marginBottom: 8 }}>
                  Common message types:
                </p>
                <ul style={{ marginTop: 8, marginLeft: 20, lineHeight: 1.8 }}>
                  <li>System responses ("You can't do that")</li>
                  <li>Object descriptions</li>
                  <li>Story text and dialogue</li>
                  <li>Win/lose messages</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
