const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// 1. Add ImageDialog import
content = content.replace(
  'import { DaadGame, Location, Direction, createEmptyExits } from "../../types/daad";',
  `import { DaadGame, Location, Direction, createEmptyExits } from "../../types/daad";\nimport ImageDialog from "../ImageDialog";`
);

// 2. Add context menu state after mapRef
content = content.replace(
  'const mapRef = useRef<HTMLDivElement>(null);',
  `const mapRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; locationId: number } | null>(null);
  const [imageDialogLocation, setImageDialogLocation] = useState<Location | null>(null);`
);

// 3. Add context menu handlers after resetView function
const resetViewMatch = content.match(/(const resetView = \(\) => \{[\s\S]*?\};)/);
if (resetViewMatch) {
  content = content.replace(
    resetViewMatch[0],
    `${resetViewMatch[0]}

  const handleContextMenu = (e: React.MouseEvent, locationId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, locationId });
  };

  const handleManageImage = () => {
    if (contextMenu) {
      const loc = game.locations.find(l => l.id === contextMenu.locationId);
      if (loc) {
        setImageDialogLocation(loc);
      }
    }
    setContextMenu(null);
  };

  const handleSaveImage = (locationId: number, imageData: Location["image"]) => {
    setGame((prev) => ({
      ...prev,
      locations: prev.locations.map((loc) =>
        loc.id === locationId ? { ...loc, image: imageData } : loc
      ),
    }));
    setImageDialogLocation(null);
  };`
  );
}

// 4. Add onContextMenu to room list items
content = content.replace(
  `<div
              key={loc.id}
              className="card"
              onClick={() => setSelectedLocation(loc.id)}
              style={{
                cursor: "pointer",
                borderColor: selectedLocation === loc.id ? "var(--green-bright)" : undefined,
              }}
            >`,
  `<div
              key={loc.id}
              className="card"
              onClick={() => setSelectedLocation(loc.id)}
              onContextMenu={(e) => handleContextMenu(e, loc.id)}
              style={{
                cursor: "pointer",
                borderColor: selectedLocation === loc.id ? "var(--green-bright)" : undefined,
              }}
            >`
);

// 5. Add visual indicator for rooms with images
content = content.replace(
  `<div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    Room {loc.id}
                  </div>`,
  `<div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    Room {loc.id}
                    {loc.image && <span style={{ marginLeft: 8, color: "var(--green-bright)" }}>📷</span>}
                  </div>`
);

// 6. Add context menu and image dialog at the end before the closing div
// Find the last closing </div> before export
const lastDivIndex = content.lastIndexOf('</div>\n    );\n  }\n\n  export default LocationsPanel;');
if (lastDivIndex > -1) {
  content = content.substring(0, lastDivIndex) +
    `</div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            style={{
              position: "fixed",
              top: contextMenu.y,
              left: contextMenu.x,
              backgroundColor: "var(--bg-darker)",
              border: "2px solid var(--green-bright)",
              padding: 4,
              zIndex: 1000,
              fontFamily: "'Share Tech Mono', monospace",
              minWidth: 180,
            }}
          >
            <div
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-dark)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              onClick={handleManageImage}
            >
              🖼️ Manage Image
            </div>
          </div>
        </>
      )}

      {/* Image Dialog */}
      {imageDialogLocation && (
        <ImageDialog
          location={imageDialogLocation}
          onClose={() => setImageDialogLocation(null)}
          onSave={(imageData) => handleSaveImage(imageDialogLocation.id, imageData)}
        />
      )}
    ` + content.substring(lastDivIndex);
}

fs.writeFileSync(panelPath, content);
console.log('Added image management context menu to LocationsPanel');
