import { useState, useRef, useEffect } from "react";
import { DaadGame, Music, MusicNote, NoteName, NoteDuration } from "../../types/daad";
import { useDebounce } from "../../hooks/useDebounce";
import { STATUS_MESSAGE_DURATION } from "../../utils/constants";
import { MUSIC_LIBRARY, MUSIC_CATEGORIES } from "../../data/musicLibrary";

interface MusicPanelProps {
  game: DaadGame;
  setGame: React.Dispatch<React.SetStateAction<DaadGame>>;
  selectItemId?: number;
}

interface DeleteDialogState {
  show: boolean;
  music: Music | null;
  usageCount: number;
}

interface ToastState {
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
}

interface LibraryDialogState {
  show: boolean;
  selectedCategory: string;
  selectedTracks: Set<number>;
}

const NOTE_NAMES: NoteName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const DURATIONS: NoteDuration[] = [1, 2, 4, 8, 16, 32];
const DURATION_LABELS: Record<NoteDuration, string> = {
  1: "Whole",
  2: "Half",
  4: "Quarter",
  8: "Eighth",
  16: "16th",
  32: "32nd"
};

// Note frequencies for Web Audio API
const NOTE_FREQUENCIES: Record<string, number> = {
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77,
  "C6": 1046.50, "C#6": 1108.73, "D6": 1174.66, "D#6": 1244.51, "E6": 1318.51, "F6": 1396.91, "F#6": 1479.98, "G6": 1567.98, "G#6": 1661.22, "A6": 1760.00, "A#6": 1864.66, "B6": 1975.53
};

