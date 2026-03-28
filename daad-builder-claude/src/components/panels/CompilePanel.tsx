import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import type { DaadGame } from '../../types/daad';
import { toBackendGame } from '../../api/tauri';

interface CompilePanelProps {
  game: DaadGame;
}

interface Platform {
  id: string;
  name: string;
  extension: string;
  description: string;
  icon: string;
  family: 'retro' | 'modern';
}

interface CompileResult {
  success: boolean;
  output_path: string;
  file_size: number;
  image_count: number;
  images_dir: string;
  logs: string[];
}

const PLATFORMS: Platform[] = [
  {
    id: 'zx_spectrum_48k',
    name: 'ZX Spectrum 48K',
    extension: 'tap',
    description: 'Sinclair ZX Spectrum 48K - TAP tape format',
    icon: '🎮',
    family: 'retro'
  },
  {
    id: 'zx_spectrum_128k',
    name: 'ZX Spectrum 128K',
    extension: 'tap',
    description: 'Sinclair ZX Spectrum 128K - TAP tape format',
    icon: '🎮',
    family: 'retro'
  },
  {
    id: 'c64',
    name: 'Commodore 64',
    extension: 'prg',
    description: 'Commodore 64 - PRG executable format',
    icon: '💾',
    family: 'retro'
  },
  {
    id: 'amstrad_cpc',
    name: 'Amstrad CPC',
    extension: 'dsk',
    description: 'Amstrad CPC - Disk image format',
    icon: '💿',
    family: 'retro'
  },
  {
    id: 'msx',
    name: 'MSX',
    extension: 'rom',
    description: 'MSX - ROM cartridge format',
    icon: '🎰',
    family: 'retro'
  },
  {
    id: 'amiga',
    name: 'Commodore Amiga',
    extension: 'adf',
    description: 'Amiga - ADF disk format',
    icon: '🖥️',
    family: 'modern'
  },
  {
    id: 'atari_st',
    name: 'Atari ST',
    extension: 'st',
    description: 'Atari ST - Disk image format',
    icon: '🕹️',
    family: 'modern'
  },
  {
    id: 'msdos',
    name: 'MS-DOS',
    extension: 'exe',
    description: 'MS-DOS - Executable format',
    icon: '💻',
    family: 'modern'
  },
  {
    id: 'pcw',
    name: 'Amstrad PCW',
    extension: 'pcw',
    description: 'Amstrad PCW - Text-only format',
    icon: '📝',
    family: 'retro'
  },
  {
    id: 'plus4',
    name: 'Commodore Plus/4',
    extension: 'prg',
    description: 'Commodore Plus/4 - PRG format',
    icon: '🎛️',
    family: 'retro'
  }
];

