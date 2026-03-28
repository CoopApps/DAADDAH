import { useState, useMemo, useRef, useEffect } from "react";
import { DaadGame } from "../../types/daad";
import { PlatformId, PLATFORM_LIST, PLATFORMS } from "../../types/platforms";
import "../../styles/graphics.css";

interface PlatformPreviewProps {
  game: DaadGame;
}

export default function PlatformPreview({ game }: PlatformPreviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("zx_spectrum");
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [zoom, setZoom] = useState(2);
  const [showGrid, setShowGrid] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const platform = PLATFORMS[selectedPlatform];

  // Get locations with images
  const locationsWithImages = useMemo(() => {
    return game.locations.filter((loc) => loc.image && loc.image.sourceData && loc.image.sourceData.trim() !== "");
  }, [game.locations]);

  // Select first location with image on mount
  useEffect(() => {
    if (selectedLocationId === null && locationsWithImages.length > 0) {
      setSelectedLocationId(locationsWithImages[0].id);
    }
  }, [locationsWithImages, selectedLocationId]);

  const selectedLocation = game.locations.find((loc) => loc.id === selectedLocationId);

  // Convert RGB hex to nearest palette color
  const getNearestPaletteColor = (hexColor: string, palette: string[]): string => {
    const hexToRgb = (hex: string): [number, number, number] => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };

    const colorDistance = (c1: [number, number, number], c2: [number, number, number]): number => {
      return Math.sqrt(
        Math.pow(c1[0] - c2[0], 2) +
        Math.pow(c1[1] - c2[1], 2) +
        Math.pow(c1[2] - c2[2], 2)
      );
    };

    const targetRgb = hexToRgb(hexColor);
    let nearestColor = palette[0];
    let minDistance = Infinity;

    for (const paletteColor of palette) {
      const paletteRgb = hexToRgb(paletteColor);
      const distance = colorDistance(targetRgb, paletteRgb);
      if (distance < minDistance) {
        minDistance = distance;
        nearestColor = paletteColor;
      }
    }

    return nearestColor;
  };

  // Render platform-specific preview
  useEffect(() => {
    if (!canvasRef.current || !selectedLocation?.image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = platform.resolution.width;
    canvas.height = platform.resolution.height;

    // For demo: create a gradient pattern representing the image
    // In production, this would render actual image data
    const imageData = ctx.createImageData(canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;

        // Create a demo pattern (diagonal gradient)
        const r = Math.floor((x / canvas.width) * 255);
        const g = Math.floor((y / canvas.height) * 255);
        const b = Math.floor(((x + y) / (canvas.width + canvas.height)) * 255);

        // Convert to hex and find nearest palette color
        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const nearestColor = getNearestPaletteColor(hexColor, platform.palette || []);

        // Convert back to RGB
        const pr = parseInt(nearestColor.slice(1, 3), 16);
        const pg = parseInt(nearestColor.slice(3, 5), 16);
        const pb = parseInt(nearestColor.slice(5, 7), 16);

        imageData.data[idx] = pr;
        imageData.data[idx + 1] = pg;
        imageData.data[idx + 2] = pb;
        imageData.data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Draw grid if enabled
    if (showGrid && platform.restrictions.attributeBlockSize) {
      const { width: blockW, height: blockH } = platform.restrictions.attributeBlockSize;
      ctx.strokeStyle = "rgba(0, 255, 65, 0.3)";
      ctx.lineWidth = 1;

      for (let x = 0; x < canvas.width; x += blockW) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += blockH) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }
  }, [selectedLocation, platform, showGrid]);

  return (
    <div className="platform-preview">
      {/* Header */}
      <div className="platform-preview-header">
        <h3>Graphics Preview</h3>
        <div className="platform-preview-info">
          {platform.displayName} • {platform.resolution.width}×{platform.resolution.height}
        </div>
      </div>

      {/* Controls */}
      <div className="platform-preview-controls">
        {/* Platform selector */}
        <div className="preview-control-group">
          <label>Platform:</label>
          <select
            className="preview-select"
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as PlatformId)}
          >
            {PLATFORM_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Location selector */}
        <div className="preview-control-group">
          <label>Location:</label>
          <select
            className="preview-select"
            value={selectedLocationId ?? ""}
            onChange={(e) => setSelectedLocationId(parseInt(e.target.value))}
            disabled={locationsWithImages.length === 0}
          >
            {locationsWithImages.length === 0 ? (
              <option value="">No images available</option>
            ) : (
              locationsWithImages.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  #{loc.id} - {loc.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Zoom control */}
        <div className="preview-control-group">
          <label>Zoom:</label>
          <select
            className="preview-select"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
          >
            <option value="1">100%</option>
            <option value="2">200%</option>
            <option value="3">300%</option>
            <option value="4">400%</option>
          </select>
        </div>

        {/* Toggle buttons */}
        <button
          className={`preview-toggle-btn ${showGrid ? "active" : ""}`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle attribute grid"
          disabled={!platform.restrictions.attributeBlockSize}
        >
          Grid
        </button>
        <button
          className={`preview-toggle-btn ${showPalette ? "active" : ""}`}
          onClick={() => setShowPalette(!showPalette)}
          title="Toggle palette display"
        >
          Palette
        </button>
      </div>

      {/* Main content area */}
      <div className="platform-preview-content">
        {/* Canvas preview */}
        <div className="preview-canvas-container">
          {selectedLocation && selectedLocation.image ? (
            <div
              className="preview-canvas-wrapper"
              style={{
                width: platform.resolution.width * zoom,
                height: platform.resolution.height * zoom,
              }}
            >
              <canvas
                ref={canvasRef}
                className="preview-canvas"
                style={{
                  width: platform.resolution.width * zoom,
                  height: platform.resolution.height * zoom,
                  imageRendering: "pixelated",
                }}
              />
            </div>
          ) : (
            <div className="preview-no-image">
              <p>No image selected</p>
              <small>
                {locationsWithImages.length === 0
                  ? "Add images to locations to see previews"
                  : "Select a location with an image"}
              </small>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="preview-sidebar">
          {/* Platform specs */}
          <div className="preview-info-panel">
            <h4>Platform Specifications</h4>
            <div className="preview-spec-row">
              <span className="preview-spec-label">Resolution:</span>
              <span className="preview-spec-value">
                {platform.resolution.width} × {platform.resolution.height}
              </span>
            </div>
            <div className="preview-spec-row">
              <span className="preview-spec-label">Color Depth:</span>
              <span className="preview-spec-value">{platform.colorDepth}-bit</span>
            </div>
            <div className="preview-spec-row">
              <span className="preview-spec-label">Colors:</span>
              <span className="preview-spec-value">{platform.paletteSize} colors</span>
            </div>
            <div className="preview-spec-restriction">
              <strong>Restrictions:</strong>
              <p>{platform.restrictions.description}</p>
            </div>
          </div>

          {/* Palette display */}
          {showPalette && platform.palette && (
            <div className="preview-palette-panel">
              <h4>Color Palette</h4>
              <div className="preview-palette-grid">
                {platform.palette.map((color, idx) => (
                  <div
                    key={idx}
                    className="preview-palette-color"
                    style={{ backgroundColor: color }}
                    title={`${idx}: ${color}`}
                  >
                    <span className="preview-palette-index">{idx}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
