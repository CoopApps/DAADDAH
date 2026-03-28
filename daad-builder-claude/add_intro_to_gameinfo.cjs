const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/GameInfoPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Add intro text field after version field
if (!content.includes('Introductory Text')) {
  content = content.replace(
    /(className="form-group">\s*<label className="form-label">Version<\/label>[\s\S]*?<\/div>)/,
    `$1

        <div className="form-group">
          <label className="form-label">Introductory Text</label>
          <textarea
            className="form-input"
            value={game.introText || ""}
            onChange={(e) => setGame({ ...game, introText: e.target.value })}
            rows={6}
            placeholder="Enter text to display before the game starts (press Enter to begin)..."
          />
          <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
            This text will be displayed when the game starts. Player presses Enter to continue to the first location.
          </div>
        </div>`
  );

  fs.writeFileSync(panelPath, content);
  console.log('✓ Added intro text field to GameInfoPanel');
}
