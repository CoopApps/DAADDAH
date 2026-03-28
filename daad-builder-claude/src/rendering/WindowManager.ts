import { WindowState, ColorAttribute } from "./types";
import { CanvasRenderer } from "./CanvasRenderer";
import { TextBuffer } from "./TextBuffer";

/**
 * Window manager for DAAD multi-window text rendering
 * Manages up to 8 windows (0-7) with independent buffers and positions
 */
export class WindowManager {
  private windows: Map<number, WindowState>;
  private activeWindow: number = 0;
  private renderer: CanvasRenderer;
  private cols: number;
  private rows: number;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    const dims = renderer.getGridDimensions();
    this.cols = dims.cols;
    this.rows = dims.rows;
    this.windows = new Map();

    // Create default window 0 (full screen)
    this.createWindow(0, 0, 0, this.cols, this.rows);
  }

  /**
   * Create or reset a window
   * DAAD: WINDOW id
   */
  createWindow(
    id: number,
    x: number = 0,
    y: number = 0,
    width: number = this.cols,
    height: number = this.rows
  ): void {
    if (id < 0 || id > 7) {
      throw new Error(`Invalid window ID ${id}. Must be 0-7.`);
    }

    // Create buffer for window contents
    const buffer: string[][] = [];
    const colorBuffer: ColorAttribute[][] = [];
    for (let row = 0; row < height; row++) {
      buffer[row] = new Array(width).fill(" ");
      colorBuffer[row] = new Array(width).fill({ ink: 7, paper: 0 });
    }

    this.windows.set(id, {
      id,
      x: Math.max(0, Math.min(x, this.cols - 1)),
      y: Math.max(0, Math.min(y, this.rows - 1)),
      width: Math.min(width, this.cols - x),
      height: Math.min(height, this.rows - y),
      cursorX: 0,
      cursorY: 0,
      paperColor: 0,
      inkColor: 7,
      visible: true,
      buffer,
      colorBuffer
    });
  }

  /**
   * Set active window for text output
   * DAAD: WINDOW id
   */
  setActiveWindow(id: number): void {
    if (id < 0 || id > 7) {
      throw new Error(`Invalid window ID ${id}. Must be 0-7.`);
    }

    // Create window if it doesn't exist
    if (!this.windows.has(id)) {
      this.createWindow(id);
    }

    this.activeWindow = id;
  }

  /**
   * Get the currently active window
   */
  getActiveWindow(): WindowState | undefined {
    return this.windows.get(this.activeWindow);
  }

  /**
   * Set window position
   * DAAD: WINAT col line
   */
  setWindowPosition(id: number, x: number, y: number): void {
    const window = this.windows.get(id);
    if (!window) {
      throw new Error(`Window ${id} does not exist`);
    }

    window.x = Math.max(0, Math.min(x, this.cols - 1));
    window.y = Math.max(0, Math.min(y, this.rows - 1));
  }

  /**
   * Set window size
   * DAAD: WINSIZE cols lines
   */
  setWindowSize(id: number, width: number, height: number): void {
    const window = this.windows.get(id);
    if (!window) {
      throw new Error(`Window ${id} does not exist`);
    }

    // Resize buffers
    const newBuffer: string[][] = [];
    const newColorBuffer: ColorAttribute[][] = [];

    for (let row = 0; row < height; row++) {
      newBuffer[row] = [];
      newColorBuffer[row] = [];
      for (let col = 0; col < width; col++) {
        // Copy old content if it exists
        if (row < window.buffer.length && col < window.buffer[row].length) {
          newBuffer[row][col] = window.buffer[row][col];
          newColorBuffer[row][col] = window.colorBuffer[row][col];
        } else {
          newBuffer[row][col] = " ";
          newColorBuffer[row][col] = { ink: window.inkColor, paper: window.paperColor };
        }
      }
    }

    window.buffer = newBuffer;
    window.colorBuffer = newColorBuffer;
    window.width = Math.min(width, this.cols - window.x);
    window.height = Math.min(height, this.rows - window.y);

    // Clamp cursor to new size
    window.cursorX = Math.min(window.cursorX, window.width - 1);
    window.cursorY = Math.min(window.cursorY, window.height - 1);
  }

  /**
   * Set cursor position within active window
   * DAAD: PRINTAT col line (relative to window)
   */
  setCursor(col: number, row: number): void {
    const window = this.getActiveWindow();
    if (!window) return;

    window.cursorX = Math.max(0, Math.min(col, window.width - 1));
    window.cursorY = Math.max(0, Math.min(row, window.height - 1));
  }

  /**
   * Set ink color for active window
   * DAAD: INK color
   */
  setInk(colorIndex: number): void {
    const window = this.getActiveWindow();
    if (window) {
      window.inkColor = colorIndex;
    }
  }

  /**
   * Set paper color for active window
   * DAAD: PAPER color
   */
  setPaper(colorIndex: number): void {
    const window = this.getActiveWindow();
    if (window) {
      window.paperColor = colorIndex;
    }
  }

  /**
   * Clear active window
   * DAAD: CLS
   */
  clearWindow(): void {
    const window = this.getActiveWindow();
    if (!window) return;

    // Clear buffer
    for (let row = 0; row < window.height; row++) {
      for (let col = 0; col < window.width; col++) {
        window.buffer[row][col] = " ";
        window.colorBuffer[row][col] = { ink: window.inkColor, paper: window.paperColor };
      }
    }

    // Reset cursor
    window.cursorX = 0;
    window.cursorY = 0;
  }

  /**
   * Write text to active window with word wrapping
   */
  writeText(text: string, wordWrap: boolean = true): void {
    const window = this.getActiveWindow();
    if (!window) return;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Handle newline
      if (char === "\n") {
        this.newline();
        continue;
      }

      // Write character to buffer
      if (window.cursorY < window.height && window.cursorX < window.width) {
        window.buffer[window.cursorY][window.cursorX] = char;
        window.colorBuffer[window.cursorY][window.cursorX] = {
          ink: window.inkColor,
          paper: window.paperColor
        };
      }

      // Advance cursor
      window.cursorX++;

      // Handle line wrap
      if (window.cursorX >= window.width) {
        if (wordWrap) {
          this.newline();
        } else {
          window.cursorX = window.width - 1;
        }
      }
    }
  }

  /**
   * Move to next line in active window
   */
  private newline(): void {
    const window = this.getActiveWindow();
    if (!window) return;

    window.cursorX = 0;
    window.cursorY++;

    // Scroll if at bottom
    if (window.cursorY >= window.height) {
      this.scrollWindow();
      window.cursorY = window.height - 1;
    }
  }

  /**
   * Scroll active window up by one line
   */
  private scrollWindow(): void {
    const window = this.getActiveWindow();
    if (!window) return;

    // Shift all lines up
    window.buffer.shift();
    window.colorBuffer.shift();

    // Add empty line at bottom
    const emptyLine: string[] = new Array(window.width).fill(" ");
    const emptyColorLine: ColorAttribute[] = new Array(window.width).fill({
      ink: window.inkColor,
      paper: window.paperColor
    });

    window.buffer.push(emptyLine);
    window.colorBuffer.push(emptyColorLine);
  }

  /**
   * Set window visibility
   */
  setWindowVisible(id: number, visible: boolean): void {
    const window = this.windows.get(id);
    if (window) {
      window.visible = visible;
    }
  }

  /**
   * Render all visible windows to the canvas
   */
  render(): void {
    // Render windows in order (0 to 7, so higher numbered windows appear on top)
    for (let id = 0; id <= 7; id++) {
      const window = this.windows.get(id);
      if (!window || !window.visible) continue;

      // Render each character in the window
      for (let row = 0; row < window.height; row++) {
        for (let col = 0; col < window.width; col++) {
          const char = window.buffer[row]?.[col] || " ";
          const color = window.colorBuffer[row]?.[col] || { ink: 7, paper: 0 };

          // Calculate screen position
          const screenCol = window.x + col;
          const screenRow = window.y + row;

          // Render character
          this.renderer.drawChar(
            char,
            screenCol,
            screenRow,
            color.ink,
            color.paper
          );
        }
      }
    }

    // Present the frame
    this.renderer.present();
  }

  /**
   * Get all windows (for debugging)
   */
  getAllWindows(): Map<number, WindowState> {
    return this.windows;
  }

  /**
   * Reset all windows
   */
  reset(): void {
    this.windows.clear();
    this.createWindow(0, 0, 0, this.cols, this.rows);
    this.activeWindow = 0;
  }
}
