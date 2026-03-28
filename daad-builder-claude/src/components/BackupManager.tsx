import { useState, useEffect } from "react";
import { DaadGame } from "../types/daad";
import * as backupService from "../services/backupService";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface BackupManagerProps {
  isOpen: boolean;
  onClose: () => void;
  game: DaadGame;
  setGame: (game: DaadGame) => void;
  projectName: string;
  onConfirm?: (message: string, onConfirm: () => void) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

export default function BackupManager({
  isOpen,
  onClose,
  game,
  setGame,
  projectName,
  onConfirm,
  onError,
  onSuccess,
}: BackupManagerProps) {
  // Close on Escape key
  useEscapeKey(onClose, isOpen);

  const [backups, setBackups] = useState<backupService.Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [newBackupDescription, setNewBackupDescription] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadBackups();
    }
  }, [isOpen]);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const allBackups = await backupService.listBackups(projectName);
      setBackups(allBackups);
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!newBackupDescription.trim()) {
      onError?.("Please enter a description for this backup");
      return;
    }

    try {
      await backupService.createBackup(
        projectName || "Untitled",
        game,
        newBackupDescription,
        false
      );
      setNewBackupDescription("");
      setShowCreateForm(false);
      loadBackups();
      onSuccess?.("Backup created successfully");
    } catch (err) {
      console.error("Failed to create backup:", err);
      onError?.("Failed to create backup");
    }
  };

  const handleRestore = async (backupId: number, description: string) => {
    const performRestore = async () => {
      try {
        const restoredGame = await backupService.restoreBackup(backupId);
        if (restoredGame) {
          setGame(restoredGame);
          onSuccess?.(`Backup restored: ${description}`);
          onClose();
        }
      } catch (err) {
        console.error("Failed to restore backup:", err);
        onError?.("Failed to restore backup");
      }
    };

    if (onConfirm) {
      onConfirm(
        `Restore backup: "${description}"?\n\nThis will replace your current game state.`,
        performRestore
      );
    } else {
      // Fallback to window.confirm if no onConfirm provided
      const confirmed = window.confirm(
        `Restore backup: "${description}"?\n\nThis will replace your current game state.`
      );
      if (confirmed) await performRestore();
    }
  };

  const handleDelete = async (backupId: number, description: string) => {
    const performDelete = async () => {
      try {
        await backupService.deleteBackup(backupId);
        loadBackups();
        onSuccess?.(`Backup deleted: ${description}`);
      } catch (err) {
        console.error("Failed to delete backup:", err);
        onError?.("Failed to delete backup");
      }
    };

    if (onConfirm) {
      onConfirm(
        `Delete backup: "${description}"?\n\nThis action cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if no onConfirm provided
      const confirmed = window.confirm(
        `Delete backup: "${description}"?\n\nThis action cannot be undone.`
      );
      if (confirmed) await performDelete();
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 700,
          maxHeight: "80vh",
          overflow: "auto",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0, color: "var(--green-bright)" }}>
            💾 Backup Manager
          </h3>
          <button className="btn-secondary" onClick={onClose}>
            ✕
          </button>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: 12,
            backgroundColor: "var(--bg-medium)",
            borderRadius: 4,
          }}
        >
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-dim)" }}>
            Create manual backups before making major changes. Backups are
            stored in the local database and can be restored at any time.
          </p>
        </div>

        {/* Create Backup Form */}
        {!showCreateForm ? (
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
            style={{ width: "100%", marginBottom: 16 }}
          >
            + Create New Backup
          </button>
        ) : (
          <div
            className="card"
            style={{ marginBottom: 16, backgroundColor: "var(--bg-medium)" }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: 14,
                color: "var(--amber-bright)",
              }}
            >
              Create Backup
            </h4>
            <input
              type="text"
              className="input"
              placeholder="Enter backup description (e.g., 'Before adding combat system')"
              value={newBackupDescription}
              onChange={(e) => setNewBackupDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateBackup();
                if (e.key === "Escape") setShowCreateForm(false);
              }}
              autoFocus
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleCreateBackup}
                style={{ flex: 1 }}
              >
                Save Backup
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewBackupDescription("");
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Backup List */}
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
          BACKUPS ({backups.length})
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>
            Loading backups...
          </div>
        ) : backups.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: 40,
              color: "var(--text-dim)",
              backgroundColor: "var(--bg-medium)",
              borderRadius: 4,
            }}
          >
            No backups yet. Create your first backup to get started!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="card"
                style={{
                  padding: 12,
                  backgroundColor: backup.isAutoBackup
                    ? "var(--bg-medium)"
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      {backup.description || "(No description)"}
                      {backup.isAutoBackup && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            color: "var(--text-dim)",
                          }}
                        >
                          [AUTO]
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      {formatDate(backup.createdAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn"
                      onClick={() =>
                        handleRestore(backup.id, backup.description)
                      }
                      style={{ fontSize: 11, padding: "4px 12px" }}
                    >
                      Restore
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleDelete(backup.id, backup.description)
                      }
                      style={{ fontSize: 11, padding: "4px 12px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        <div
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: "var(--bg-medium)",
            borderRadius: 4,
            fontSize: 11,
            color: "var(--text-dim)",
          }}
        >
          <strong>Tip:</strong> Create backups before major refactoring, adding
          complex features, or making destructive changes. You can restore any
          backup at any time.
        </div>
      </div>
    </div>
  );
}
