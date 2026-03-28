// Create a minimal valid ICO file (16x16 green icon)
const fs = require('fs');

// ICO header (6 bytes)
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);      // Reserved, must be 0
header.writeUInt16LE(1, 2);      // Image type: 1 = ICO
header.writeUInt16LE(1, 4);      // Number of images: 1

// ICO directory entry (16 bytes)
const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(32, 0);       // Width (32 = 32px, 0 = 256px)
dirEntry.writeUInt8(32, 1);       // Height
dirEntry.writeUInt8(0, 2);        // Color palette (0 = no palette)
dirEntry.writeUInt8(0, 3);        // Reserved
dirEntry.writeUInt16LE(1, 4);     // Color planes
dirEntry.writeUInt16LE(32, 6);    // Bits per pixel
dirEntry.writeUInt32LE(0, 8);     // Image data size (will fill later)
dirEntry.writeUInt32LE(22, 12);   // Offset to image data (6 + 16 = 22)

// Create a simple 32x32 BMP-style image data
// BITMAPINFOHEADER (40 bytes)
const bmpHeader = Buffer.alloc(40);
bmpHeader.writeUInt32LE(40, 0);    // Header size
bmpHeader.writeInt32LE(32, 4);     // Width
bmpHeader.writeInt32LE(64, 8);     // Height (doubled for AND mask)
bmpHeader.writeUInt16LE(1, 12);    // Planes
bmpHeader.writeUInt16LE(32, 14);   // Bits per pixel (BGRA)
bmpHeader.writeUInt32LE(0, 16);    // Compression (none)
bmpHeader.writeUInt32LE(0, 20);    // Image size (can be 0 for uncompressed)
bmpHeader.writeInt32LE(0, 24);     // X pixels per meter
bmpHeader.writeInt32LE(0, 28);     // Y pixels per meter
bmpHeader.writeUInt32LE(0, 32);    // Colors used
bmpHeader.writeUInt32LE(0, 36);    // Important colors

// Pixel data (32x32 BGRA = 4096 bytes) - retro green color
const pixelData = Buffer.alloc(32 * 32 * 4);
for (let y = 0; y < 32; y++) {
  for (let x = 0; x < 32; x++) {
    const i = (y * 32 + x) * 4;
    // Create a simple "D" shape for DAAD
    const inBorder = x < 2 || x > 29 || y < 2 || y > 29;
    const inD = (x >= 6 && x <= 10) || // vertical bar
                ((x > 10 && x <= 24) && (y >= 4 && y <= 8 || y >= 23 && y <= 27)) || // top/bottom
                ((x >= 22 && x <= 26) && (y > 8 && y < 23)); // right curve

    if (inBorder) {
      // Dark green border
      pixelData[i] = 0x00;     // B
      pixelData[i+1] = 0x66;   // G
      pixelData[i+2] = 0x00;   // R
      pixelData[i+3] = 0xFF;   // A
    } else if (inD) {
      // Bright green "D"
      pixelData[i] = 0x00;     // B
      pixelData[i+1] = 0xFF;   // G
      pixelData[i+2] = 0x00;   // R
      pixelData[i+3] = 0xFF;   // A
    } else {
      // Dark background
      pixelData[i] = 0x1A;     // B
      pixelData[i+1] = 0x1A;   // G
      pixelData[i+2] = 0x1A;   // R
      pixelData[i+3] = 0xFF;   // A
    }
  }
}

// AND mask (32x32 / 8 bits = 128 bytes, all 0 = fully visible)
const andMask = Buffer.alloc(128, 0);

// Calculate total image data size
const imageDataSize = bmpHeader.length + pixelData.length + andMask.length;
dirEntry.writeUInt32LE(imageDataSize, 8);

// Combine all parts
const ico = Buffer.concat([header, dirEntry, bmpHeader, pixelData, andMask]);

fs.writeFileSync('src-tauri/icons/icon.ico', ico);
console.log('Created icon.ico');

// Also create a 32x32.png placeholder (just copy the ico for now - Tauri may need PNG too)
// For proper PNG we'd need more complex encoding, so let's create a simple one
