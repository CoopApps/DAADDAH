const fs = require('fs');

const panelPath = 'D:/projects/daadah/daad-builder-ui/src/components/panels/GameInfoPanel.tsx';
let content = fs.readFileSync(panelPath, 'utf8');

// Replace the updateField helper to handle flag updates
content = content.replace(
  /const updateField = \(field: keyof DaadGame, value: string\) => \{[\s\S]*?\};/,
  `const updateField = (field: keyof DaadGame, value: string) => {
    setGame((prev) => ({ ...prev, [field]: value }));
  };

  const updateFlag = (flagId: number, value: number) => {
    setGame((prev) => ({
      ...prev,
      flags: prev.flags.map(f => f.id === flagId ? { ...f, initialValue: value } : f)
    }));
  };

  const getFlag = (flagId: number): number => {
    return game.flags.find(f => f.id === flagId)?.initialValue ?? 0;
  };`
);

// Add carry limit fields after version field
content = content.replace(
  /(<div className="form-group">[\s\S]*?<label className="form-label">Version<\/label>[\s\S]*?<\/div>)/,
  `$1

          <div className="form-group">
            <label className="form-label">Max Carry Objects (Flag 37)</label>
            <input
              type="number"
              className="form-input"
              value={getFlag(37)}
              min={1}
              max={255}
              onChange={(e) => updateFlag(37, parseInt(e.target.value) || 1)}
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
              value={getFlag(52)}
              min={1}
              max={255}
              onChange={(e) => updateFlag(52, parseInt(e.target.value) || 1)}
            />
            <div style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
              Maximum total weight the player can carry
            </div>
          </div>`
);

fs.writeFileSync(panelPath, content);
console.log('✓ Updated GameInfoPanel with flag-based carry limit fields');
