import { useState } from "react";
import { DaadGame } from "../../types/daad";

interface MergePanelProps {
  game: DaadGame;
  setGame: (game: DaadGame | ((prev: DaadGame) => DaadGame)) => void;
}

export default function MergePanel({ game, setGame }: MergePanelProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [mergeLog, setMergeLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleExportToClipboard = async () => {
    const gameJson = JSON.stringify(game, null, 2);
    try {
      await navigator.clipboard.writeText(gameJson);
      alert("Game JSON copied to clipboard!");
    } catch (err) {
      alert(`Failed to copy: ${err}`);
    }
  };

  const handleSaveToFile = () => {
    const gameJson = JSON.stringify(game, null, 2);
    try {
      // Create a blob and download it
      const blob = new Blob([gameJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show confirmation after a brief delay to let download start
      setTimeout(() => {
        alert(`Game JSON saved!\n\nCheck your Downloads folder for:\noutput.txt\n\n(Usually at: C:\\Users\\YourName\\Downloads\\output.txt)`);
      }, 100);
    } catch (err) {
      alert(`Failed to save file: ${err}`);
    }
  };

  const handleMerge = () => {
    setError(null);

    if (!jsonInput.trim()) {
      setError("No JSON data provided");
      return;
    }

    try {
      console.log("Attempting to parse JSON...");
      const data = JSON.parse(jsonInput);
      console.log("JSON parsed successfully:", data);

      const log: string[] = [];

      // Check if any valid data was provided
      const hasValidData =
        (data.locations && Array.isArray(data.locations)) ||
        (data.objects && Array.isArray(data.objects)) ||
        (data.rules && Array.isArray(data.rules)) ||
        (data.vocabulary && Array.isArray(data.vocabulary)) ||
        (data.flags && Array.isArray(data.flags)) ||
        (data.messages && Array.isArray(data.messages)) ||
        (data.music && Array.isArray(data.music));

      if (!hasValidData) {
        setError("JSON parsed but contains no valid game data arrays (locations, objects, rules, vocabulary, flags, messages, or music)");
        return;
      }

      console.log("Starting merge...");

      // Merge top-level properties
      if (data.title !== undefined) {
        game.title = data.title;
        log.push(`Updated title: ${data.title}`);
      }
      if (data.author !== undefined) {
        game.author = data.author;
        log.push(`Updated author: ${data.author}`);
      }
      if (data.version !== undefined) {
        game.version = data.version;
        log.push(`Updated version: ${data.version}`);
      }
      if (data.introText !== undefined) {
        game.introText = data.introText;
        log.push(`Updated intro text (${data.introText.length} chars)`);
      }
      if (data.partNumber !== undefined) {
        game.partNumber = data.partNumber;
        log.push(`Updated part number: ${data.partNumber}`);
      }

      // Merge locations
      if (data.locations && Array.isArray(data.locations)) {
        console.log(`Merging ${data.locations.length} locations...`);
        if (!game.locations) game.locations = [];
        data.locations.forEach((loc: any) => {
          const existingIndex = game.locations.findIndex(l => l.id === loc.id);
          if (existingIndex >= 0) {
            game.locations[existingIndex] = { ...game.locations[existingIndex], ...loc };
            log.push(`Updated location ${loc.id}: ${loc.name}`);
          } else {
            game.locations.push(loc);
            log.push(`Added location ${loc.id}: ${loc.name}`);
          }
        });
      }

      // Merge objects
      if (data.objects && Array.isArray(data.objects)) {
        console.log(`Merging ${data.objects.length} objects...`);
        if (!game.objects) game.objects = [];
        data.objects.forEach((obj: any) => {
          const existingIndex = game.objects.findIndex(o => o.id === obj.id);
          if (existingIndex >= 0) {
            game.objects[existingIndex] = { ...game.objects[existingIndex], ...obj };
            log.push(`Updated object ${obj.id}: ${obj.noun}`);
          } else {
            game.objects.push(obj);
            log.push(`Added object ${obj.id}: ${obj.noun}`);
          }
        });
      }

      // Merge rules/responses
      if (data.rules && Array.isArray(data.rules)) {
        console.log(`Merging ${data.rules.length} rules...`);
        if (!game.rules) game.rules = [];
        data.rules.forEach((rule: any) => {
          const existingIndex = game.rules.findIndex(r => r.id === rule.id);
          if (existingIndex >= 0) {
            game.rules[existingIndex] = { ...game.rules[existingIndex], ...rule };
            log.push(`Updated response ${rule.id}: ${rule.name}`);
          } else {
            game.rules.push(rule);
            log.push(`Added response ${rule.id}: ${rule.name}`);
          }
        });
      }

      // Merge vocabulary
      if (data.vocabulary && Array.isArray(data.vocabulary)) {
        console.log(`Merging ${data.vocabulary.length} vocabulary...`);
        if (!game.vocabulary) game.vocabulary = [];
        data.vocabulary.forEach((vocab: any) => {
          // Match by word AND wordType (not by ID, since IDs can overlap between types)
          const existingIndex = game.vocabulary.findIndex(v =>
            v.word === vocab.word && v.wordType === vocab.wordType
          );
          if (existingIndex >= 0) {
            game.vocabulary[existingIndex] = { ...game.vocabulary[existingIndex], ...vocab };
            log.push(`Updated vocab ${vocab.id}: ${vocab.word} (${vocab.wordType})`);
          } else {
            game.vocabulary.push(vocab);
            log.push(`Added vocab ${vocab.id}: ${vocab.word} (${vocab.wordType})`);
          }
        });
      }

      // Merge flags
      if (data.flags && Array.isArray(data.flags)) {
        console.log(`Merging ${data.flags.length} flags...`);
        if (!game.flags) game.flags = [];
        data.flags.forEach((flag: any) => {
          const existingIndex = game.flags.findIndex(f => f.id === flag.id);
          if (existingIndex >= 0) {
            game.flags[existingIndex] = { ...game.flags[existingIndex], ...flag };
            log.push(`Updated flag ${flag.id}: ${flag.name}`);
          } else {
            game.flags.push(flag);
            log.push(`Added flag ${flag.id}: ${flag.name}`);
          }
        });
      }

      // Merge messages
      if (data.messages && Array.isArray(data.messages)) {
        console.log(`Merging ${data.messages.length} messages...`);
        if (!game.messages) game.messages = [];
        data.messages.forEach((msg: string, index: number) => {
          if (index < (game.messages || []).length) {
            game.messages[index] = msg;
            log.push(`Updated message ${index}`);
          } else {
            game.messages.push(msg);
            log.push(`Added message ${index}`);
          }
        });
      }

      // Merge music
      if (data.music && Array.isArray(data.music)) {
        console.log(`Merging ${data.music.length} music...`);
        if (!game.music) game.music = [];
        data.music.forEach((track: any) => {
          const existingIndex = game.music.findIndex(m => m.id === track.id);
          if (existingIndex >= 0) {
            game.music[existingIndex] = { ...game.music[existingIndex], ...track };
            log.push(`Updated music ${track.id}: ${track.name}`);
          } else {
            game.music.push(track);
            log.push(`Added music ${track.id}: ${track.name}`);
          }
        });
      }

      console.log("Merge complete, updating game state...");
      setGame({ ...game });
      setMergeLog(log);
      setJsonInput("");
      console.log("Done!");

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Merge error:", err);
      setError(`Error: ${errorMessage}`);
    }
  };

  const handleClear = () => {
    setJsonInput("");
    setMergeLog([]);
    setError(null);
  };

  return (
    <div className="panel-content">
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Merge Game Data</h3>
        <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 16 }}>
          Paste JSON data below to merge it into your current game. Existing items with matching IDs will be updated, new items will be added.
        </p>

        <textarea
          className="form-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='Paste JSON here, e.g.: { "locations": [...], "objects": [...], "rules": [...] }'
          style={{
            width: "100%",
            minHeight: 300,
            fontFamily: "monospace",
            fontSize: 11,
            marginBottom: 16,
          }}
        />

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <button className="btn btn-primary" onClick={handleMerge} disabled={!jsonInput.trim()}>
            Merge Data
          </button>
          <button className="btn btn-secondary" onClick={handleClear}>
            Clear
          </button>
          <button className="btn btn-secondary" onClick={handleExportToClipboard}>
            📋 Copy JSON
          </button>
          <button className="btn btn-secondary" onClick={handleSaveToFile}>
            💾 Save to output.txt
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.5)",
              borderRadius: 4,
              padding: 12,
              marginBottom: 16,
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--red-bright)",
            }}
          >
            <strong>Merge Failed:</strong> {error}
            <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-dim)" }}>
              Check the browser console (F12) for more details.
            </div>
          </div>
        )}

        {mergeLog.length > 0 && (
          <>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "var(--green-bright)" }}>
              Merge Log ({mergeLog.length} operations)
            </div>
            <div
              style={{
                backgroundColor: "rgba(0, 255, 0, 0.1)",
                border: "1px solid rgba(0, 255, 0, 0.3)",
                borderRadius: 4,
                padding: 12,
                maxHeight: 300,
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              {mergeLog.map((entry, index) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  {entry}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Current Game Stats</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-value">{(game.locations || []).length}</div>
            <div className="stat-label">Rooms</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{(game.objects || []).length}</div>
            <div className="stat-label">Items</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{(game.rules || []).length}</div>
            <div className="stat-label">Responses</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{(game.vocabulary || []).length}</div>
            <div className="stat-label">Words</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{(game.flags || []).length}</div>
            <div className="stat-label">Variables</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{(game.messages || []).length}</div>
            <div className="stat-label">Messages</div>
          </div>
        </div>
      </div>
    </div>
  );
}
