import { PlatformSpec } from "../types/platforms";

/**
 * Window state for DAAD window management
 */
export interface WindowState {
  id: number;           // 0-7
  x: number;            // Column position (0-based)
  y: number;            // Line position (0-based)
  width: number;        // Columns
  height: number;       // Lines
  cursorX: number;      // Current print position X (column)
  cursorY: number;      // Current print position Y (line)
  paperColor: number;   // Background color palette index
  inkColor: number;     // Text color palette index
  visible: boolean;     // Window visibility
  buffer: string[][];   // Character buffer [row][col]
  colorBuffer: ColorAttribute[][];  // Color per character [row][col]
}

/**
 * Color attribute for a single character cell
 */
export interface ColorAttribute {
  ink: number;    // Foreground color palette index
  paper: number;  // Background color palette index
  bright?: boolean;  // ZX Spectrum BRIGHT attribute
  flash?: boolean;   // ZX Spectrum FLASH attribute
}

/**
 * Canvas renderer options
 */
export interface RendererOptions {
  /** Enable double buffering for smooth rendering */
  doubleBuffer?: boolean;
  /** Font to use for character rendering */
  fontFamily?: string;
  /** Character cell width in pixels */
  charWidth?: number;
  /** Character cell height in pixels */
  charHeight?: number;
  /** Enable pixel-perfect scaling */
  pixelated?: boolean;
}

/**
 * Text rendering options
 */
export interface TextRenderOptions {
  ink: number;
  paper: number;
  wordWrap?: boolean;
  newline?: boolean;
}

/**
 * Image rendering metadata
 */
export interface ImageMetadata {
  yPosition: number;    // Y offset in pixels
  height: number;       // Height in pixels
  platformData?: string;  // Platform-specific image data (base64)
}
