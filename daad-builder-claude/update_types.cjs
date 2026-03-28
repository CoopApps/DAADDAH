const fs = require('fs');

const typesPath = 'D:/projects/daadah/daad-builder-ui/src/types/daad.ts';
let content = fs.readFileSync(typesPath, 'utf8');

// Add image data to Location interface
content = content.replace(
  `export interface Location {
  id: number;
  name: string;
  description: string;
  isDark: boolean;
  exits: Record<Direction, number | null>;
  // Visual position for the editor
  x: number;
  y: number;
}`,
  `export interface Location {
  id: number;
  name: string;
  description: string;
  isDark: boolean;
  exits: Record<Direction, number | null>;
  // Visual position for the editor
  x: number;
  y: number;
  // Image data (optional)
  image?: {
    // Base64-encoded source image (PNG/BMP before conversion)
    sourceData?: string;
    // Base64-encoded SCR file data (6912 bytes, ZX Spectrum format)
    scrData?: string;
    // Image position on screen (0-192 for Y, typically 0)
    yPosition: number;
    // Image height in pixels
    height: number;
  };
}`
);

fs.writeFileSync(typesPath, content);
console.log('Updated types with image support');
