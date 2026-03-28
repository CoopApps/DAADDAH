const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/GameInfoPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add part number field after title
content = content.replace(
  /(<div className="form-group">[\s\S]*?<label className="form-label">Game Title<\/label>[\s\S]*?<\/div>)/,
  `$1

          <div className="form-group">
            <label className="form-label">Part Number</label>
            <input
              type="number"
              className="form-input"
              value={game.partNumber}
              min={1}
              max={99}
              onChange={(e) => updateField("partNumber", parseInt(e.target.value) || 1)}
            />
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
              For multi-part games (PART1, PART2, etc.). Most games use 1.
            </div>
          </div>`
);

fs.writeFileSync(panelPath, content);
console.log('✓ Updated GameInfoPanel with part number field');
