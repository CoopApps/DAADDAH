const fs = require('fs');

// Fix 1: Add palettes for Amiga, Atari ST, and MS-DOS
const platformsPath = 'D:/projects/daadah/daad-builder-ui/src/types/platforms.ts';
let platformsContent = fs.readFileSync(platformsPath, 'utf8');

// Add Amiga 32-color palette (standard EHB mode colors)
platformsContent = platformsContent.replace(
  `  amiga: {
    id: "amiga",
    name: "Amiga",
    displayName: "Commodore Amiga",
    resolution: { width: 320, height: 200 },
    colorDepth: 12, // 4096 colors total
    paletteSize: 32, // 32 simultaneous in standard modes
    restrictions: {
      description: "32 simultaneous colors from 4096-color palette",
    },
  },`,
  `  amiga: {
    id: "amiga",
    name: "Amiga",
    displayName: "Commodore Amiga",
    resolution: { width: 320, height: 200 },
    colorDepth: 12, // 4096 colors total
    paletteSize: 32, // 32 simultaneous in standard modes
    palette: [
      "#000000", "#111111", "#222222", "#333333", "#444444", "#555555", "#666666", "#777777",
      "#888888", "#999999", "#AAAAAA", "#BBBBBB", "#CCCCCC", "#DDDDDD", "#EEEEEE", "#FFFFFF",
      "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
      "#FF8800", "#88FF00", "#00FF88", "#0088FF", "#8800FF", "#FF0088",
      "#884400", "#448800", "#004488", "#880044",
    ],
    restrictions: {
      description: "32 simultaneous colors from 4096-color palette",
    },
  },`
);

// Add Atari ST 16-color palette
platformsContent = platformsContent.replace(
  `  atari_st: {
    id: "atari_st",
    name: "Atari ST",
    displayName: "Atari ST",
    resolution: { width: 320, height: 200 },
    colorDepth: 9, // 512 colors total
    paletteSize: 16, // 16 simultaneous
    restrictions: {
      description: "16 simultaneous colors from 512-color palette",
    },
  },`,
  `  atari_st: {
    id: "atari_st",
    name: "Atari ST",
    displayName: "Atari ST",
    resolution: { width: 320, height: 200 },
    colorDepth: 9, // 512 colors total
    paletteSize: 16, // 16 simultaneous
    palette: [
      "#000000", "#FF0000", "#00FF00", "#FFFF00",
      "#0000FF", "#FF00FF", "#00FFFF", "#FFFFFF",
      "#888888", "#FF8888", "#88FF88", "#FFFF88",
      "#8888FF", "#FF88FF", "#88FFFF", "#F8F8F8",
    ],
    restrictions: {
      description: "16 simultaneous colors from 512-color palette",
    },
  },`
);

// Add MS-DOS VGA 256-color palette (standard Mode 13h)
const vgaPalette = [];
// Generate standard VGA palette
for (let i = 0; i < 256; i++) {
  if (i < 16) {
    // EGA colors
    const colors = ["#000000", "#0000AA", "#00AA00", "#00AAAA", "#AA0000", "#AA00AA", "#AA5500", "#AAAAAA",
                    "#555555", "#5555FF", "#55FF55", "#55FFFF", "#FF5555", "#FF55FF", "#FFFF55", "#FFFFFF"];
    vgaPalette.push(colors[i]);
  } else {
    // Generate RGB332-style colors for the rest
    const r = Math.floor((i & 0xE0) / 32) * 36;
    const g = Math.floor((i & 0x1C) / 4) * 36;
    const b = Math.floor(i & 0x03) * 85;
    vgaPalette.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
  }
}

const vgaPaletteStr = vgaPalette.map(c => `"${c}"`).join(', ');

platformsContent = platformsContent.replace(
  `  msdos: {
    id: "msdos",
    name: "MS-DOS",
    displayName: "MS-DOS (VGA)",
    resolution: { width: 320, height: 200 },
    colorDepth: 18, // 262,144 colors total (VGA)
    paletteSize: 256, // 256 simultaneous
    restrictions: {
      description: "256 simultaneous colors from 262K-color palette",
    },
  },`,
  `  msdos: {
    id: "msdos",
    name: "MS-DOS",
    displayName: "MS-DOS (VGA)",
    resolution: { width: 320, height: 200 },
    colorDepth: 18, // 262,144 colors total (VGA)
    paletteSize: 256, // 256 simultaneous
    palette: [${vgaPaletteStr}],
    restrictions: {
      description: "256 simultaneous colors from 262K-color palette",
    },
  },`
);

fs.writeFileSync(platformsPath, platformsContent);
console.log('Added palettes for Amiga, Atari ST, and MS-DOS');

// Fix 2: Remove conditional for Apply Palette button
const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let dialogContent = fs.readFileSync(dialogPath, 'utf8');

// Remove the conditional that hides Apply Palette button
dialogContent = dialogContent.replace(
  `                {currentPlatform.palette && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleApplyPalette}
                    disabled={isProcessing}
                    style={{ flex: 1, fontSize: 12, padding: "8px 12px" }}
                  >
                    {isProcessing ? "Processing..." : "Apply Palette"}
                  </button>
                )}`,
  `                <button
                  className="btn btn-secondary"
                  onClick={handleApplyPalette}
                  disabled={isProcessing}
                  style={{ flex: 1, fontSize: 12, padding: "8px 12px" }}
                >
                  {isProcessing ? "Processing..." : "Apply Palette"}
                </button>`
);

// Also update the help text
dialogContent = dialogContent.replace(
  `              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Fit to Screen: Resize to {currentPlatform.resolution.width}×{currentPlatform.resolution.height}px
                {currentPlatform.palette && ' • Apply Palette: Convert colors to match platform'}
              </p>`,
  `              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Fit to Screen: Resize to {currentPlatform.resolution.width}×{currentPlatform.resolution.height}px • Apply Palette: Convert colors to match platform
              </p>`
);

fs.writeFileSync(dialogPath, dialogContent);
console.log('Fixed Apply Palette button to show for all platforms');
