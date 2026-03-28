const fs = require('fs');

const exportPanelContent = `import { useState } from "react";
import { DaadGame } from "../../types/daad";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

interface ExportPanelProps {
  game: DaadGame;
}

interface ValidationWarning {
  type: "error" | "warning" | "info";
  message: string;
}

export default function ExportPanel({ game }: ExportPanelProps) {
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const validateGame = (): ValidationWarning[] => {
    const warnings: ValidationWarning[] = [];

    // Check for critical errors
    if (game.locations.length === 0) {
      warnings.push({ type: "error", message: "No locations defined. Add at least one location." });
    }

    if (!game.title || game.title.trim() === "") {
      warnings.push({ type: "error", message: "Game title is required." });
    }

    // Check for warnings
    if (game.objects.length === 0) {
      warnings.push({ type: "warning", message: "No objects defined. Your game may be empty." });
    }

    if (game.vocabulary.length === 0) {
      warnings.push({ type: "warning", message: "No vocabulary defined. Use the Words panel to add verbs, nouns, and adjectives." });
    }

    if (game.rules.length === 0) {
      warnings.push({ type: "warning", message: "No rules/responses defined. Your game won't respond to player input." });
    }

    if (game.messages.length === 0) {
      warnings.push({ type: "warning", message: "No text messages defined. Consider adding system messages." });
    }

    // Check for connectivity issues
    const unreachableLocations = game.locations.filter(loc => {
      if (loc.id === 0) return false; // Start location is always reachable
      return !game.locations.some(other =>
        other.connections.some(conn => conn.targetLocation === loc.id)
      );
    });

    if (unreachableLocations.length > 0) {
      warnings.push({
        type: "warning",
        message: \`\${unreachableLocations.length} location(s) are unreachable: \${unreachableLocations.map(l => l.name).join(", ")}\`
      });
    }

    // Check for objects in limbo
    const limbObject = game.objects.filter(obj => obj.location.type === "limbo");
    if (limboObjects.length > 0) {
      warnings.push({
        type: "info",
        message: \`\${limboObjects.length} object(s) are in limbo and won't appear in-game initially.\`
      });
    }

    // Check for objects without vocabulary
    const objectsWithoutVocab = game.objects.filter(obj => {
      const hasNoun = game.vocabulary.some(v => v.word === obj.noun.toLowerCase() && v.wordType === "noun");
      const hasAdj = obj.adjective ? game.vocabulary.some(v => v.word === obj.adjective.toLowerCase() && v.wordType === "adjective") : true;
      return !hasNoun || !hasAdj;
    });

    if (objectsWithoutVocab.length > 0) {
      warnings.push({
        type: "warning",
        message: \`\${objectsWithoutVocab.length} object(s) missing vocabulary entries. Players won't be able to reference them.\`
      });
    }

    // Check for container cycles
    game.objects.forEach(obj => {
      if (obj.location.type === "inside") {
        const container = game.objects.find(o => o.id === obj.location.containerId);
        if (container && container.location.type === "inside" && container.location.containerId === obj.id) {
          warnings.push({
            type: "error",
            message: \`Circular container reference detected: \${obj.noun} and \${container.noun}\`
          });
        }
      }
    });

    return warnings;
  };

  const handleExport = async () => {
    const warnings = validateGame();
    const errors = warnings.filter(w => w.type === "error");

    if (errors.length > 0) {
      setExportStatus("Cannot export: Fix errors first.");
      return;
    }

    try {
      const filePath = await save({
        filters: [{
          name: "DAAD Source",
          extensions: ["dsc"]
        }],
        defaultPath: \`\${game.title.replace(/[^a-zA-Z0-9]/g, "_")}.dsc\`
      });

      if (!filePath) return;

      setExporting(true);
      setExportStatus("Exporting...");

      await invoke("export_daad_to_file", { game, path: filePath });

      setExportStatus(\`✓ Exported successfully to \${filePath}\`);
      setTimeout(() => setExportStatus(null), 5000);
    } catch (error) {
      setExportStatus(\`✗ Export failed: \${error}\`);
    } finally {
      setExporting(false);
    }
  };

  const warnings = validateGame();
  const errors = warnings.filter(w => w.type === "error");
  const canExport = errors.length === 0;

  return (
    <div className="panel-content">
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <pre className="ascii-border" style={{ marginBottom: 20 }}>
{\\`+--- VALIDATION STATUS ---+\\`}
        </pre>

        {/* Validation Warnings */}
        <div style={{ marginBottom: 20 }}>
          {warnings.length === 0 ? (
            <div className="alert alert-success">
              <span className="alert-icon">✓</span>
              <span>All validation checks passed! Ready to export.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {warnings.map((warning, idx) => (
                <div
                  key={idx}
                  className={\\`alert alert-\${warning.type === "error" ? "danger" : warning.type === "warning" ? "warning" : "info"}\\`}
                >
                  <span className="alert-icon">
                    {warning.type === "error" ? "✗" : warning.type === "warning" ? "!" : "i"}
                  </span>
                  <span>{warning.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Statistics */}
        <pre className="ascii-border" style={{ marginBottom: 20 }}>
{\\`+--- GAME STATISTICS ---+\\`}
        </pre>

        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Locations</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{game.locations.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Objects</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{game.objects.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Connections</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>
                {game.locations.reduce((sum, loc) => sum + loc.connections.length, 0)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Vocabulary</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{game.vocabulary.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Rules</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{game.rules.filter(r => r.enabled).length}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>Messages</div>
              <div style={{ fontSize: 20, fontWeight: "bold" }}>{game.messages.length}</div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <pre className="ascii-border" style={{ marginBottom: 20 }}>
{\\`+--- EXPORT OPTIONS ---+\\`}
        </pre>

        <div className="card">
          <p style={{ marginBottom: 16, color: "var(--text-dim)" }}>
            Export your game as DAAD source code (.dsc file) with platform-specific graphics for all 8 original platforms.
          </p>

          <button
            className={\`btn \${canExport ? "btn-primary" : "btn-secondary"}\\`}
            onClick={handleExport}
            disabled={!canExport || exporting}
            style={{ width: "100%", marginBottom: 12 }}
          >
            {exporting ? "Exporting..." : canExport ? "Export DAAD Game" : "Fix Errors to Export"}
          </button>

          {exportStatus && (
            <div
              className={\`alert \${exportStatus.startsWith("✓") ? "alert-success" : exportStatus.startsWith("✗") ? "alert-danger" : "alert-info"}\\`}
            >
              <span>{exportStatus}</span>
            </div>
          )}

          <div style={{ marginTop: 16, padding: 12, background: "var(--bg-darker)", borderRadius: 4 }}>
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 8 }}>Export includes:</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 11, color: "var(--text-dim)" }}>
              <li>DAAD source code (.dsc file)</li>
              <li>Platform-specific graphics (ZX Spectrum, C64, Amstrad CPC, MSX, Amiga, Atari ST, MS-DOS)</li>
              <li>All locations, objects, connections, vocabulary, rules, and messages</li>
              <li>Object attributes (containers, wearable, scenery)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ExportPanel.tsx';
fs.writeFileSync(panelPath, exportPanelContent);
console.log('✓ Created ExportPanel.tsx with validation warnings');
