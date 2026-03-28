const fs = require('fs');

const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let content = fs.readFileSync(dialogPath, 'utf8');

// 1. Make dialog wider
content = content.replace(
  'maxWidth: 800,\n          width: "90%",',
  'maxWidth: 1200,\n          width: "95%",'
);

// 2. Add two-column layout wrapper after platform selector
content = content.replace(
  `        {/* Platform Preview */}
        <div style={{ marginBottom: 24 }}>`,
  `        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
          {/* Left column: Preview */}
          <div style={{ flex: "0 0 auto" }}>`
);

// 3. Move controls to right column
content = content.replace(
  `          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
            {currentPlatform.displayName} Screen Preview (2x scale)
          </div>
        </div>

        {/* Controls */}`,
  `          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
            {currentPlatform.displayName} Screen Preview (2x scale)
          </div>
          </div>

          {/* Right column: Controls */}
          <div style={{ flex: 1, minWidth: 300 }}>
        {/* Controls */}`
);

// 4. Close the two-column layout before action buttons
content = content.replace(
  `        )}

        {/* Action Buttons */}`,
  `        )}
          </div>
        </div>

        {/* Action Buttons */}`
);

fs.writeFileSync(dialogPath, content);
console.log('Reorganized ImageDialog to two-column layout');
