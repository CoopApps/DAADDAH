import { useState, useEffect } from "react";
import { DaadGame, VocabEntry, VocabType } from "../../types/daad";
import { useDebounce } from "../../hooks/useDebounce";
import { STATUS_MESSAGE_DURATION, MAX_VOCAB_WORD_LENGTH } from "../../utils/constants";

interface VocabularyPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteConfirmDialog {
  show: boolean;
  entry: VocabEntry | null;
  usageCount: number;
}

interface ToastMessage {
  show: boolean;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface SelectedVocabState {
  id: number | null;
  type: VocabType | null;
}

export default function VocabularyPanel({ game, setGame, selectItemId }: VocabularyPanelProps) {
  const [selectedVocab, setSelectedVocab] = useState<SelectedVocabState>({ id: null, type: null });
  const [selectedType, setSelectedType] = useState<VocabType>("verb");
  const [newWord, setNewWord] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    show: false,
    entry: null,
    usageCount: 0,
  });
  const [toast, setToast] = useState<ToastMessage>({
    show: false,
    message: "",
    type: "success",
  });

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      const vocabEntry = game.vocabulary?.find(v => v.id === selectItemId);
      if (vocabEntry) {
        setSelectedVocab({ id: vocabEntry.id, type: vocabEntry.wordType });
      }
    }
  }, [selectItemId, game.vocabulary]);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), STATUS_MESSAGE_DURATION);
  };

  const getNextId = (type: VocabType): number => {
    const existingIds = (game.vocabulary || [])
      .filter(v => v.wordType === type)
      .map(v => v.id);

    if (existingIds.length === 0) return 1;
    return Math.max(...existingIds) + 1;
  };

  const getWordUsageCount = (word: string, type: VocabType): number => {
    let count = 0;

    // Check rules for word usage in conditions/actions
    (game.rules || []).forEach(rule => {
      rule.conditions.forEach(cond => {
        Object.values(cond.params).forEach(param => {
          if (param === word) count++;
        });
      });
      rule.actions.forEach(action => {
        Object.values(action.params).forEach(param => {
          if (param === word) count++;
        });
      });
    });

    // Check objects for noun/adjective usage
    if (type === "noun") {
      count += (game.objects || []).filter(obj => obj.noun === word).length;
    }
    if (type === "adjective") {
      count += (game.objects || []).filter(obj => obj.adjective === word).length;
    }

    return count;
  };

  const addWord = () => {
    if (!newWord.trim()) return;

    // Validate length - DAAD parser only uses first 10 characters
    const trimmedWord = newWord.trim();
    if (trimmedWord.length > MAX_VOCAB_WORD_LENGTH) {
      showToast(`Words are limited to ${MAX_VOCAB_WORD_LENGTH} characters (DAAD parser limit). Your word will be truncated.`, "warning");
    }

    // Check for duplicates
    const exists = (game.vocabulary || []).some(
      v => v.word.toLowerCase() === newWord.toLowerCase().trim() && v.wordType === selectedType
    );

    if (exists) {
      showToast(`The ${selectedType} "${newWord}" already exists!`, "error");
      return;
    }

    const entry: VocabEntry = {
      word: newWord.toLowerCase().trim().slice(0, MAX_VOCAB_WORD_LENGTH),
      wordType: selectedType,
      id: getNextId(selectedType),
    };

    setGame(prev => ({
      ...prev,
      vocabulary: [...(prev.vocabulary || []), entry],
    }));

    setNewWord("");
    showToast(`Added "${entry.word}" as ${selectedType}`, "success");
  };

  const handleDeleteWord = (entry: VocabEntry) => {
    const usageCount = getWordUsageCount(entry.word, entry.wordType);
    setDeleteDialog({ show: true, entry, usageCount });
  };

  const confirmDeleteWord = () => {
    if (!deleteDialog.entry) return;

    const { word, wordType } = deleteDialog.entry;
    setGame(prev => ({
      ...prev,
      vocabulary: (prev.vocabulary || []).filter(v => !(v.word === word && v.wordType === wordType)),
    }));

    showToast(`Deleted "${word}"`, "success");
    setDeleteDialog({ show: false, entry: null, usageCount: 0 });
  };

  const autoGenerateFromObjects = () => {
    const newEntries: VocabEntry[] = [];

    (game.objects || []).forEach(obj => {
      // Add noun if not already exists
      if (obj.noun && obj.noun.length <= 20 && !(game.vocabulary || []).some(v => v.word === obj.noun && v.wordType === "noun")) {
        newEntries.push({
          word: obj.noun,
          wordType: "noun",
          id: getNextId("noun") + newEntries.filter(e => e.wordType === "noun").length,
        });
      }

      // Add adjective if not already exists
      if (obj.adjective && obj.adjective.length <= 20 && !(game.vocabulary || []).some(v => v.word === obj.adjective && v.wordType === "adjective")) {
        newEntries.push({
          word: obj.adjective,
          wordType: "adjective",
          id: getNextId("adjective") + newEntries.filter(e => e.wordType === "adjective").length,
        });
      }
    });

    if (newEntries.length > 0) {
      setGame(prev => ({
        ...prev,
        vocabulary: [...(prev.vocabulary || []), ...newEntries],
      }));
      showToast(`Added ${newEntries.length} words from objects`, "success");
    } else {
      showToast("No new words to add from objects", "info");
    }
  };

  const VOCABULARY_TEMPLATES = {
    basicVerbs: [
      "get", "take", "drop", "put", "give", "throw",
      "look", "exam", "read", "open", "close", "lock",
      "push", "pull", "move", "turn", "eat", "drink",
      "wear", "use", "break", "fix", "light"
    ],
    movementVerbs: [
      "go", "walk", "run", "climb", "jump", "swim",
      "enter", "exit", "leave", "drive"
    ],
    systemVerbs: [
      "inv", "save", "load", "quit", "help",
      "wait", "again", "undo"
    ],
    interactionVerbs: [
      "talk", "ask", "tell", "show", "give",
      "interview", "accuse", "question", "greet",
      "listen", "search", "find", "investigate"
    ]
  };

  const addTemplate = (templateName: keyof typeof VOCABULARY_TEMPLATES) => {
    const words = VOCABULARY_TEMPLATES[templateName];
    const newEntries: VocabEntry[] = [];

    words.forEach(word => {
      if (!(game.vocabulary || []).some(v => v.word === word && v.wordType === "verb")) {
        newEntries.push({
          word,
          wordType: "verb",
          id: getNextId("verb") + newEntries.length,
        });
      }
    });

    if (newEntries.length > 0) {
      setGame(prev => ({
        ...prev,
        vocabulary: [...(prev.vocabulary || []), ...newEntries],
      }));
      showToast(`Added ${newEntries.length} ${templateName} to vocabulary`, "success");
    } else {
      showToast(`All ${templateName} already exist in vocabulary`, "info");
    }
  };

  const sortWords = (words: VocabEntry[]) => {
    if (sortAlphabetically) {
      return [...words].sort((a, b) => a.word.localeCompare(b.word));
    }
    return [...words].sort((a, b) => a.id - b.id);
  };

  const verbs = sortWords((game.vocabulary || []).filter(v => v.wordType === "verb"));
  const nouns = sortWords((game.vocabulary || []).filter(v => v.wordType === "noun"));
  const adjectives = sortWords((game.vocabulary || []).filter(v => v.wordType === "adjective"));

  const filteredVerbs = verbs.filter(v => v.word.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  const filteredNouns = nouns.filter(v => v.word.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  const filteredAdjectives = adjectives.filter(v => v.word.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));

  const renderWordList = (words: VocabEntry[], type: VocabType, color: string) => (
    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <h3 style={{ color, marginBottom: 12, fontSize: 16, textTransform: "uppercase" }}>
        {type}S ({words.length})
      </h3>

      <div
        className="vocab-list-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: 0
        }}
      >
        {words.length === 0 ? (
          <div style={{ padding: 12, textAlign: "center", color: "var(--text-dim)", fontSize: 12 }}>
            No {type}s defined
          </div>
        ) : (
          words.map(entry => {
            const usageCount = getWordUsageCount(entry.word, type);
            return (
              <div
                key={`${entry.word}-${entry.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 8px",
                  backgroundColor: "rgba(0, 255, 0, 0.05)",
                  borderRadius: 2,
                  flexShrink: 0
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 10, color, fontFamily: "monospace", minWidth: 24 }}>
                    #{entry.id}
                  </span>
                  <span style={{ fontSize: 14 }}>{entry.word}</span>
                  {usageCount > 0 && (
                    <span style={{ fontSize: 10, color: "var(--text-dim)", marginLeft: "auto" }}>
                      ({usageCount} uses)
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-danger"
                  style={{ fontSize: 10, padding: "2px 6px" }}
                  onClick={() => handleDeleteWord(entry)}
                  title={usageCount > 0 ? `Used in ${usageCount} place(s)` : "Delete word"}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            padding: "12px 20px",
            backgroundColor: toast.type === "error" ? "var(--red-bright)" : toast.type === "info" ? "var(--blue-bright)" : "var(--green-bright)",
            color: "#000",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && deleteDialog.entry && (
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
            <h3 style={{ marginBottom: 16, color: "var(--red-bright)" }}>⚠️ Delete Word?</h3>
            <p style={{ marginBottom: 16 }}>
              Are you sure you want to delete <strong>"{deleteDialog.entry.word}"</strong> ({deleteDialog.entry.wordType})?
            </p>
            {deleteDialog.usageCount > 0 && (
              <div style={{ backgroundColor: "rgba(255, 191, 0, 0.2)", padding: 12, borderRadius: 4, marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "var(--amber-bright)", marginBottom: 8 }}>
                  <strong>⚠️ Warning: This word is currently used in {deleteDialog.usageCount} place(s)!</strong>
                </p>
                <ul style={{ fontSize: 12, color: "var(--text-dim)", marginLeft: 20 }}>
                  <li>May be used in rules, objects, or other game elements</li>
                  <li>Deleting may break parser functionality</li>
                  <li>This action cannot be undone (use Ctrl+Z after closing this dialog)</li>
                </ul>
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-danger" onClick={confirmDeleteWord}>
                Yes, Delete Word
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteDialog({ show: false, entry: null, usageCount: 0 })}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Auto-Generate Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, marginBottom: 4 }}>Vocabulary</h2>
          <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
            Define words players can use in commands (max 20 chars)
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={autoGenerateFromObjects}
          title="Auto-generate nouns and adjectives from objects"
        >
          Auto-Generate from Objects
        </button>
      </div>

      {/* Template Buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <button
          className="btn btn-secondary"
          onClick={() => addTemplate("basicVerbs")}
          style={{ fontSize: 11 }}
          title="Add common verbs: get, take, look, exam, read, open, close, etc."
        >
          + Basic Verbs
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => addTemplate("movementVerbs")}
          style={{ fontSize: 11 }}
          title="Add movement verbs: go, walk, climb, drive, enter, etc."
        >
          + Movement
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => addTemplate("interactionVerbs")}
          style={{ fontSize: 11 }}
          title="Add interaction verbs: talk, ask, interview, accuse, show, etc."
        >
          + Interaction
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => addTemplate("systemVerbs")}
          style={{ fontSize: 11 }}
          title="Add system verbs: save, load, help, etc."
        >
          + System
        </button>
      </div>

      {/* Add Word Form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 12 }}>Add New Word</h3>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Word</label>
            <input
              type="text"
              className="form-input"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addWord();
                }
              }}
              placeholder={`Enter ${selectedType}...`}
              style={{ textTransform: "lowercase" }}
              maxLength={20}
            />
            <div style={{ fontSize: 10, color: newWord.length >= 20 ? "var(--amber-bright)" : "var(--text-dim)", marginTop: 4 }}>
              {newWord.length}/20 chars
            </div>
          </div>

          <div className="form-group" style={{ width: 140, marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select
              className="form-input form-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as VocabType)}
            >
              <option value="verb">Verb</option>
              <option value="noun">Noun</option>
              <option value="adjective">Adjective</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={addWord} style={{ marginBottom: 20 }}>
            Add Word
          </button>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search vocabulary..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, fontSize: 12 }}
        />
        <button
          className="btn btn-secondary"
          onClick={() => setSortAlphabetically(!sortAlphabetically)}
          style={{ fontSize: 11, whiteSpace: "nowrap" }}
          title={sortAlphabetically ? "Sort by ID" : "Sort alphabetically"}
        >
          {sortAlphabetically ? "Sort by ID" : "Sort A-Z"}
        </button>
      </div>

      {/* Word Lists - Three Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flex: 1, minHeight: 0 }}>
        {renderWordList(filteredVerbs, "verb", "var(--cyan-bright)")}
        {renderWordList(filteredNouns, "noun", "var(--green-bright)")}
        {renderWordList(filteredAdjectives, "adjective", "var(--amber-bright)")}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 16, padding: 12, backgroundColor: "rgba(0, 255, 0, 0.1)", borderRadius: 4 }}>
        <div style={{ display: "flex", gap: 24, fontSize: 12 }}>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Total Words:</span>{" "}
            <span style={{ color: "var(--green-bright)", fontWeight: "bold" }}>
              {(game.vocabulary || []).length}
            </span>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Verbs:</span>{" "}
            <span style={{ color: "var(--cyan-bright)" }}>{verbs.length}</span>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Nouns:</span>{" "}
            <span style={{ color: "var(--green-bright)" }}>{nouns.length}</span>
          </div>
          <div>
            <span style={{ color: "var(--text-dim)" }}>Adjectives:</span>{" "}
            <span style={{ color: "var(--amber-bright)" }}>{adjectives.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
