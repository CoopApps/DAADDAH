import { useState, useEffect, useMemo } from "react";
import { DaadGame, GameObject, ObjectLocation } from "../../types/daad";
import BatchEditor from "../BatchEditor";
import ContextMenu, { ContextMenuItem } from "../ContextMenu";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useDebounce } from "../../hooks/useDebounce";
import { MAX_VOCAB_WORD_LENGTH } from "../../utils/constants";

interface ObjectsPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteConfirmDialog {
  show: boolean;
  object: GameObject | null;
  dependentObjects: GameObject[];
}

export default function ObjectsPanel({ game, setGame, selectItemId }: ObjectsPanelProps) {
  const [selectedObject, setSelectedObject] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    show: false,
    object: null,
    dependentObjects: [],
  });
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBatchEditor, setShowBatchEditor] = useState(false);
  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedObject(selectItemId);
    }
  }, [selectItemId]);

  // Check if a word exists in vocabulary
  const wordExistsInVocabulary = (word: string, wordType: "noun" | "adjective"): boolean => {
    if (!word.trim()) return true; // Empty words don't need validation
    const normalizedWord = word.toLowerCase().trim();
    return (game.vocabulary || []).some(v => v.word === normalizedWord && v.wordType === wordType);
  };

  const getLocationDisplay = (loc: ObjectLocation): string => {
    switch (loc.type) {
      case "at":
        const location = game.locations.find((l) => l.id === loc.locationId);
        return location ? `At: ${location.name}` : `At: Location ${loc.locationId}`;
      case "carried":
        return "Carried";
      case "worn":
        return "Worn";
      case "limbo":
        return "Limbo";
      case "inside":
        const container = (game.objects || []).find((o) => o.id === loc.containerId);
        return container ? `In: ${container.noun}` : `In: Object ${loc.containerId}`;
    }
  };

  // Auto-add vocabulary when noun/adjective changes
  const autoAddVocabulary = (word: string, wordType: "noun" | "adjective") => {
    if (!word.trim()) return;

    const normalizedWord = word.toLowerCase().trim();
    const exists = (game.vocabulary || []).some(
      v => v.word === normalizedWord && v.wordType === wordType
    );

    if (!exists) {
      const sameTypeWords = (game.vocabulary || []).filter(v => v.wordType === wordType);
      const maxId = sameTypeWords.length > 0
        ? Math.max(...sameTypeWords.map(v => v.id))
        : -1; // Start from -1 so maxId + 1 = 0 for first word

      setGame((prev) => ({
        ...prev,
        vocabulary: [
          ...prev.vocabulary,
          {
            word: normalizedWord,
            wordType: wordType,
            id: maxId + 1,
          },
        ],
      }));
    }
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
    setSelectedIds(filteredObjects.map((obj) => obj.id));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const getObjectContextMenu = (obj: GameObject): ContextMenuItem[] => [
    {
      label: "Edit Object",
      icon: "✏️",
      onClick: () => setSelectedObject(obj.id),
    },
    {
      label: "Duplicate Object",
      icon: "📋",
      onClick: () => {
        const newId = (game.objects || []).length;
        const duplicatedObject: GameObject = {
          ...obj,
          id: newId,
          noun: `${obj.noun}_copy`,
          location: { type: "limbo" },
        };
        setGame((prev) => ({
          ...prev,
          objects: [...prev.objects, duplicatedObject],
        }));
        setSelectedObject(newId);
      },
    },
    {
      separator: true as const,
    },
    {
      label: "Move to Limbo",
      icon: "🌌",
      onClick: () => {
        setGame((prev) => ({
          ...prev,
          objects: prev.objects.map((o) =>
            o.id === obj.id ? { ...o, location: { type: "limbo" } } : o
          ),
        }));
      },
      disabled: obj.location.type === "limbo",
    },
    {
      label: "Set as Takeable",
      icon: "👋",
      onClick: () => {
        setGame((prev) => ({
          ...prev,
          objects: prev.objects.map((o) =>
            o.id === obj.id ? { ...o, isTakeable: !o.isTakeable } : o
          ),
        }));
      },
    },
    {
      separator: true as const,
    },
    {
      label: "Delete Object",
      icon: "🗑️",
      onClick: () => handleDeleteObject(obj),
      danger: true,
    },
  ];

  const addNewObject = () => {
    const newId = (game.objects || []).length;
    const newObject: GameObject = {
      id: newId,
      noun: "thing",
      adjective: "new",
      description: "A new object.",
      icon: "📦",
      weight: 5,
      location: { type: "limbo" },
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
    setSelectedObject(newId);
  };

  const handleDeleteObject = (obj: GameObject) => {
    // Find objects that are inside this container
    const dependentObjects = (game.objects || []).filter(
      o => o.location.type === "inside" && o.location.containerId === obj.id
    );

    setDeleteDialog({
      show: true,
      object: obj,
      dependentObjects,
    });
  };

  const confirmDeleteObject = () => {
    if (!deleteDialog.object) return;

    const objectId = deleteDialog.object.id;

    // Remove the object and renumber IDs
    setGame((prev) => {
      const filteredObjects = prev.objects
        .filter((o) => o.id !== objectId)
        .map((obj, index) => {
          // Renumber IDs to be consecutive starting from 0
          const newId = index;

          // Update location to reflect new IDs
          let updatedLocation = obj.location;

          if (obj.location.type === "inside") {
            // If inside the deleted container, move to limbo
            if (obj.location.containerId === objectId) {
              updatedLocation = { type: "limbo" };
            }
            // If inside container after deleted one, decrement ID
            else if (obj.location.containerId > objectId) {
              updatedLocation = { type: "inside", containerId: obj.location.containerId - 1 };
            }
          }

          return {
            ...obj,
            id: newId,
            location: updatedLocation,
          };
        });

      return {
        ...prev,
        objects: filteredObjects,
      };
    });

    setSelectedObject(null);
    setDeleteDialog({ show: false, object: null, dependentObjects: [] });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedObject) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        const obj = (game.objects || []).find(o => o.id === selectedObject);
        if (obj && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
          e.preventDefault();
          handleDeleteObject(obj);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedObject, game.objects]);

  const selectedObj = useMemo(
    () => (game.objects || []).find((o) => o.id === selectedObject),
    [game.objects, selectedObject]
  );

  // Filter and search objects (memoized for performance)
  const filteredObjects = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();

    return (game.objects || [])
      .filter(obj => !obj.isPSI) // Exclude PSI objects (they appear in Characters panel)
      .filter(obj => {
        // Search filter (debounced)
        const matchesSearch = debouncedSearchTerm === "" ||
          obj.noun.toLowerCase().includes(searchLower) ||
          obj.adjective.toLowerCase().includes(searchLower) ||
          obj.description.toLowerCase().includes(searchLower);

        // Property filter
        let matchesFilter = true;
        switch (filterProperty) {
          case "takeable":
            matchesFilter = obj.isTakeable;
            break;
          case "wearable":
            matchesFilter = obj.isWearable;
            break;
          case "container":
            matchesFilter = obj.isContainer;
            break;
          case "light":
            matchesFilter = obj.isLightSource;
            break;
          case "psi":
            matchesFilter = obj.isPSI;
            break;
          case "all":
          default:
            matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
      });
  }, [game.objects, debouncedSearchTerm, filterProperty]);

  return (
    <div className="panel-content" style={{ display: "flex", gap: 20, height: "calc(100vh - 180px)" }}>
      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && deleteDialog.object && (
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
            <h3 style={{ marginBottom: 16, color: "var(--red-bright)" }}>⚠️ Delete Item?</h3>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>{deleteDialog.object.adjective} {deleteDialog.object.noun}</strong>?
            </p>
            <div style={{ backgroundColor: "rgba(255, 0, 0, 0.1)", padding: 12, borderRadius: 4, marginBottom: 16 }}>
              <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
                <strong>This will:</strong>
              </p>
              <ul style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 20 }}>
                <li>Permanently delete this object</li>
                {deleteDialog.dependentObjects.length > 0 && (
                  <li style={{ color: "var(--amber-bright)" }}>
                    Move {deleteDialog.dependentObjects.length} object(s) inside this container to Limbo:
                    <ul style={{ marginLeft: 20, marginTop: 4 }}>
                      {deleteDialog.dependentObjects.map(obj => (
                        <li key={obj.id}>{obj.adjective} {obj.noun}</li>
                      ))}
                    </ul>
                  </li>
                )}
                <li>Renumber all object IDs to maintain consecutive order</li>
                <li>This action cannot be undone (use Ctrl+Z after closing this dialog)</li>
              </ul>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-danger" onClick={confirmDeleteObject}>
                Yes, Delete Item
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteDialog({ show: false, object: null, dependentObjects: [] })}>
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
        targetType="objects"
        selectedIds={selectedIds}
      />

      {/* Object List */}
      <div style={{ width: 300, display: "flex", flexDirection: "column" }}>
        <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn btn-primary" onClick={addNewObject} style={{ width: "100%" }}>
            + New Item
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
          ITEMS ({filteredObjects.length}/{(game.objects || []).length})
        </div>

        {/* Search and Filter */}
        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ fontSize: 12, marginBottom: 8 }}
          />
          <select
            className="form-input form-select"
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            style={{ fontSize: 11 }}
          >
            <option value="all">All Items</option>
            <option value="takeable">Takeable Only</option>
            <option value="wearable">Wearable Only</option>
            <option value="container">Containers Only</option>
            <option value="light">Light Sources Only</option>
            <option value="psi">PSI Only</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto" }}>
          {filteredObjects.map((obj) => (
            <div
              key={obj.id}
              className="card"
              onClick={() => selectionMode ? toggleItemSelection(obj.id) : setSelectedObject(obj.id)}
              onContextMenu={(e) => showContextMenu(e, getObjectContextMenu(obj))}
              style={{
                cursor: "pointer",
                borderColor: selectionMode
                  ? selectedIds.includes(obj.id)
                    ? "var(--blue-bright)"
                    : undefined
                  : selectedObject === obj.id
                  ? "var(--green-bright)"
                  : undefined,
                backgroundColor: selectionMode && selectedIds.includes(obj.id)
                  ? "rgba(66, 153, 225, 0.1)"
                  : undefined,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(obj.id)}
                      onChange={() => toggleItemSelection(obj.id)}
                      style={{ width: 16, height: 16 }}
                    />
                  )}
                  <div>
                    <div className="card-title" style={{ fontSize: 16 }}>
                      {obj.icon} {obj.adjective} {obj.noun}
                    </div>
                    <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                      {getLocationDisplay(obj.location)}
                    </div>
                  </div>
                </div>
                <div style={{ color: "var(--amber-medium)", fontSize: 12 }}>
                  OBJ {obj.id}
                </div>
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, fontSize: 11, flexWrap: "wrap" }}>
                {obj.isTakeable && <span style={{ color: "var(--blue-bright)" }}>[TAKE]</span>}
                {obj.isWearable && <span style={{ color: "var(--purple-bright)" }}>[WEAR]</span>}
                {obj.isContainer && <span style={{ color: "var(--amber-bright)" }}>[CONT]</span>}
                {obj.isLightSource && <span style={{ color: "var(--yellow-bright)" }}>[LIGHT]</span>}
                {obj.isPSI && <span style={{ color: "var(--cyan-bright)" }}>[PSI]</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Object Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "var(--green-bright)" }}>
          ITEM PROPERTIES
        </div>

        {selectedObj ? (
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Noun</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedObj.noun}
                  onChange={(e) => {
                    const newNoun = e.target.value;
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, noun: newNoun }
                          : obj
                      ),
                    }));
                  }}
                  onBlur={(e) => autoAddVocabulary(e.target.value, "noun")}
                  maxLength={MAX_VOCAB_WORD_LENGTH}
                />
                <div style={{ fontSize: 10, color: selectedObj.noun.length >= MAX_VOCAB_WORD_LENGTH ? "var(--amber-bright)" : "var(--text-dim)", marginTop: 4 }}>
                  {selectedObj.noun.length}/{MAX_VOCAB_WORD_LENGTH} chars
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Adjective</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedObj.adjective}
                  onChange={(e) => {
                    const newAdjective = e.target.value;
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, adjective: newAdjective }
                          : obj
                      ),
                    }));
                  }}
                  onBlur={(e) => autoAddVocabulary(e.target.value, "adjective")}
                  maxLength={MAX_VOCAB_WORD_LENGTH}
                />
                <div style={{ fontSize: 10, color: selectedObj.adjective.length >= MAX_VOCAB_WORD_LENGTH ? "var(--amber-bright)" : "var(--text-dim)", marginTop: 4 }}>
                  {selectedObj.adjective.length}/{MAX_VOCAB_WORD_LENGTH} chars
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={selectedObj.description}
                onChange={(e) =>
                  setGame((prev) => ({
                    ...prev,
                    objects: prev.objects.map((obj) =>
                      obj.id === selectedObj.id
                        ? { ...obj, description: e.target.value }
                        : obj
                    ),
                  }))
                }
                rows={3}
                maxLength={255}
              />
              <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
                {selectedObj.description.length}/255 chars
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <input
                  type="text"
                  className="form-input"
                  value={selectedObj.icon}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, icon: e.target.value }
                          : obj
                      ),
                    }))
                  }
                  maxLength={2}
                  placeholder="📦"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedObj.weight}
                  min={0}
                  max={63}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, weight: Math.max(0, Math.min(63, val)) }
                          : obj
                      ),
                    }));
                  }}
                  style={{ borderColor: selectedObj.weight > 63 ? "var(--amber-bright)" : undefined }}
                />
                <div style={{ fontSize: 10, color: selectedObj.weight > 63 ? "var(--amber-bright)" : "var(--text-dim)", marginTop: 4 }}>
                  Max: 63
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <select
                  className="form-input form-select"
                  value={
                    selectedObj.location.type === "at"
                      ? `at:${selectedObj.location.locationId}`
                      : selectedObj.location.type === "inside"
                      ? `inside:${selectedObj.location.containerId}`
                      : selectedObj.location.type
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    let newLoc: ObjectLocation;
                    if (val.startsWith("at:")) {
                      newLoc = { type: "at", locationId: parseInt(val.split(":")[1]) };
                    } else if (val.startsWith("inside:")) {
                      newLoc = { type: "inside", containerId: parseInt(val.split(":")[1]) };
                    } else {
                      newLoc = { type: val as "carried" | "worn" | "limbo" };
                    }
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, location: newLoc }
                          : obj
                      ),
                    }));
                  }}
                  style={{ fontSize: 11 }}
                >
                  <option value="limbo">Limbo</option>
                  <option value="carried">Carried</option>
                  <option value="worn">Worn</option>
                  {game.locations.map((loc) => (
                    <option key={loc.id} value={`at:${loc.id}`}>
                      {loc.name}
                    </option>
                  ))}
                  {(game.objects || []).filter(o => o.isContainer && o.id !== selectedObj.id).length > 0 && (
                    <optgroup label="Inside Container">
                      {game.objects
                        .filter(o => o.isContainer && o.id !== selectedObj.id)
                        .map(container => (
                          <option key={container.id} value={`inside:${container.id}`}>
                            {container.noun}
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {selectedObj.isContainer && (
              <div className="form-group">
                <label className="form-label">Container Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedObj.containerCapacity ?? 100}
                  min={0}
                  max={255}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, containerCapacity: parseInt(e.target.value) || 0 }
                          : obj
                      ),
                    }))
                  }
                />
                <div style={{ fontSize: 10, color: "var(--text-dim)", marginTop: 4 }}>
                  Max weight of objects inside
                </div>
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <label className="form-label">Properties</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isTakeable}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isTakeable: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--blue-bright)", fontSize: 13 }}>Takeable</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isWearable}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isWearable: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--purple-bright)", fontSize: 13 }}>Wearable</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isContainer}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isContainer: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--amber-bright)", fontSize: 13 }}>Container</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isLightSource}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isLightSource: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--yellow-bright)", fontSize: 13 }}>Light Source</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isPSI}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isPSI: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--cyan-bright)", fontSize: 13 }}>PSI</span>
                </label>
              </div>
            </div>

            <button
              className="btn btn-danger"
              style={{ marginTop: 24 }}
              onClick={() => handleDeleteObject(selectedObj)}
            >
              Delete Item
            </button>
          </div>
        ) : (
          <div className="card" style={{ color: "var(--text-dim)", textAlign: "center", padding: 48 }}>
            <p style={{ fontSize: 16 }}>Select an item</p>
            <p style={{ fontSize: 12 }}>Click an item to edit its properties</p>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={hideContextMenu}
        />
      )}
    </div>
  );
}