export default function MusicPanel({ game, setGame, selectItemId }: MusicPanelProps) {
  const [selectedMusicId, setSelectedMusicId] = useState<number | null>(
    game.music?.[0]?.id ?? null
  );
  const [selectedDuration, setSelectedDuration] = useState<NoteDuration>(4);
  const [selectedDotted, setSelectedDotted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    show: false,
    music: null,
    usageCount: 0,
  });
  const [toast, setToast] = useState<ToastState>({ show: false, message: "", type: "success" });
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [libraryDialog, setLibraryDialog] = useState<LibraryDialogState>({
    show: false,
    selectedCategory: "all",
    selectedTracks: new Set(),
  });
  const [previewingTrackId, setPreviewingTrackId] = useState<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const stopPreviewRef = useRef<boolean>(false);

  const selectedMusic = game.music?.find(m => m.id === selectedMusicId);

  // Auto-select item when selectItemId changes
  useEffect(() => {
    if (selectItemId !== undefined) {
      setSelectedMusicId(selectItemId);
    }
  }, [selectItemId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMusic) return;

      // Delete key
      if ((e.key === "Delete" || e.key === "Backspace") &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          document.activeElement?.tagName !== "SELECT") {
        e.preventDefault();
        initiateDelete(selectedMusic);
      }

      // Backspace to delete last note
      if (e.key === "Backspace" && e.ctrlKey && selectedMusic.notes.length > 0) {
        e.preventDefault();
        removeNote(selectedMusic.notes.length - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMusic]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), STATUS_MESSAGE_DURATION);
  };

  // Count music usage in rules (XPLAY action)
  const getMusicUsageCount = (musicId: number): number => {
    let count = 0;
    (game.rules || []).forEach((rule) => {
      rule.actions.forEach((action) => {
        if (action.type === "XPLAY") {
          Object.values(action.params).forEach((param) => {
            if (param === musicId) count++;
          });
        }
      });
    });
    return count;
  };

  const createNewMusic = () => {
    const newId = game.music && (game.music || []).length > 0 ? Math.max(...(game.music || []).map(m => m.id)) + 1 : 0;
    const newMusic: Music = {
      id: newId,
      name: "New Music",
      tempo: 120,
      shape: 3,
      volume: 5000,
      notes: []
    };
    setGame(prev => ({ ...prev, music: [...(prev.music || []), newMusic] }));
    setSelectedMusicId(newId);
    showToast(`Music track ${newId} created`, "success");
  };

  const openLibraryDialog = () => {
    setLibraryDialog({ show: true, selectedCategory: "all", selectedTracks: new Set() });
  };

  const toggleTrackSelection = (trackId: number) => {
    setLibraryDialog(prev => {
      const newSelected = new Set(prev.selectedTracks);
      if (newSelected.has(trackId)) {
        newSelected.delete(trackId);
      } else {
        newSelected.add(trackId);
      }
      return { ...prev, selectedTracks: newSelected };
    });
  };

  const playLibraryTrack = async (track: Music, e: React.MouseEvent) => {
    e.stopPropagation(); // Don't toggle selection when clicking play

    if (previewingTrackId === track.id) {
      // Stop if already playing
      stopPreviewRef.current = true;
      setPreviewingTrackId(null);
      return;
    }

    // debug: console.log('[MusicPanel] Playing track:', track.name, 'Notes:', track.notes.length);

    // Ensure audio context exists and is running
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
      // debug: console.log('[MusicPanel] Created audio context');
    }

    // Resume audio context (browsers require user interaction)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
      // debug: console.log('[MusicPanel] Resumed audio context');
    }

    // debug: console.log('[MusicPanel] Audio context state:', audioContextRef.current.state);

    stopPreviewRef.current = false;
    setPreviewingTrackId(track.id);

    const beatDuration = 60 / track.tempo;

    // debug: console.log('[MusicPanel] Starting note loop, beatDuration:', beatDuration, 'notes:', track.notes.length);

    for (let i = 0; i < track.notes.length; i++) {
      const note = track.notes[i];
      // debug: console.log(`[MusicPanel] Playing note ${i + 1}/${track.notes.length}:`, note.note, note.octave);

      // Check if we should stop
      if (stopPreviewRef.current) {
        // debug: console.log('[MusicPanel] Stopped by user');
        break;
      }

      let noteDuration = beatDuration * (4 / note.duration);
      if (note.dotted) noteDuration *= 1.5;

      if (note.note !== "R") {
        playNote(note.note, note.octave, noteDuration * 0.9);
      }

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
    }

    setPreviewingTrackId(null);
  };

  const importSelectedTracks = () => {
    if (libraryDialog.selectedTracks.size === 0) {
      showToast("No tracks selected", "info");
      return;
    }

    // Find next available ID
    const existingIds = (game.music || []).map(m => m.id);
    let nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 0;

    // Get selected tracks from library and assign new IDs
    const tracksToImport = Array.from(libraryDialog.selectedTracks)
      .map(libId => MUSIC_LIBRARY.find(t => t.id === libId))
      .filter((t): t is Music => t !== undefined)
      .map(track => ({
        ...track,
        id: nextId++,
      }));

    // Add to game
    setGame(prev => ({
      ...prev,
      music: [...(prev.music || []), ...tracksToImport],
    }));

    showToast(`Imported ${tracksToImport.length} track${tracksToImport.length > 1 ? 's' : ''}`, "success");
    setLibraryDialog({ show: false, selectedCategory: "all", selectedTracks: new Set() });
    setPreviewingTrackId(null); // Stop any playing preview
  };

  const initiateDelete = (music: Music) => {
    const usageCount = getMusicUsageCount(music.id);
    setDeleteDialog({ show: true, music, usageCount });
  };

  const confirmDeleteMusic = () => {
    if (!deleteDialog.music) return;
    const musicId = deleteDialog.music.id;

    setGame(prev => ({ ...prev, music: (prev.music || []).filter(m => m.id !== musicId) }));
    setSelectedMusicId(game.music && (game.music || []).length > 1 ? (game.music || [])[0]?.id ?? null : null);
    setDeleteDialog({ show: false, music: null, usageCount: 0 });
    showToast(`Music track ${musicId} deleted`, "success");
  };

  const addNote = (note: NoteName, octave: number) => {
    if (!selectedMusic) return;

    const newNote: MusicNote = {
      note,
      octave,
      duration: selectedDuration,
      dotted: selectedDotted
    };

    setGame(prev => ({
      ...prev,
      music: (prev.music || []).map(m =>
        m.id === selectedMusicId
          ? { ...m, notes: [...m.notes, newNote] }
          : m
      )
    }));
  };

  const removeNote = (index: number) => {
    if (!selectedMusic) return;

    setGame(prev => ({
      ...prev,
      music: (prev.music || []).map(m =>
        m.id === selectedMusicId
          ? { ...m, notes: m.notes.filter((_, i) => i !== index) }
          : m
      )
    }));
  };

  const clearAllNotes = () => {
    if (!selectedMusic || selectedMusic.notes.length === 0) return;

    setGame(prev => ({
      ...prev,
      music: (prev.music || []).map(m =>
        m.id === selectedMusicId ? { ...m, notes: [] } : m
      )
    }));
    showToast(`All notes cleared`, "info");
  };

  const updateMusicProperty = <K extends keyof Music>(key: K, value: Music[K]) => {
    if (!selectedMusic) return;

    setGame(prev => ({
      ...prev,
      music: (prev.music || []).map(m =>
        m.id === selectedMusicId ? { ...m, [key]: value } : m
      )
    }));
  };

  const generateMML = (music: Music): string => {
    let mml = `T${music.tempo}S${music.shape}M${music.volume}`;

    let currentOctave = 4;
    for (const note of music.notes) {
      if (note.octave !== currentOctave) {
        mml += `O${note.octave}`;
        currentOctave = note.octave;
      }

      mml += note.note === "R" ? "R" : note.note;
      mml += note.duration;
      if (note.dotted) mml += ".";
    }

    return mml;
  };

  const copyMMLToClipboard = () => {
    if (!selectedMusic) return;
    const mml = generateMML(selectedMusic);
    navigator.clipboard.writeText(mml).then(() => {
      showToast("MML copied to clipboard", "success");
    }).catch(() => {
      showToast("Failed to copy MML", "error");
    });
  };

  const playNote = (note: NoteName, octave: number, duration: number = 0.3) => {
    if (note === "R") return; // Skip rests

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    const frequency = NOTE_FREQUENCIES[`${note}${octave}`];
    // debug: console.log(`[playNote] Note: ${note}${octave}, Frequency: ${frequency}, Duration: ${duration}`);

    if (!frequency) {
      console.warn(`[playNote] No frequency found for ${note}${octave}`);
      return;
    }

    oscillator.frequency.value = frequency;
    oscillator.type = "square"; // Retro sound

    // Much louder volume with slower fade
    gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // debug: console.log(`[playNote] Starting oscillator at ${ctx.currentTime}, stopping at ${ctx.currentTime + duration}`);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  };

  const playMusic = async () => {
    if (!selectedMusic || isPlaying) return;

    setIsPlaying(true);

    const beatDuration = 60 / selectedMusic.tempo; // Duration of one beat in seconds

    for (const note of selectedMusic.notes) {
      let noteDuration = beatDuration * (4 / note.duration); // Convert duration to seconds
      if (note.dotted) noteDuration *= 1.5;

      if (note.note !== "R") {
        playNote(note.note, note.octave, noteDuration * 0.9);
      }

      await new Promise(resolve => setTimeout(resolve, noteDuration * 1000));
    }

    setIsPlaying(false);
  };

  const PianoKey = ({ note, octave, isBlack }: { note: NoteName; octave: number; isBlack: boolean }) => (
    <button
      onClick={() => {
        addNote(note, octave);
        playNote(note, octave, 0.2);
      }}
      style={{
        position: "relative",
        width: isBlack ? 35 : 50,
        height: isBlack ? 80 : 120,
        backgroundColor: isBlack ? "#222" : "#fff",
        border: "1px solid #000",
        borderRadius: "0 0 4px 4px",
        cursor: "pointer",
        marginLeft: isBlack ? -18 : 0,
        marginRight: isBlack ? -18 : 0,
        zIndex: isBlack ? 2 : 1,
        display: "inline-block",
        transition: "all 0.05s",
        color: isBlack ? "#fff" : "#000",
        fontSize: 10,
        paddingTop: isBlack ? 50 : 90,
        fontFamily: "monospace"
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "translateY(2px)";
        e.currentTarget.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.3)";
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      {note}{octave}
    </button>
  );

  // Filter music by search term (debounced)
  const filteredMusic = (game.music || []).filter((music) => {
    if (!debouncedSearchTerm) return true;
    const search = debouncedSearchTerm.toLowerCase();
    return (
      music.name.toLowerCase().includes(search) ||
      music.id.toString().includes(search)
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
      {deleteDialog.show && deleteDialog.music && (
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
          onClick={() => setDeleteDialog({ show: false, music: null, usageCount: 0 })}
        >
          <div
            className="card"
            style={{ maxWidth: 500, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--red-bright)", marginBottom: 16 }}>
              Delete Music Track?
            </h3>
            <p style={{ marginBottom: 16 }}>
              <strong>{deleteDialog.music.name}</strong> (ID: {deleteDialog.music.id})
              <br />
              <span style={{ color: "var(--text-dim)", fontSize: 11 }}>
                {deleteDialog.music.notes.length} notes, {deleteDialog.music.tempo} BPM
              </span>
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
                  ⚠ This music is used {deleteDialog.usageCount} time{deleteDialog.usageCount !== 1 ? "s" : ""} in rules
                </div>
                <div style={{ color: "var(--text-dim)", fontSize: 10, marginTop: 8 }}>
                  XPLAY actions referencing this music ID will become invalid.
                </div>
              </div>
            )}

            <p style={{ color: "var(--text-dim)", fontSize: 11, marginBottom: 20 }}>
              This action cannot be undone.
            </p>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-danger"
                onClick={confirmDeleteMusic}
                style={{ flex: 1 }}
              >
                Delete Music
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteDialog({ show: false, music: null, usageCount: 0 })}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Library Import Dialog */}
      {libraryDialog.show && (
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
          onClick={() => setLibraryDialog({ show: false, selectedCategory: "all", selectedTracks: new Set() })}
        >
          <div
            className="card"
            style={{ maxWidth: 900, width: "90%", maxHeight: "80vh", padding: 24, display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "var(--cyan-bright)", marginBottom: 16 }}>
              📚 Import from Music Library
            </h3>
            <p style={{ color: "var(--text-dim)", fontSize: 11, marginBottom: 16 }}>
              Select tracks to import into your game. Each track will be assigned a new unique ID.
            </p>

            {/* Category Filter */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ fontSize: 11 }}>Category</label>
              <select
                className="form-input"
                value={libraryDialog.selectedCategory}
                onChange={(e) => setLibraryDialog(prev => ({ ...prev, selectedCategory: e.target.value }))}
                style={{ fontSize: 11 }}
              >
                <option value="all">All Tracks (50)</option>
                <option value="uiFeedback">UI & Feedback (10)</option>
                <option value="doorsObjects">Doors & Objects (5)</option>
                <option value="movement">Movement & Environment (5)</option>
                <option value="combat">Combat & Danger (5)</option>
                <option value="magic">Magic & Special (5)</option>
                <option value="victory">Victory & Success (3)</option>
                <option value="defeat">Defeat & Game Over (2)</option>
                <option value="ambient">Ambient & Atmosphere (5)</option>
                <option value="time">Clock & Time (2)</option>
                <option value="titleIntro">Title & Intro (3)</option>
                <option value="specialEvents">Special Events (5)</option>
              </select>
            </div>

            {/* Track List */}
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16, border: "1px solid var(--border)", borderRadius: 4, padding: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                {(libraryDialog.selectedCategory === "all"
                  ? MUSIC_LIBRARY
                  : MUSIC_CATEGORIES[libraryDialog.selectedCategory as keyof typeof MUSIC_CATEGORIES] || []
                ).map((track) => {
                  const isSelected = libraryDialog.selectedTracks.has(track.id);
                  const isPreviewing = previewingTrackId === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrackSelection(track.id)}
                      style={{
                        padding: 10,
                        background: isSelected ? "var(--cyan-dark)" : "var(--bg-darker)",
                        border: isSelected ? "2px solid var(--cyan-bright)" : "1px solid var(--border)",
                        borderRadius: 4,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ cursor: "pointer" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: 12, color: isSelected ? "var(--cyan-bright)" : "var(--text)" }}>
                            {track.name}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                            {track.notes.length} notes · {track.tempo} BPM · Vol {track.volume}
                          </div>
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={(e) => playLibraryTrack(track, e)}
                          title={isPreviewing ? "Stop preview" : "Preview track"}
                          style={{
                            padding: "4px 8px",
                            fontSize: 14,
                            minWidth: 32,
                            background: isPreviewing ? "var(--amber-dark)" : undefined,
                            borderColor: isPreviewing ? "var(--amber-bright)" : undefined,
                          }}
                        >
                          {isPreviewing ? "⏸" : "▶"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection Summary */}
            <div style={{ marginBottom: 16, padding: 12, background: "var(--bg-darker)", borderRadius: 4 }}>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                Selected: <strong style={{ color: "var(--cyan-bright)" }}>{libraryDialog.selectedTracks.size}</strong> track{libraryDialog.selectedTracks.size !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn btn-primary"
                onClick={importSelectedTracks}
                disabled={libraryDialog.selectedTracks.size === 0}
                style={{ flex: 1 }}
              >
                Import {libraryDialog.selectedTracks.size > 0 ? `${libraryDialog.selectedTracks.size} Track${libraryDialog.selectedTracks.size > 1 ? "s" : ""}` : ""}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setLibraryDialog({ show: false, selectedCategory: "all", selectedTracks: new Set() })}
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
        {/* Music List */}
        <div style={{ width: 300, display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={createNewMusic} style={{ flex: 1 }}>
              + New Music
            </button>
            <button className="btn btn-secondary" onClick={openLibraryDialog} title="Import from Library">
              📚 Library
            </button>
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search music..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", fontSize: 11 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, overflowY: "auto", minHeight: 0 }}>
            {filteredMusic.length === 0 ? (
              <div style={{ color: "var(--text-dim)", padding: 20, textAlign: "center", fontSize: 11 }}>
                {searchTerm ? "No music tracks match your search" : "No music tracks defined"}
              </div>
            ) : (
              filteredMusic.map(music => {
                const usageCount = getMusicUsageCount(music.id);
                return (
                  <div
                    key={music.id}
                    onClick={() => setSelectedMusicId(music.id)}
                    style={{
                      padding: 12,
                      background: selectedMusicId === music.id ? "var(--bg-darker)" : "var(--bg-dark)",
                      border: selectedMusicId === music.id ? "1px solid var(--cyan-bright)" : "1px solid var(--border)",
                      cursor: "pointer",
                      borderRadius: 4,
                      transition: "all 0.2s"
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: 13 }}>{music.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                      ID: {music.id} | {music.notes.length} notes | {music.tempo} BPM
                    </div>
                    {usageCount > 0 && (
                      <div style={{ color: "var(--blue-bright)", fontSize: 9, marginTop: 4 }}>
                        ({usageCount} use{usageCount !== 1 ? "s" : ""} in XPLAY)
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Music Editor */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          {selectedMusic ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto" }}>
              <div className="card" style={{ marginBottom: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedMusic.name}
                      onChange={(e) => updateMusicProperty("name", e.target.value)}
                    />
                  </div>

                  {/* XPLAY usage hint */}
                  <div style={{ padding: "6px 10px", background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 4, fontSize: 10, color: "var(--cyan-bright)", marginBottom: 8 }}>
                    To play this track in-game, add an <strong>XPLAY</strong> action to a rule with parameter <strong>{selectedMusic.id}</strong>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tempo (BPM)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedMusic.tempo}
                      onChange={(e) => updateMusicProperty("tempo", parseInt(e.target.value) || 120)}
                      min={40}
                      max={240}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Shape (Waveform)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedMusic.shape}
                      onChange={(e) => updateMusicProperty("shape", parseInt(e.target.value) || 0)}
                      min={0}
                      max={7}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Volume</label>
                    <input
                      type="number"
                      className="form-input"
                      value={selectedMusic.volume}
                      onChange={(e) => updateMusicProperty("volume", parseInt(e.target.value) || 5000)}
                      min={0}
                      max={15000}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">MML Output (for XPLAY)</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      type="text"
                      className="form-input"
                      value={generateMML(selectedMusic)}
                      readOnly
                      style={{ fontFamily: "monospace", fontSize: 11, flex: 1 }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={copyMMLToClipboard}
                      style={{ padding: "8px 16px" }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Input Tools */}
              <div className="card" style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, marginBottom: 12 }}>Note Tools</h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <select
                      className="form-input"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(parseInt(e.target.value) as NoteDuration)}
                    >
                      {DURATIONS.map(dur => (
                        <option key={dur} value={dur}>{DURATION_LABELS[dur]}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <input
                        type="checkbox"
                        checked={selectedDotted}
                        onChange={(e) => setSelectedDotted(e.target.checked)}
                        style={{ marginRight: 8 }}
                      />
                      Dotted (1.5x duration)
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => addNote("R", 4)}
                  >
                    + Add Rest
                  </button>
                  {selectedMusic.notes.length > 0 && (
                    <button
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                      onClick={clearAllNotes}
                    >
                      Clear All Notes
                    </button>
                  )}
                </div>
              </div>

              {/* Play Button */}
              <div className="card" style={{ marginBottom: 20 }}>
                <button
                  className="btn btn-primary"
                  onClick={playMusic}
                  disabled={isPlaying || selectedMusic.notes.length === 0}
                  style={{ width: "100%", fontSize: 13 }}
                >
                  {isPlaying ? "⏸ Playing..." : "▶ Play Music"}
                </button>
              </div>

              {/* Piano Keyboard */}
              <div className="card" style={{ marginBottom: 20 }}>
                <h4 style={{ fontSize: 12, marginBottom: 12 }}>Piano Keyboard - 4 Octaves (Click to add notes)</h4>

                {[[3, 4], [5, 6]].map((octavePair, rowIdx) => (
                  <div key={rowIdx} style={{ marginBottom: 16, display: "flex", gap: 24, flexWrap: "wrap" }}>
                    {octavePair.map(octave => (
                      <div key={octave}>
                        <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>
                          Octave {octave}
                        </div>
                        <div style={{
                          display: "flex",
                          position: "relative",
                          height: 120,
                          width: "fit-content"
                        }}>
                          <PianoKey note="C" octave={octave} isBlack={false} />
                          <PianoKey note="C#" octave={octave} isBlack={true} />
                          <PianoKey note="D" octave={octave} isBlack={false} />
                          <PianoKey note="D#" octave={octave} isBlack={true} />
                          <PianoKey note="E" octave={octave} isBlack={false} />
                          <PianoKey note="F" octave={octave} isBlack={false} />
                          <PianoKey note="F#" octave={octave} isBlack={true} />
                          <PianoKey note="G" octave={octave} isBlack={false} />
                          <PianoKey note="G#" octave={octave} isBlack={true} />
                          <PianoKey note="A" octave={octave} isBlack={false} />
                          <PianoKey note="A#" octave={octave} isBlack={true} />
                          <PianoKey note="B" octave={octave} isBlack={false} />
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Note Sequence */}
              {selectedMusic.notes.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                  <h4 style={{ fontSize: 12, marginBottom: 12 }}>Note Sequence ({selectedMusic.notes.length} notes)</h4>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selectedMusic.notes.map((note, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "var(--bg-darker)",
                          border: "1px solid var(--border)",
                          borderRadius: 4,
                          fontSize: 11,
                          display: "flex",
                          alignItems: "center",
                          gap: 8
                        }}
                      >
                        <span>
                          {note.note === "R" ? "Rest" : `${note.note}${note.octave}`}
                        </span>
                        <span style={{ color: "var(--text-dim)" }}>
                          {DURATION_LABELS[note.duration]}{note.dotted ? "." : ""}
                        </span>
                        <button
                          onClick={() => removeNote(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--red-bright)",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: 12
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Button */}
              <div style={{ paddingTop: 20, borderTop: "1px solid var(--border)" }}>
                <button
                  className="btn btn-danger"
                  onClick={() => initiateDelete(selectedMusic)}
                >
                  Delete Music Track
                </button>
                <div style={{ marginTop: 12, fontSize: 10, color: "var(--text-dim)" }}>
                  Keyboard shortcuts: Delete to remove track, Ctrl+Backspace to remove last note
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p style={{ fontSize: 20, color: "var(--text-dim)", marginBottom: 20 }}>
                No music track selected
              </p>
              <p style={{ color: "var(--text-dim)", marginBottom: 20 }}>
                Create music tracks to add sound to your adventure.
              </p>
              <button className="btn btn-primary" onClick={createNewMusic}>
                + Create First Music Track
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
