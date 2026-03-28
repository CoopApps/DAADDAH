import { ColorAttribute } from "./types";

/**
 * Text buffer for character grid
 * Manages a 2D array of characters and their color attributes
 */
export class TextBuffer {
  private cols: number;
  private rows: number;
  private buffer: string[][];
  private colorBuffer: ColorAttribute[][];
  private cursorX: number = 0;
  private cursorY: number = 0;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.buffer = this.createEmptyBuffer();
    this.colorBuffer = this.createEmptyColorBuffer();
  }

  /**
   * Create empty character buffer
   */
  private createEmptyBuffer(): string[][] {
    const buf: string[][] = [];
    for (let row = 0; row < this.rows; row++) {
      buf[row] = [];
      for (let col = 0; col < this.cols; col++) {
        buf[row][col] = " ";
      }
    }
    return buf;
  }

  /**
   * Create empty color buffer with default colors
   */
  private createEmptyColorBuffer(): ColorAttribute[][] {
    const buf: ColorAttribute[][] = [];
    for (let row = 0; row < this.rows; row++) {
      buf[row] = [];
      for (let col = 0; col < this.cols; col++) {
        buf[row][col] = { ink: 7, paper: 0 };  // White on black default
      }
    }
    return buf;
  }

  /**
   * Clear the buffer
   */
  clear(ink: number = 7, paper: number = 0): void {
    this.buffer = this.createEmptyBuffer();
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.colorBuffer[row][col] = { ink, paper };
      }
    }
    this.cursorX = 0;
    this.cursorY = 0;
  }

  /**
   * Set character at specific position
   */
  setChar(col: number, row: number, char: string, ink: number, paper: number): void {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.buffer[row][col] = char || " ";
      this.colorBuffer[row][col] = { ink, paper };
    }
  }

  /**
   * Get character at specific position
   */
  getChar(col: number, row: number): { char: string; color: ColorAttribute } | null {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      return {
        char: this.buffer[row][col],
        color: this.colorBuffer[row][col]
      };
    }
    return null;
  }

  /**
   * Write text at cursor position with word wrapping
   */
  writeText(text: string, ink: number, paper: number, wordWrap: boolean = true): void {
    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      // Handle newline
      if (char === "\n") {
        this.newline();
        continue;
      }

      // Write character
      this.setChar(this.cursorX, this.cursorY, char, ink, paper);

      // Advance cursor
      this.cursorX++;

      // Handle line wrap
      if (this.cursorX >= this.cols) {
        if (wordWrap) {
          this.newline();
        } else {
          this.cursorX = this.cols - 1;  // Stop at edge
        }
      }
    }
  }

  /**
   * Move cursor to next line
   */
  newline(): void {
    this.cursorX = 0;
    this.cursorY++;

    // Scroll if at bottom
    if (this.cursorY >= this.rows) {
      this.scrollUp();
      this.cursorY = this.rows - 1;
    }
  }

  /**
   * Scroll buffer up by one line
   */
  scrollUp(lines: number = 1): void {
    for (let i = 0; i < lines; i++) {
      // Remove first line
      this.buffer.shift();
      this.colorBuffer.shift();

      // Add empty line at bottom
      const emptyLine: string[] = [];
      const emptyColorLine: ColorAttribute[] = [];
      for (let col = 0; col < this.cols; col++) {
        emptyLine[col] = " ";
        emptyColorLine[col] = { ink: 7, paper: 0 };
      }
      this.buffer.push(emptyLine);
      this.colorBuffer.push(emptyColorLine);
    }
  }

  /**
   * Set cursor position
   */
  setCursor(col: number, row: number): void {
    this.cursorX = Math.max(0, Math.min(col, this.cols - 1));
    this.cursorY = Math.max(0, Math.min(row, this.rows - 1));
  }

  /**
   * Get cursor position
   */
  getCursor(): { col: number; row: number } {
    return { col: this.cursorX, row: this.cursorY };
  }

  /**
   * Get buffer dimensions
   */
  getDimensions(): { cols: number; rows: number } {
    return { cols: this.cols, rows: this.rows };
  }

  /**
   * Get entire buffer (for rendering)
   */
  getBuffer(): { buffer: string[][];  colorBuffer: ColorAttribute[][] } {
    return {
      buffer: this.buffer,
      colorBuffer: this.colorBuffer
    };
  }

  /**
   * Get a specific line
   */
  getLine(row: number): { chars: string[]; colors: ColorAttribute[] } | null {
    if (row >= 0 && row < this.rows) {
      return {
        chars: this.buffer[row],
        colors: this.colorBuffer[row]
      };
    }
    return null;
  }

  /**
   * Fill rectangle with character and color
   */
  fillRect(
    col: number,
    row: number,
    width: number,
    height: number,
    char: string,
    ink: number,
    paper: number
  ): void {
    for (let r = row; r < row + height && r < this.rows; r++) {
      for (let c = col; c < col + width && c < this.cols; c++) {
        if (c >= 0 && r >= 0) {
          this.setChar(c, r, char, ink, paper);
        }
      }
    }
  }
}
