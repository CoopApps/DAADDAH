const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/GameInfoPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add carry limit fields after version field
content = content.replace(
  /(<div className="form-group">[\s\S]*?<label className="form-label">Version<\/label>[\s\S]*?<\/div>)/,
  `$1

          <div className="form-group">
            <label className="form-label">Max Carry Objects (Flag 37)</label>
            <input
              type="number"
              className="form-input"
              value={game.maxCarryObjects}
              min={1}
              max={255}
              onChange={(e) => updateField("maxCarryObjects", parseInt(e.target.value) || 1)}
            />
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
              Maximum number of objects the player can carry at once
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Max Carry Weight (Flag 52)</label>
            <input
              type="number"
              className="form-input"
              value={game.maxCarryWeight}
              min={1}
              max={255}
              onChange={(e) => updateField("maxCarryWeight", parseInt(e.target.value) || 1)}
            />
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
              Maximum total weight the player can carry
            </div>
          </div>`
);

fs.writeFileSync(panelPath, content);
console.log('✓ Updated GameInfoPanel with carry limit fields');
