import { useState } from "react";
import { DaadGame } from "../../types/daad";
import PlatformPreview from "../graphics/PlatformPreview";
import VectorEditor from "../graphics/VectorEditor";

interface GraphicsPanelProps {
  game: DaadGame;
  setGame: (game: DaadGame | ((prev: DaadGame) => DaadGame)) => void;
}

export default function GraphicsPanel({ game, setGame }: GraphicsPanelProps) {
  const [showVectorEditor, setShowVectorEditor] = useState(false);
  const [editingImageId, setEditingImageId] = useState<number | null>(null);

  const handleCreateNewImage = () => {
    setEditingImageId(null);
    setShowVectorEditor(true);
  };

  const handleSaveImage = (imageData: string) => {
    // For now, just close the editor
    // In a full implementation, you'd save this to the game's graphics array
    console.log("Saved image data:", imageData);
    setShowVectorEditor(false);

    // TODO: Add to game.graphics array when that structure is defined
    // setGame(prev => ({
    //   ...prev,
    //   graphics: [...(prev.graphics || []), { id: Date.now(), data: imageData }]
    // }));
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "20px", borderBottom: "2px solid var(--border-color)", background: "var(--bg-secondary)" }}>
        <button
          onClick={handleCreateNewImage}
          style={{
            padding: "12px 24px",
            background: "rgba(0, 255, 65, 0.2)",
            border: "2px solid var(--green-bright)",
            borderRadius: "4px",
            color: "var(--green-bright)",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 65, 0.3)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0, 255, 65, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🎨 Create New Vector Graphic
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <PlatformPreview game={game} />
      </div>

      {showVectorEditor && (
        <VectorEditor
          onClose={() => setShowVectorEditor(false)}
          onSave={handleSaveImage}
        />
      )}
    </div>
  );
}
