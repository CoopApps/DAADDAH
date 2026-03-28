import { useRef, useEffect, useState } from "react";
import { PlatformSpec } from "../../types/platforms";
import { CanvasRenderer, WindowManager } from "../../rendering";

interface CanvasGameDisplayProps {
  platform: PlatformSpec;
  zoom: number;
  onReady?: (context: GameDisplayContext) => void;
}

export interface GameDisplayContext {
  renderer: CanvasRenderer;
  windowManager: WindowManager;
  clear: () => void;
  writeText: (text: string) => void;
  writeLine: (text: string) => void;
  setColors: (ink: number, paper: number) => void;
  drawImage: (base64Data: string, x: number, y: number) => Promise<void>;
  drawPlatformImage: (platformData: string, yPosition: number) => Promise<void>;
  present: () => void;
  setCursor: (col: number, row: number) => void;
  newLine: () => void;
}

/**
 * Canvas-based game display with platform-accurate rendering
 * Renders text and graphics at exact platform resolution with palette constraints
 */
export default function CanvasGameDisplay({ platform, zoom, onReady }: CanvasGameDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const windowManagerRef = useRef<WindowManager | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize canvas renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create renderer with platform specs
      const renderer = new CanvasRenderer(canvas, platform, {
        doubleBuffer: true,
        pixelated: true,
        charWidth: 8,
        charHeight: 8,
        fontFamily: "'Share Tech Mono', monospace"
      });

      // Create window manager
      const windowManager = new WindowManager(renderer);

      // Store refs
      rendererRef.current = renderer;
      windowManagerRef.current = windowManager;

      // Clear to black
      renderer.clear(0);
      renderer.present();

      setInitialized(true);

      // Provide context to parent
      if (onReady) {
        const context: GameDisplayContext = {
          renderer,
          windowManager,

          clear: () => {
            renderer.clear(0);
            windowManager.reset();
            renderer.present();
          },

          writeText: (text: string) => {
            windowManager.writeText(text, true);
          },

          writeLine: (text: string) => {
            windowManager.writeText(text + "\n", true);
          },

          setColors: (ink: number, paper: number) => {
            windowManager.setInk(ink);
            windowManager.setPaper(paper);
          },

          drawImage: async (base64Data: string, x: number, y: number) => {
            await renderer.drawImage(base64Data, x, y);
          },

          drawPlatformImage: async (platformData: string, yPosition: number) => {
            // Draw platform-specific image at correct Y position
            await renderer.drawImage(platformData, 0, yPosition);
          },

          present: () => {
            windowManager.render();
          },

          setCursor: (col: number, row: number) => {
            windowManager.setCursor(col, row);
          },

          newLine: () => {
            const window = windowManager.getActiveWindow();
            if (window) {
              windowManager.writeText("\n", false);
            }
          }
        };

        onReady(context);
      }
    } catch (error) {
      console.error("[CanvasGameDisplay] Failed to initialize renderer:", error);
    }

    return () => {
      // Cleanup
      rendererRef.current = null;
      windowManagerRef.current = null;
    };
  }, [platform, onReady]);

  // Update platform when it changes
  useEffect(() => {
    if (rendererRef.current && initialized) {
      rendererRef.current.setPlatform(platform);
      rendererRef.current.clear(0);

      if (windowManagerRef.current) {
        windowManagerRef.current.reset();
      }

      rendererRef.current.present();
    }
  }, [platform, initialized]);

  const displayWidth = platform.resolution.width * zoom;
  const displayHeight = platform.resolution.height * zoom;

  return (
    <div
      style={{
        width: displayWidth,
        height: displayHeight,
        border: "3px solid var(--green-bright)",
        boxShadow: "0 0 20px rgba(0, 255, 65, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)",
        borderRadius: 8,
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#000000",
      }}
    >
      {/* Platform Label */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          background: "rgba(0, 255, 65, 0.9)",
          color: "#000",
          padding: "4px 8px",
          fontSize: 10,
          fontWeight: "bold",
          textAlign: "center",
          zIndex: 10,
          fontFamily: "'Press Start 2P', monospace",
        }}
      >
        {platform.displayName}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
          display: "block",
          marginTop: 24, // Account for platform label
        }}
      />
    </div>
  );
}
