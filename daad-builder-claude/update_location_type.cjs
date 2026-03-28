const fs = require('fs');

const typesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let content = fs.readFileSync(typesPath, 'utf8');

// Add PlatformId import at the top
content = content.replace(
  '// DAAD Game Data Types',
  `// DAAD Game Data Types
import { PlatformId } from "./platforms";`
);

// Replace the image field in Location interface
content = content.replace(
  `  // Image data (optional)
  image?: {
    // Base64-encoded source image (PNG/BMP before conversion)
    sourceData?: string;
    // Base64-encoded SCR file data (6912 bytes, ZX Spectrum format)
    scrData?: string;
    // Image position on screen (0-192 for Y, typically 0)
    yPosition: number;
    // Image height in pixels
    height: number;
  };`,
  `  // Image data (optional) - platform-specific versions
  image?: {
    // Base64-encoded source image (PNG/BMP before conversion)
    sourceData: string;
    // Image position on screen (Y coordinate, platform-dependent)
    yPosition: number;
    // Image height in pixels (platform-dependent max)
    height: number;
    // Platform-specific converted image data
    platformImages?: {
      [K in PlatformId]?: {
        // Base64-encoded platform-specific image data
        // (SCR for ZX Spectrum, PRG for C64, etc.)
        imageData: string;
        // Platform-specific metadata
        colorMode?: string; // e.g., "hires" vs "multicolor" for C64
        paletteIndices?: number[]; // Selected colors from full palette
      };
    };
  };`
);

fs.writeFileSync(typesPath, content);
console.log('Updated Location type to support multi-platform images');
