const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/LocationsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add Dark/Light toggle checkbox after description field
content = content.replace(
  `            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={selectedLoc.description}
                onChange={(e) =>
                  setGame((prev) => ({
                    ...prev,
                    locations: prev.locations.map((loc) =>
                      loc.id === selectedLoc.id ? { ...loc, description: e.target.value } : loc
                    ),
                  }))
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Exits</label>`,
  `            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={selectedLoc.description}
                onChange={(e) =>
                  setGame((prev) => ({
                    ...prev,
                    locations: prev.locations.map((loc) =>
                      loc.id === selectedLoc.id ? { ...loc, description: e.target.value } : loc
                    ),
                  }))
                }
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedLoc.isDark}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      locations: prev.locations.map((loc) =>
                        loc.id === selectedLoc.id ? { ...loc, isDark: e.target.checked } : loc
                      ),
                    }))
                  }
                  style={{ width: 16, height: 16 }}
                />
                Dark Room
              </label>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Dark rooms require a light source to see descriptions and objects
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Exits</label>`
);

fs.writeFileSync(panelPath, content);
console.log('Added Dark/Light toggle to room properties');
