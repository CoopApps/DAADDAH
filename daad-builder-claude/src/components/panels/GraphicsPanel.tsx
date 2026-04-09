import { DaadGame } from "../../types/daad";

interface GraphicsPanelProps {
  game: DaadGame;
  setGame: (game: DaadGame | ((prev: DaadGame) => DaadGame)) => void;
  onNavigateToPanel?: (panel: string, itemId?: number) => void;
}

export default function GraphicsPanel({ game, setGame, onNavigateToPanel }: GraphicsPanelProps) {
  const locsWithImages = game.locations.filter(l => l.image?.sourceData);
  const totalLocs = game.locations.length;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: 16, borderBottom: "2px solid var(--border-color)", background: "var(--bg-secondary)" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--green-bright)" }}>
          Location Images ({locsWithImages.length} / {totalLocs} locations)
        </div>
        <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
          Attach images to locations via the Rooms panel. Images are exported as PCX for PCDAAD.
        </div>
      </div>

      {/* Gallery */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {locsWithImages.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-dim)" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🖼️</div>
            <div style={{ fontSize: 14 }}>No location images yet</div>
            <div style={{ fontSize: 11, marginTop: 8 }}>
              Go to <strong>Rooms</strong> and click the camera icon on a location to attach an image.
            </div>
            {onNavigateToPanel && (
              <button className="btn btn-primary" style={{ marginTop: 16 }}
                onClick={() => onNavigateToPanel("locations")}>
                Go to Rooms
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {locsWithImages.map(loc => (
              <div key={loc.id} className="card" style={{ padding: 8, cursor: "pointer" }}
                onClick={() => onNavigateToPanel?.("locations", loc.id)}>
                <img
                  src={loc.image!.sourceData}
                  alt={loc.name}
                  style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 4, imageRendering: "pixelated" }}
                />
                <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600, color: "var(--cyan-bright)" }}>
                  #{loc.id} {loc.name}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                  {loc.image!.height}px height — will export as {String(loc.id).padStart(3, '0')}.PCX
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
