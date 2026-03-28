const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Replace the room card content to add an image button
content = content.replace(
  `<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="card-title" style={{ fontSize: 16 }}>
                    {loc.name}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    Room {loc.id}
                    {loc.image && <span style={{ marginLeft: 8, color: "var(--green-bright)" }}>📷</span>}
                  </div>
                </div>
              </div>`,
  `<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div className="card-title" style={{ fontSize: 16 }}>
                    {loc.name}
                  </div>
                  <div style={{ color: "var(--text-dim)", fontSize: 14 }}>
                    Room {loc.id}
                    {loc.image && <span style={{ marginLeft: 8, color: "var(--green-bright)" }}>📷</span>}
                  </div>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: 11, padding: "4px 8px", minWidth: "auto" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageDialogLocation(loc);
                  }}
                  title="Manage image for this room"
                >
                  🖼️
                </button>
              </div>`
);

fs.writeFileSync(panelPath, content);
console.log('Added image button to room cards');