export default function CompilePanel({ game }: CompilePanelProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(PLATFORMS[0]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationResult, setCompilationResult] = useState<string | null>(null);
  const [compilationLogs, setCompilationLogs] = useState<string[]>([]);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'retro' | 'modern'>('all');
  const [showLogs, setShowLogs] = useState(false);

  const filteredPlatforms = PLATFORMS.filter(p =>
    filter === 'all' || p.family === filter
  );

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompilationResult(null);
    setCompilationLogs([]);
    setCompilationError(null);
    setShowLogs(false);

    try {
      const suggestedName = game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') || 'game';

      const filePath = await save({
        defaultPath: `${suggestedName}.${selectedPlatform.extension}`,
        filters: [{
          name: `${selectedPlatform.name} Files`,
          extensions: [selectedPlatform.extension]
        }]
      });

      if (!filePath) {
        setIsCompiling(false);
        return;
      }

      // Convert to backend format before sending to Rust.
      // This transforms exits (object) → connections (array) and
      // normalises all camelCase fields to snake_case as Rust expects.
      const backendGame = toBackendGame(game);

      const result = await invoke<CompileResult>('compile_game', {
        game: backendGame,
        platformName: selectedPlatform.id,
        outputPath: filePath
      });

      setCompilationResult(
        `Compiled to ${result.output_path} (${result.file_size.toLocaleString()} bytes)`
      );
      setCompilationLogs(result.logs || []);
    } catch (error) {
      setCompilationError(String(error));
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="panel-content" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ flex: 1, overflowY: "auto", width: "100%" }}>
        {/* Filter Buttons */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Filter Platforms</label>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button
              onClick={() => setFilter('all')}
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              All Platforms
            </button>
            <button
              onClick={() => setFilter('retro')}
              className={`btn ${filter === 'retro' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              8-bit Retro
            </button>
            <button
              onClick={() => setFilter('modern')}
              className={`btn ${filter === 'modern' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ flex: 1 }}
            >
              16-bit & Modern
            </button>
          </div>
        </div>

        {/* Platform Selection */}
        <div style={{ marginBottom: 16 }}>
          <label className="form-label">Select Target Platform</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginTop: 8 }}>
            {filteredPlatforms.map((platform) => (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform)}
                className="card"
                style={{
                  cursor: "pointer",
                  padding: 10,
                  borderColor: selectedPlatform.id === platform.id ? "var(--cyan-bright)" : undefined,
                  backgroundColor: selectedPlatform.id === platform.id ? "var(--bg-darker)" : undefined,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{platform.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: "bold", fontSize: 12, marginBottom: 3 }}>
                      {platform.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-dim)", marginBottom: 3 }}>
                      {platform.description}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-dim)", fontFamily: "monospace" }}>
                      Output: .{platform.extension}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Platform Highlight */}
        <div className="card" style={{ marginBottom: 16, padding: 12, backgroundColor: "rgba(0, 191, 255, 0.1)", border: "2px solid var(--cyan-dim)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>{selectedPlatform.icon}</span>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: "bold", color: "var(--cyan-bright)", marginBottom: 3 }}>
                {selectedPlatform.name}
              </h3>
              <p style={{ fontSize: 10, color: "var(--text-dim)" }}>
                {selectedPlatform.description}
              </p>
            </div>
          </div>
        </div>

        {/* Game Information */}
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 11, fontWeight: "bold", color: "var(--cyan-bright)", marginBottom: 10 }}>
            Game Information
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 11 }}>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Title:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{game.title || 'Untitled'}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Author:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{game.author || 'Unknown'}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Locations:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{(game.locations || []).length}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Objects:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{(game.objects || []).length}</span>
            </div>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Vocabulary:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{(game.vocabulary || []).length} words</span>
            </div>
            <div>
              <span style={{ color: "var(--text-dim)" }}>Messages:</span>
              <span style={{ marginLeft: 8, color: "var(--text-primary)" }}>{(game.messages || []).length}</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {compilationResult && (
          <div className="alert alert-success" style={{ marginBottom: 12 }}>
            <span className="alert-icon">✅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "bold", marginBottom: 3 }}>Compilation Successful</div>
              <div style={{ fontSize: 10 }}>{compilationResult}</div>
              {compilationLogs.length > 0 && (
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowLogs(!showLogs)}
                  style={{ fontSize: 10, padding: "2px 8px", marginTop: 6 }}
                >
                  {showLogs ? "Hide Logs" : "Show Logs"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Compilation Logs */}
        {showLogs && compilationLogs.length > 0 && (
          <div style={{
            marginBottom: 12,
            padding: 10,
            backgroundColor: "var(--bg-darker)",
            border: "1px solid var(--border)",
            borderRadius: 4,
            maxHeight: 300,
            overflowY: "auto",
            fontFamily: "monospace",
            fontSize: 10,
            color: "var(--text-dim)",
            whiteSpace: "pre-wrap"
          }}>
            {compilationLogs.join("\n")}
          </div>
        )}

        {/* Error Message */}
        {compilationError && (
          <div className="alert alert-danger" style={{ marginBottom: 12 }}>
            <span className="alert-icon">❌</span>
            <div>
              <div style={{ fontWeight: "bold", marginBottom: 3 }}>Compilation Failed</div>
              <div style={{ fontSize: 10, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{compilationError}</div>
            </div>
          </div>
        )}

        {/* Compile Button */}
        <button
          onClick={handleCompile}
          disabled={isCompiling}
          className="btn btn-primary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 12,
            opacity: isCompiling ? 0.5 : 1,
            cursor: isCompiling ? "not-allowed" : "pointer"
          }}
        >
          {isCompiling ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{
                display: "inline-block",
                width: 12,
                height: 12,
                border: "2px solid currentColor",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Compiling...
            </span>
          ) : (
            `Compile to ${selectedPlatform.name}`
          )}
        </button>

        {/* Info Note */}
        <div style={{
          marginTop: 12,
          padding: 10,
          backgroundColor: "var(--bg-darker)",
          border: "1px solid var(--border)",
          borderRadius: 4,
          fontSize: 10,
          color: "var(--text-dim)",
          lineHeight: 1.5
        }}>
          <p style={{ marginBottom: 6 }}>
            <strong style={{ color: "var(--cyan-bright)" }}>Note:</strong> The compiler generates platform-specific binaries that can be run on real hardware or emulators.
          </p>
          <p>
            The generated files include the DAAD interpreter and your game data packaged in the native format for each platform.
          </p>
        </div>
      </div>

      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};