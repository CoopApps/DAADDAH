import { useState, useEffect } from "react";
import { DaadGame, GameObject, Rule, Condition, Action } from "../../types/daad";
import { useDebounce } from "../../hooks/useDebounce";
import { STATUS_MESSAGE_DURATION } from "../../utils/constants";

interface CharactersPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteDialogState {
  show: boolean;
  character: GameObject | null;
  usageCount: number;
  dependentObjects: GameObject[];
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

export default function CharactersPanel({ game, setGame, selectItemId }: CharactersPanelProps) {
  const characters = (game.objects || []).filter(obj => obj.isPSI);
  const [selectedCharId, setSelectedCharId] = useState<number | null>(
    characters[0]?.id ?? null
  );
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    show: false,
    character: null,
    usageCount: 0,
    dependentObjects: [],
  });
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const selectedChar = game.objects?.find(o => o.id === selectedCharId);

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedCharId(selectItemId);
    }
  }, [selectItemId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedChar) return;

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        initiateDelete(selectedChar);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChar]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), STATUS_MESSAGE_DURATION);
  };

  // Count character usage in rules
  const getCharacterUsageCount = (objectId: number): number => {
    let count = 0;
    (game.rules || []).forEach((rule) => {
      rule.conditions.forEach((cond) => {
        Object.values(cond.params).forEach((param) => {
          if (param === objectId) count++;
        });
      });
      rule.actions.forEach((action) => {
        Object.values(action.params).forEach((param) => {
          if (param === objectId) count++;
        });
      });
    });
    return count;
  };

  // Find objects that depend on this character (inside containers)
  const getDependentObjects = (objectId: number): GameObject[] => {
    return (game.objects || []).filter((obj) => {
      return obj.location.type === "inside" && obj.location.containerId === objectId;
    });
  };

  const createNewCharacter = () => {
    console.log("[CharactersPanel] createNewCharacter called");
    console.log("[CharactersPanel] game.objects:", game.objects);

    // Use next available ID in objects array (consecutive)
    const newId = game.objects?.length || 0;
    console.log("[CharactersPanel] newId:", newId);

    const newChar: GameObject = {
      id: newId,
      noun: "person",
      adjective: "",
      description: "A person standing here.",
      icon: "👤",
      weight: 0,
      location: { type: "at", locationId: 0 },
      isContainer: false,
      isWearable: false,
      isTakeable: false,
      isLightSource: false,
      isPSI: true,
    };

    console.log("[CharactersPanel] Creating character:", newChar);
    setGame(prev => ({ ...prev, objects: [...(prev.objects || []), newChar] }));
    setSelectedCharId(newId);
    showToast(`Character ${newId} created`, "success");
    console.log("[CharactersPanel] Character creation complete");
  };

  const initiateDelete = (character: GameObject) => {
    const usageCount = getCharacterUsageCount(character.id);
    const dependentObjects = getDependentObjects(character.id);
    setDeleteDialog({ show: true, character, usageCount, dependentObjects });
  };

  const confirmDeleteCharacter = () => {
    if (!deleteDialog.character) return;
    const objectId = deleteDialog.character.id;

    setGame((prev) => {
      // Remove the character and renumber all objects
      const filteredObjects = (prev.objects || [])
        .filter((o) => o.id !== objectId)
        .map((obj, index) => {
          const newId = index;
          let updatedLocation = obj.location;

          // Update location if inside a container
          if (obj.location.type === "inside") {
            if (obj.location.containerId === objectId) {
              // Object was inside deleted character - move to limbo
              updatedLocation = { type: "limbo" };
            } else if (obj.location.containerId > objectId) {
              // Shift container ID down
              updatedLocation = { type: "inside", containerId: obj.location.containerId - 1 };
            }
          }

          return { ...obj, id: newId, location: updatedLocation };
        });

      // Update rule references
      const updatedRules = (prev.rules || []).map((rule) => ({
        ...rule,
        conditions: rule.conditions.map((cond) => ({
          ...cond,
          params: Object.fromEntries(
            Object.entries(cond.params).map(([key, value]) => {
              if (typeof value === "number" && value >= 0 && value < prev.objects.length) {
                if (value === objectId) return [key, 0]; // Fallback
                if (value > objectId) return [key, value - 1]; // Shift down
              }
              return [key, value];
            })
          ),
        })),
        actions: rule.actions.map((action) => ({
          ...action,
          params: Object.fromEntries(
            Object.entries(action.params).map(([key, value]) => {
              if (typeof value === "number" && value >= 0 && value < prev.objects.length) {
                if (value === objectId) return [key, 0]; // Fallback
                if (value > objectId) return [key, value - 1]; // Shift down
              }
              return [key, value];
            })
          ),
        })),
      }));

      return {
        ...prev,
        objects: filteredObjects,
        rules: updatedRules,
      };
    });

    setSelectedCharId(null);
    setDeleteDialog({ show: false, character: null, usageCount: 0, dependentObjects: [] });
    showToast(`Character deleted and references updated`, "success");
  };

  const updateCharacterProperty = <K extends keyof GameObject>(key: K, value: GameObject[K]) => {
    if (!selectedChar) return;

    setGame((prev) => ({
      ...prev,
      objects: (prev.objects || []).map((obj) =>
        obj.id === selectedChar.id ? { ...obj, [key]: value } : obj
      ),
    }));
  };

  // Filter characters by search term (debounced)
  const filteredCharacters = characters.filter((char) => {
    if (!debouncedSearchTerm) return true;
    const search = debouncedSearchTerm.toLowerCase();
    return (
      char.noun.toLowerCase().includes(search) ||
      char.adjective.toLowerCase().includes(search) ||
      char.description.toLowerCase().includes(search) ||
      char.id.toString().includes(search)
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
      {deleteDialog.show && deleteDialog.character && (
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
          onClick={() => setDeleteDialog({ show: false, character: null, usageCount: 0, dependentObjects: [] })}
        >
          <div
            className="card"
            style={{ maxWidth: 500, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--red-bright)", marginBottom: 16, fontSize: 20 }}>
              Delete Character?
            </h3>
            <p style={{ marginBottom: 16, fontSize: 16 }}>
              <strong>
                {deleteDialog.character.adjective && `${deleteDialog.character.adjective} `}
                {deleteDialog.character.noun}
              </strong>{" "}
              (ID: {deleteDialog.character.id})
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
                <div style={{ color: "var(--amber-bright)", fontWeight: "bold", fontSize: 15 }}>
                  This character is used {deleteDialog.usageCount} time{deleteDialog.usageCount !== 1 ? "s" : ""} in rules
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>
                  Rule references will be updated to object 0 (fallback).
                </div>
              </div>
            )}

            {deleteDialog.dependentObjects.length > 0 && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: "rgba(255, 0, 0, 0.15)",
                  border: "2px solid var(--red-medium)",
                  borderRadius: 4,
                  marginBottom: 16,
                }}
              >
                <div style={{ color: "var(--red-bright)", fontWeight: "bold", fontSize: 15 }}>
                  {deleteDialog.dependentObjects.length} object{deleteDialog.dependentObjects.length !== 1 ? "s" : ""} inside this character
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>
                  {deleteDialog.dependentObjects.map(obj => `${obj.noun}`).join(", ")} will be moved to limbo.
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
              <div style={{ color: "var(--blue-bright)", fontWeight: "bold", fontSize: 15 }}>
                ID Shift Warning
              </div>
              <div style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 8 }}>
                All objects after #{deleteDialog.character.id} will shift down by 1.
                Rule references will be automatically updated.
              </div>
            </div>

            <p style={{ color: "var(--text-dim)", fontSize: 15, marginBottom: 20 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteCharacter}
                style={{ flex: 1 }}
              >
                Delete Character
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteDialog({ show: false, character: null, usageCount: 0, dependentObjects: [] })}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: "flex", gap: 20, flex: 1, minHeight: 0 }}>
        {/* Character List */}
        <div style={{ width: 300, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12 }}>
            <button className="btn btn-primary" onClick={createNewCharacter}>
              + New Character
            </button>
            <span style={{ color: "var(--text-dim)", marginLeft: 12, fontSize: 18 }}>
              {characters.length} PSI
            </span>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", fontSize: 16 }}
            />
          </div>

          {/* Info Box */}
          <div style={{
            marginBottom: 12,
            padding: 8,
            backgroundColor: "rgba(0, 191, 255, 0.1)",
            border: "1px solid var(--blue-dim)",
            borderRadius: 4,
            fontSize: 14
          }}>
            <div style={{ color: "var(--blue-bright)", fontWeight: "bold", marginBottom: 4 }}>
              Characters are Objects
            </div>
            <div style={{ color: "var(--text-dim)" }}>
              PSI (Player Similar Individuals) are objects with isPSI=true.
              They also appear in the Objects panel.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredCharacters.length === 0 ? (
              <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center", fontSize: 16 }}>
                {searchTerm ? "No characters match your search" : "No characters defined"}
              </div>
            ) : (
              filteredCharacters.map(char => {
                const usageCount = getCharacterUsageCount(char.id);
                return (
                  <div
                    key={char.id}
                    onClick={() => setSelectedCharId(char.id)}
                    style={{
                      padding: 12,
                      background: selectedCharId === char.id ? "var(--bg-darker)" : "var(--bg-dark)",
                      border: selectedCharId === char.id ? "1px solid var(--cyan-bright)" : "1px solid var(--border)",
                      cursor: "pointer",
                      borderRadius: 4,
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 24 }}>{char.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: 18 }}>
                          {char.adjective && `${char.adjective} `}{char.noun}
                        </div>
                        <div style={{ fontSize: 15, color: "var(--text-dim)" }}>
                          ID: {char.id}
                        </div>
                        {usageCount > 0 && (
                          <div style={{ color: "var(--blue-bright)", fontSize: 13, marginTop: 4 }}>
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

        {/* Character Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {selectedChar ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div className="card">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Character ID (Object)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedChar.id}
                      disabled
                      style={{ opacity: 0.5 }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedChar.icon}
                      onChange={(e) => updateCharacterProperty("icon", e.target.value)}
                      placeholder="👤"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name (Noun)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedChar.noun}
                      maxLength={5}
                      onChange={(e) => updateCharacterProperty("noun", e.target.value)}
                      placeholder="guard"
                    />
                    <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 4 }}>
                      {selectedChar.noun.length}/5 chars
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title/Adjective</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedChar.adjective}
                      maxLength={5}
                      onChange={(e) => updateCharacterProperty("adjective", e.target.value)}
                      placeholder="old"
                    />
                    <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 4 }}>
                      {selectedChar.adjective.length}/5 chars
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input form-textarea"
                    value={selectedChar.description}
                    maxLength={255}
                    onChange={(e) => updateCharacterProperty("description", e.target.value)}
                    rows={3}
                    placeholder="Describe what the player sees..."
                  />
                  <div style={{ fontSize: 14, color: "var(--text-dim)", marginTop: 4 }}>
                    {selectedChar.description.length}/255 chars
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Starting Location</label>
                  <select
                    className="form-input form-select"
                    value={selectedChar.location.type === "at" ? selectedChar.location.locationId : -1}
                    onChange={(e) => {
                      const locationId = parseInt(e.target.value);
                      updateCharacterProperty("location", { type: "at", locationId });
                    }}
                  >
                    <option value={-1}>Select location...</option>
                    {(game.locations || []).map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} (ID: {loc.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* ── COMPANION FOLLOW ─────────────────────────── */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: 14, color: "var(--green-bright)", marginBottom: 8 }}>
                    COMPANION FOLLOW
                  </h4>
                  <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
                    Generate rules so this NPC follows the player to every location.
                    Creates one PLACE rule per location in PRO0.
                  </p>
                  {(() => {
                    const existingFollowRules = (game.rules || []).filter(r =>
                      r.name.toLowerCase().includes(`${selectedChar.noun} follow`) ||
                      (r.process === "PRO0" && r.actions.some(a => a.type === "PLACE" && a.params.objno === selectedChar.id))
                    );
                    return (
                      <>
                        {existingFollowRules.length > 0 && (
                          <div style={{ fontSize: 10, color: "var(--amber-bright)", marginBottom: 6 }}>
                            {existingFollowRules.length} follow rules already exist for this character
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 12px" }}
                            onClick={() => {
                              const locations = game.locations.filter(l => l.id > 0);
                              const nextId = game.rules.length > 0 ? Math.max(...game.rules.map(r => r.id)) + 1 : 1;
                              const newRules: Rule[] = locations.map((loc, i) => ({
                                id: nextId + i,
                                name: `${selectedChar.noun} follows - ${loc.name}`,
                                process: "PRO0",
                                verb: "_",
                                noun: "_",
                                enabled: true,
                                conditions: [{ type: "AT" as const, params: { locno: loc.id } }],
                                actions: [{ type: "PLACE" as const, params: { objno: selectedChar.id, locno: loc.id } }],
                              }));
                              setGame(prev => ({ ...prev, rules: [...prev.rules, ...newRules] }));
                              showToast(`Generated ${newRules.length} follow rules for ${selectedChar.noun}`, "success");
                            }}>
                            Generate Follow Rules ({game.locations.filter(l => l.id > 0).length} locations)
                          </button>
                          {existingFollowRules.length > 0 && (
                            <button className="btn btn-danger" style={{ fontSize: 10, padding: "4px 8px" }}
                              onClick={() => {
                                const ids = new Set(existingFollowRules.map(r => r.id));
                                setGame(prev => ({ ...prev, rules: prev.rules.filter(r => !ids.has(r.id)) }));
                                showToast(`Removed ${existingFollowRules.length} follow rules`, "info");
                              }}>
                              Remove Follow Rules
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* ── DIALOGUE TOPICS ─────────────────────────── */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: 14, color: "var(--cyan-bright)", marginBottom: 8 }}>
                    DIALOGUE TOPICS
                  </h4>
                  <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
                    Add conversation topics. Each creates an ASK rule with a tracked flag.
                  </p>
                  {(() => {
                    const dialogueRules = (game.rules || []).filter(r =>
                      (r.verb === "ASK" || r.verb === "ask") &&
                      r.conditions.some(c => c.type === "PRESENT" && c.params.objno === selectedChar.id)
                    );
                    return (
                      <>
                        {dialogueRules.length > 0 && (
                          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>
                            {dialogueRules.length} dialogue rule(s) for this character:
                            {dialogueRules.map(r => (
                              <span key={r.id} style={{ marginLeft: 4, color: "var(--cyan-bright)" }}>
                                [{r.noun || "?"}]
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
                          <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Topic noun</label>
                            <input className="form-input" id={`topic-noun-${selectedChar.id}`}
                              style={{ fontSize: 11 }} placeholder="e.g. sword, castle, quest" maxLength={5} />
                          </div>
                          <div style={{ flex: 2 }}>
                            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Response text</label>
                            <input className="form-input" id={`topic-response-${selectedChar.id}`}
                              style={{ fontSize: 11 }} placeholder="What the character says..." />
                          </div>
                          <button className="btn btn-primary" style={{ fontSize: 10, padding: "6px 10px", whiteSpace: "nowrap" }}
                            onClick={() => {
                              const nounEl = document.getElementById(`topic-noun-${selectedChar.id}`) as HTMLInputElement;
                              const respEl = document.getElementById(`topic-response-${selectedChar.id}`) as HTMLInputElement;
                              const topicNoun = nounEl?.value.trim();
                              const response = respEl?.value.trim();
                              if (!topicNoun || !response) { showToast("Enter both topic and response", "error"); return; }

                              const nextId = game.rules.length > 0 ? Math.max(...game.rules.map(r => r.id)) + 1 : 1;
                              // Find next available flag for tracking
                              const usedFlags = new Set(game.flags.map(f => f.id));
                              let trackFlag = 64;
                              while (usedFlags.has(trackFlag) && trackFlag < 255) trackFlag++;

                              // Ensure vocab exists for the topic noun
                              const vocabExists = game.vocabulary.some(v => v.word.toLowerCase() === topicNoun.toLowerCase());

                              setGame(prev => {
                                const newRules: Rule[] = [
                                  // First time asking
                                  {
                                    id: nextId,
                                    name: `ASK ${selectedChar.noun} ${topicNoun}`,
                                    process: "PRO5", verb: "ASK", noun: topicNoun.toUpperCase(),
                                    enabled: true,
                                    conditions: [
                                      { type: "PRESENT" as const, params: { objno: selectedChar.id } },
                                      { type: "ZERO" as const, params: { flagno: trackFlag } },
                                    ],
                                    actions: [
                                      { type: "MESSAGE" as const, params: {}, text: response },
                                      { type: "SET" as const, params: { flagno: trackFlag } },
                                      { type: "DONE" as const, params: {} },
                                    ],
                                  },
                                  // Already asked
                                  {
                                    id: nextId + 1,
                                    name: `ASK ${selectedChar.noun} ${topicNoun} (repeat)`,
                                    process: "PRO5", verb: "ASK", noun: topicNoun.toUpperCase(),
                                    enabled: true,
                                    conditions: [
                                      { type: "PRESENT" as const, params: { objno: selectedChar.id } },
                                      { type: "NOTZERO" as const, params: { flagno: trackFlag } },
                                    ],
                                    actions: [
                                      { type: "MESSAGE" as const, params: {}, text: `You've already discussed ${topicNoun} with ${selectedChar.noun}.` },
                                      { type: "DONE" as const, params: {} },
                                    ],
                                  },
                                ];
                                const newFlag = { id: trackFlag, name: `asked_${selectedChar.noun}_${topicNoun}`, description: `Dialogue: asked ${selectedChar.noun} about ${topicNoun}`, initialValue: 0 };
                                const newVocab = vocabExists ? [] : [{ word: topicNoun.toLowerCase().slice(0, 5), wordType: "noun" as const, id: Math.max(50, ...prev.vocabulary.map(v => v.id)) + 1 }];
                                return {
                                  ...prev,
                                  rules: [...prev.rules, ...newRules],
                                  flags: [...prev.flags, newFlag],
                                  vocabulary: [...prev.vocabulary, ...newVocab],
                                };
                              });
                              if (nounEl) nounEl.value = "";
                              if (respEl) respEl.value = "";
                              showToast(`Added dialogue topic: ${topicNoun}`, "success");
                            }}>
                            + Add Topic
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* ── NPC SCHEDULE ─────────────────────────────── */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <h4 style={{ fontSize: 14, color: "var(--amber-bright)", marginBottom: 8 }}>
                    NPC SCHEDULE
                  </h4>
                  <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>
                    Set up time-based movement. NPC moves to different locations based on turn ranges (flag 31 = Turns).
                  </p>
                  {(() => {
                    const scheduleRules = (game.rules || []).filter(r =>
                      r.process === "PRO4" &&
                      r.actions.some(a => a.type === "PLACE" && a.params.objno === selectedChar.id)
                    );
                    return (
                      <>
                        {scheduleRules.length > 0 && (
                          <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 6 }}>
                            {scheduleRules.length} schedule rule(s) active
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 4, alignItems: "flex-end" }}>
                          <div>
                            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>From turn</label>
                            <input className="form-input" id={`sched-from-${selectedChar.id}`} type="number"
                              style={{ fontSize: 11, width: 55 }} placeholder="0" min={0} max={255} />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>To turn</label>
                            <input className="form-input" id={`sched-to-${selectedChar.id}`} type="number"
                              style={{ fontSize: 11, width: 55 }} placeholder="20" min={0} max={255} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label className="form-label" style={{ fontSize: 10, margin: 0 }}>Location</label>
                            <select className="form-input form-select" id={`sched-loc-${selectedChar.id}`}
                              style={{ fontSize: 11 }}>
                              {game.locations.filter(l => l.id > 0).map(loc => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                              ))}
                            </select>
                          </div>
                          <button className="btn btn-primary" style={{ fontSize: 10, padding: "6px 10px", whiteSpace: "nowrap" }}
                            onClick={() => {
                              const fromEl = document.getElementById(`sched-from-${selectedChar.id}`) as HTMLInputElement;
                              const toEl = document.getElementById(`sched-to-${selectedChar.id}`) as HTMLInputElement;
                              const locEl = document.getElementById(`sched-loc-${selectedChar.id}`) as HTMLSelectElement;
                              const fromTurn = parseInt(fromEl?.value || "0");
                              const toTurn = parseInt(toEl?.value || "20");
                              const locId = parseInt(locEl?.value || "1");
                              const locName = game.locations.find(l => l.id === locId)?.name || `loc ${locId}`;

                              const nextId = game.rules.length > 0 ? Math.max(...game.rules.map(r => r.id)) + 1 : 1;
                              const newRule: Rule = {
                                id: nextId,
                                name: `${selectedChar.noun} schedule: ${locName} (turns ${fromTurn}-${toTurn})`,
                                process: "PRO4", verb: "_", noun: "_",
                                enabled: true,
                                conditions: [
                                  ...(fromTurn > 0 ? [{ type: "GT" as const, params: { flagno: 31, value: fromTurn - 1 } }] : []),
                                  { type: "LT" as const, params: { flagno: 31, value: toTurn + 1 } },
                                ],
                                actions: [
                                  { type: "PLACE" as const, params: { objno: selectedChar.id, locno: locId } },
                                ],
                              };
                              setGame(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
                              showToast(`Schedule: ${selectedChar.noun} at ${locName} (turns ${fromTurn}-${toTurn})`, "success");
                            }}>
                            + Add Schedule
                          </button>
                        </div>
                        {scheduleRules.length > 0 && (
                          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
                            {scheduleRules.map(r => (
                              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 10, padding: "2px 6px", background: "var(--bg-darker)", borderRadius: 3 }}>
                                <span style={{ color: "var(--text-dim)" }}>{r.name}</span>
                                <button className="btn btn-danger" style={{ fontSize: 9, padding: "1px 5px" }}
                                  onClick={() => setGame(prev => ({ ...prev, rules: prev.rules.filter(rule => rule.id !== r.id) }))}>
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>

                {/* ── DELETE ─────────────────────────────────── */}
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                  <button
                    className="btn btn-danger"
                    onClick={() => initiateDelete(selectedChar)}
                  >
                    Delete Character
                  </button>
                  <div style={{ marginTop: 12, fontSize: 14, color: "var(--text-dim)" }}>
                    Keyboard shortcut: Delete key
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: 24, color: "var(--text-dim)", marginBottom: 20 }}>
                No character selected
              </p>
              <p style={{ color: "var(--text-dim)", marginBottom: 20, fontSize: 18 }}>
                Create NPCs (Player Similar Individuals) to populate your adventure world.
              </p>
              <button className="btn btn-primary" onClick={createNewCharacter}>
                + Create First Character
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
