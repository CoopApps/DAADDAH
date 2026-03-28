import { useState, useEffect } from "react";
import * as db from "../services/database";
import { useEscapeKey } from "../hooks/useEscapeKey";

interface ProjectManagerProps {
  mode: "save" | "load";
  currentProjectName?: string;
  onSave?: (name: string) => void;
  onLoad?: (id: number, name: string) => void;
  onClose: () => void;
  onConfirm?: (message: string, onConfirm: () => void) => void;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

interface Project {
  id: number;
  name: string;
  updated_at: string;
}

export default function ProjectManager({ mode, currentProjectName, onSave, onLoad, onClose, onConfirm, onError, onSuccess }: ProjectManagerProps) {
  // Close on Escape key
  useEscapeKey(onClose, true);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [projectName, setProjectName] = useState(currentProjectName || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (mode === "load") {
      loadProjects();
    } else {
      setLoading(false);
    }
  }, [mode]);

  const loadProjects = async () => {
    try {
      const list = await db.listProjects();
      setProjects(list);
      if (list.length > 0) {
        setSelectedId(list[0].id);
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!projectName.trim()) {
      onError?.("Please enter a project name");
      return;
    }
    onSave?.(projectName.trim());
  };

  const handleLoad = () => {
    if (selectedId === null) {
      onError?.("Please select a project");
      return;
    }
    const project = projects.find(p => p.id === selectedId);
    if (project) {
      onLoad?.(selectedId, project.name);
    }
  };

  const handleDelete = async () => {
    if (selectedId === null) return;

    const project = projects.find(p => p.id === selectedId);
    if (!project) return;

    const performDelete = async () => {
      try {
        await db.deleteProject(selectedId);
        await loadProjects();
        onSuccess?.(`Project deleted: ${project.name}`);
      } catch (err) {
        onError?.(`Failed to delete project: ${err}`);
      }
    };

    if (onConfirm) {
      onConfirm(
        `Delete project "${project.name}"?\n\nThis cannot be undone.`,
        performDelete
      );
    } else {
      // Fallback to window.confirm if no onConfirm provided
      const confirmed = window.confirm(`Delete project "${project.name}"?\n\nThis cannot be undone.`);
      if (confirmed) await performDelete();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ minWidth: 500 }}>
        <div className="modal-header">
          <h2 style={{ margin: 0, color: "var(--green-bright)" }}>
            {mode === "save" ? "💿 Save Project" : "📚 Load Project"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text)", fontSize: 20, cursor: "pointer" }}>
            ×
          </button>
        </div>

        <div className="modal-body" style={{ minHeight: 200 }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>
              Loading projects...
            </div>
          ) : mode === "save" ? (
            // Save mode
            <div>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  autoFocus
                />
                <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
                  If a project with this name exists, it will be updated.
                </p>
              </div>
            </div>
          ) : (
            // Load mode
            <div>
              {projects.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>
                  No projects found in database.
                  <br />
                  <br />
                  Save your current project to get started.
                </div>
              ) : (
                <div>
                  <label className="form-label" style={{ marginBottom: 8 }}>
                    Select Project ({projects.length} found)
                  </label>
                  <div style={{ border: "1px solid var(--border-color)", borderRadius: 4, maxHeight: 300, overflowY: "auto" }}>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedId(project.id)}
                        style={{
                          padding: 12,
                          cursor: "pointer",
                          backgroundColor: selectedId === project.id ? "var(--bg-hover)" : "transparent",
                          borderBottom: "1px solid var(--border-color)",
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                          {project.name}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                          Updated: {new Date(project.updated_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {mode === "load" && projects.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleDelete}
              style={{ marginRight: "auto" }}
            >
              Delete
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {mode === "save" ? (
            <button className="btn btn-primary" onClick={handleSave}>
              Save
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={handleLoad}
              disabled={selectedId === null}
            >
              Load
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
