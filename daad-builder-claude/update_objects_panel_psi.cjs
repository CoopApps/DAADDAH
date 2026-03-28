const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/ObjectsPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add [PSI] badge in the object list after [LIGHT] badge
content = content.replace(
  /(\{obj\.isLightSource && <span[^>]*>\[LIGHT\]<\/span>\})/,
  `$1
                {obj.isPSI && <span style={{ color: "var(--cyan-bright)" }}>[PSI]</span>}`
);

// Add PSI checkbox after Light Source checkbox
content = content.replace(
  /(\/\* Light Source checkbox \*\/[\s\S]*?<\/label>)/,
  `$1

              {/* PSI Character checkbox */}
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedObj.isPSI}
                  onChange={(e) =>
                    setGame((prev) => ({
                      ...prev,
                      objects: prev.objects.map((obj) =>
                        obj.id === selectedObj.id
                          ? { ...obj, isPSI: e.target.checked }
                          : obj
                      ),
                    }))
                  }
                />
                <span style={{ color: "var(--cyan-bright)" }}>PSI Character (NPC)</span>
              </label>`
);

// Update newObject initialization to include isPSI
content = content.replace(
  /(const newObject: GameObject = \{[\s\S]*?isLightSource: false,)/,
  `$1
      isPSI: false,`
);

fs.writeFileSync(panelPath, content);
console.log('✓ Updated ObjectsPanel to support PSI characters');
