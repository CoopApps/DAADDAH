const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ObjectsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Update addNewObject to include new properties
content = content.replace(
  /const newObject: GameObject = \{[\s\S]*?isTakeable: true,\s*\};/,
  `const newObject: GameObject = {
      id: newId,
      noun: "thing",
      adjective: "new",
      description: "A new object.",
      icon: "box",
      weight: 5,
      location: { type: "limbo" },
      isContainer: false,
      isWearable: false,
      isTakeable: true,
      isLightSource: false,
    };`
);

// Update object list display to show [LIGHT] badge
content = content.replace(
  /\{obj\.isContainer && <span style=\{\{ color: "var\(--amber-bright\)" \}\}>\[CONT\]<\/span>\}/,
  `{obj.isContainer && <span style={{ color: "var(--amber-bright)" }}>[CONT]</span>}
                {obj.isLightSource && <span style={{ color: "var(--yellow-bright)" }}>[LIGHT]</span>}`
);

// Add Light Source checkbox and Container Capacity input after Container checkbox
content = content.replace(
  /<label style=\{\{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" \}\}>\s*<input\s*type="checkbox"\s*checked=\{selectedObj\.isContainer\}[\s\S]*?<span style=\{\{ color: "var\(--amber-bright\)" \}\}>Container<\/span>\s*<\/label>/,
  `<label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isContainer}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isContainer: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--amber-bright)" }}>Container</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={selectedObj.isLightSource}
                    onChange={(e) =>
                      setGame((prev) => ({
                        ...prev,
                        objects: prev.objects.map((obj) =>
                          obj.id === selectedObj.id
                            ? { ...obj, isLightSource: e.target.checked }
                            : obj
                        ),
                      }))
                    }
                  />
                  <span style={{ color: "var(--yellow-bright)" }}>Light Source</span>
                </label>`
);

// Add Container Capacity input after Weight field
content = content.replace(
  /<div className="form-group">\s*<label className="form-label">Weight<\/label>[\s\S]*?<\/div>\s*<\/div>/,
  (match) => {
    return match.replace(
      '</div>\n            </div>',
      `</div>
            </div>

            {selectedObj.isContainer && (
              <div className="form-group">
                <label className="form-label">Container Capacity (Weight)</label>
                <input
                  type="number"
                  className="form-input"
                  value={selectedObj.containerCapacity ?? 100}
                  min={0}
                  max={255}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, containerCapacity: parseInt(e.target.value) || 0 }
                          : obj
                      ),
                    }))
                  }
                />
                <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                  Maximum total weight of objects that can be placed inside this container
                </div>
              </div>
            )}`
    );
  }
);

fs.writeFileSync(panelPath, content);
console.log('✓ Updated ObjectsPanel with light source and container capacity UI');
