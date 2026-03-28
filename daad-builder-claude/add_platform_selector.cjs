const fs = require('fs');

const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let content = fs.readFileSync(dialogPath, 'utf8');

// Add import for platforms
content = content.replace(
  `import { useState } from "react";
import { Location } from "../types/daad";`,
  `import { useState } from "react";
import { Location } from "../types/daad";
import { PLATFORM_LIST, PlatformId, PlatformSpec } from "../types/platforms";`
);

// Add selectedPlatform state after existing state declarations
content = content.replace(
  `const [height, setHeight] = useState(location.image?.height || 128);`,
  `const [height, setHeight] = useState(location.image?.height || 128);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("zx_spectrum");

  const currentPlatform: PlatformSpec = PLATFORM_LIST.find(p => p.id === selectedPlatform) || PLATFORM_LIST[0];`
);

// Replace ZX_SPECTRUM_COLORS with dynamic platform palette
content = content.replace(
  `const ZX_SPECTRUM_COLORS = [
  { name: "Black", hex: "#000000", rgb: [0, 0, 0] },
  { name: "Blue", hex: "#0000D7", rgb: [0, 0, 215] },
  { name: "Red", hex: "#D70000", rgb: [215, 0, 0] },
  { name: "Magenta", hex: "#D700D7", rgb: [215, 0, 215] },
  { name: "Green", hex: "#00D700", rgb: [0, 215, 0] },
  { name: "Cyan", hex: "#00D7D7", rgb: [0, 215, 215] },
  { name: "Yellow", hex: "#D7D700", rgb: [215, 215, 0] },
  { name: "White", hex: "#D7D7D7", rgb: [215, 215, 215] },
];`,
  ''
);

// Add platform selector after header and before preview
content = content.replace(
  `        {/* ZX Spectrum Preview */}`,
  `        {/* Platform Selector */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Target Platform</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as PlatformId)}
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                backgroundColor: "var(--bg-darker)",
                border: "1px solid var(--green-dim)",
                color: "var(--text-primary)",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 14,
              }}
            >
              {PLATFORM_LIST.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.displayName}
                </option>
              ))}
            </select>
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              {currentPlatform.resolution.width}×{currentPlatform.resolution.height}px • {currentPlatform.paletteSize} colors
              {currentPlatform.restrictions.description && ` • ${currentPlatform.restrictions.description}`}
            </p>
          </div>
        </div>

        {/* Platform Preview */}`
);

// Update preview dimensions to use current platform
content = content.replace(
  `          <div
            style={{
              width: 512,
              height: 384,
              backgroundColor: "#000",
              border: "2px solid var(--green-dim)",
              position: "relative",
              margin: "0 auto",
            }}
          >
            {/* Screen area (256x192 scaled 2x) */}`,
  `          <div
            style={{
              width: currentPlatform.resolution.width * 2,
              height: currentPlatform.resolution.height * 2,
              backgroundColor: "#000",
              border: "2px solid var(--green-dim)",
              position: "relative",
              margin: "0 auto",
            }}
          >
            {/* Screen area (scaled 2x) */}`
);

// Update dimension overlay
content = content.replace(
  `              256×192 px`,
  `              {currentPlatform.resolution.width}×{currentPlatform.resolution.height} px`
);

// Update preview label
content = content.replace(
  `          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
            ZX Spectrum Screen Preview (2x scale)
          </div>`,
  `          <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: "var(--text-dim)" }}>
            {currentPlatform.displayName} Screen Preview (2x scale)
          </div>`
);

// Update image height calculation
content = content.replace(
  `              <div
                style={{
                  flex: \`0 0 \${(height / 192) * 384}px\`,`,
  `              <div
                style={{
                  flex: \`0 0 \${(height / currentPlatform.resolution.height) * (currentPlatform.resolution.height * 2)}px\`,`
);

// Update height slider
content = content.replace(
  `          <div className="form-group">
            <label className="form-label">Image Height: {height}px</label>
            <input
              type="range"
              min="32"
              max="192"
              step="8"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Remaining space for text: {192 - height}px
            </p>
          </div>`,
  `          <div className="form-group">
            <label className="form-label">Image Height: {height}px</label>
            <input
              type="range"
              min="32"
              max={currentPlatform.resolution.height}
              step="8"
              value={Math.min(height, currentPlatform.resolution.height)}
              onChange={(e) => setHeight(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Remaining space for text: {currentPlatform.resolution.height - Math.min(height, currentPlatform.resolution.height)}px
            </p>
          </div>`
);

// Update color palette section
content = content.replace(
  `        {/* Color Palette Reference */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
            ZX Spectrum Palette (8 colors):
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {ZX_SPECTRUM_COLORS.map((color) => (
              <div
                key={color.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 8px",
                  backgroundColor: "var(--bg-darker)",
                  border: "1px solid var(--green-dim)",
                  fontSize: 11,
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: color.hex,
                    border: "1px solid var(--green-dim)",
                  }}
                />
                <span style={{ color: "var(--text-primary)" }}>{color.name}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
            Note: Each 8×8 pixel block can only use 2 colors (attribute clash limitation)
          </p>
        </div>`,
  `        {/* Color Palette Reference */}
        {currentPlatform.palette && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 8 }}>
              {currentPlatform.displayName} Palette ({currentPlatform.paletteSize} colors):
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {currentPlatform.palette.map((color, index) => (
                <div
                  key={index}
                  style={{
                    width: 24,
                    height: 24,
                    backgroundColor: color,
                    border: "1px solid var(--green-dim)",
                  }}
                  title={color}
                />
              ))}
            </div>
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 8 }}>
              {currentPlatform.restrictions.description}
            </p>
          </div>
        )}`
);

// Update file input description
content = content.replace(
  `            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Image will be converted to 256×{height}px with ZX Spectrum 8-color palette
            </p>`,
  `            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Image will be converted to {currentPlatform.resolution.width}×{height}px with {currentPlatform.displayName} palette
            </p>`
);

fs.writeFileSync(dialogPath, content);
console.log('Added platform selector to ImageDialog');
