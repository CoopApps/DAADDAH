import { PlatformSpec } from "../types/platforms";
import { RendererOptions } from "./types";

/**
 * Canvas renderer for platform-accurate display
 * Renders text and graphics at exact platform resolution with palette constraints
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private platform: PlatformSpec;
  private palette: string[];
  private charWidth: number;
  private charHeight: number;
  private cols: number;
  private rows: number;
  private fontFamily: string;
  private offscreenCanvas?: HTMLCanvasElement;
  private offscreenCtx?: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    platform: PlatformSpec,
    options: RendererOptions = {}
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("Failed to get 2D context");
    }
    this.ctx = ctx;
    this.platform = platform;
    this.palette = platform.palette || ["#000000", "#FFFFFF"];

    // Character cell dimensions (8x8 for most platforms)
    this.charWidth = options.charWidth || 8;
    this.charHeight = options.charHeight || 8;

    // Calculate grid dimensions
    this.cols = Math.floor(platform.resolution.width / this.charWidth);
    this.rows = Math.floor(platform.resolution.height / this.charHeight);

    // Font setup
    this.fontFamily = options.fontFamily || "'Press Start 2P', monospace";

    // Set canvas resolution
    this.canvas.width = platform.resolution.width;
    this.canvas.height = platform.resolution.height;

    // Apply pixel-perfect scaling
    if (options.pixelated !== false) {
      this.canvas.style.imageRendering = "pixelated";
      this.ctx.imageSmoothingEnabled = false;
    }

    // Setup double buffering if requested
    if (options.doubleBuffer) {
      this.offscreenCanvas = document.createElement("canvas");
      this.offscreenCanvas.width = platform.resolution.width;
      this.offscreenCanvas.height = platform.resolution.height;
      this.offscreenCtx = this.offscreenCanvas.getContext("2d")!;
      if (this.offscreenCtx) {
        this.offscreenCtx.imageSmoothingEnabled = false;
      }
    }
  }

  /**
   * Get the active drawing context (offscreen or main)
   */
  private get drawCtx(): CanvasRenderingContext2D {
    return this.offscreenCtx || this.ctx;
  }

  /**
   * Clear canvas to a specific color
   */
  clear(colorIndex: number = 0): void {
    const color = this.palette[colorIndex] || this.palette[0];
    this.drawCtx.fillStyle = color;
    this.drawCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Fill a rectangle with a palette color
   */
  fillRect(x: number, y: number, w: number, h: number, colorIndex: number): void {
    const color = this.palette[colorIndex] || this.palette[0];
    this.drawCtx.fillStyle = color;
    this.drawCtx.fillRect(x, y, w, h);
  }

  /**
   * Draw a single character at character grid coordinates
   */
  drawChar(
    char: string,
    col: number,
    row: number,
    inkIndex: number,
    paperIndex: number
  ): void {
    const x = col * this.charWidth;
    const y = row * this.charHeight;

    // Draw background
    this.fillRect(x, y, this.charWidth, this.charHeight, paperIndex);

    // Draw character
    const inkColor = this.palette[inkIndex] || this.palette[1];
    this.drawCtx.fillStyle = inkColor;
    this.drawCtx.font = `${this.charHeight}px ${this.fontFamily}`;
    this.drawCtx.textBaseline = "top";

    // Center character in cell
    const metrics = this.drawCtx.measureText(char);
    const charX = x + (this.charWidth - metrics.width) / 2;

    this.drawCtx.fillText(char, charX, y);
  }

  /**
   * Draw text string starting at character grid coordinates
   */
  drawText(
    text: string,
    col: number,
    row: number,
    inkIndex: number,
    paperIndex: number
  ): void {
    for (let i = 0; i < text.length; i++) {
      const currentCol = col + i;
      if (currentCol >= this.cols) break;  // Don't overflow screen width
      this.drawChar(text[i], currentCol, row, inkIndex, paperIndex);
    }
  }

  /**
   * Draw an image from base64 data at pixel coordinates
   */
  async drawImage(base64Data: string, x: number, y: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.drawCtx.drawImage(img, x, y);
        resolve();
      };
      img.onerror = reject;
      img.src = base64Data;
    });
  }

  /**
   * Draw an ImageData object at pixel coordinates
   */
  drawImageData(imageData: ImageData, x: number, y: number): void {
    this.drawCtx.putImageData(imageData, x, y);
  }

  /**
   * Get the color index closest to an RGB color
   */
  getNearestColorIndex(rgb: string): number {
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const colorDistance = (
      c1: [number, number, number],
      c2: [number, number, number]
    ): number => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };

    const targetRgb = hexToRgb(rgb);
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < this.palette.length; i++) {
      const paletteRgb = hexToRgb(this.palette[i]);
      const distance = colorDistance(targetRgb, paletteRgb);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  /**
   * Present the rendered frame (swap buffers if double-buffered)
   */
  present(): void {
    if (this.offscreenCanvas && this.offscreenCtx) {
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }

  /**
   * Get grid dimensions
   */
  getGridDimensions(): { cols: number; rows: number } {
    return { cols: this.cols, rows: this.rows };
  }

  /**
   * Get character cell dimensions
   */
  getCharDimensions(): { width: number; height: number } {
    return { width: this.charWidth, height: this.charHeight };
  }

  /**
   * Get platform specification
   */
  getPlatform(): PlatformSpec {
    return this.platform;
  }

  /**
   * Update platform (triggers resize and palette update)
   */
  setPlatform(platform: PlatformSpec): void {
    this.platform = platform;
    this.palette = platform.palette || ["#000000", "#FFFFFF"];

    // Recalculate grid
    this.cols = Math.floor(platform.resolution.width / this.charWidth);
    this.rows = Math.floor(platform.resolution.height / this.charHeight);

    // Resize canvases
    this.canvas.width = platform.resolution.width;
    this.canvas.height = platform.resolution.height;

    if (this.offscreenCanvas) {
      this.offscreenCanvas.width = platform.resolution.width;
      this.offscreenCanvas.height = platform.resolution.height;
    }
  }
}
