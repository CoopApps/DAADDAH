const fs = require('fs');

const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let content = fs.readFileSync(dialogPath, 'utf8');

// Add useRef import
content = content.replace(
  'import { useState } from "react";',
  'import { useState, useRef } from "react";'
);

// Add canvas ref and processing state after other state declarations
content = content.replace(
  'const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("zx_spectrum");',
  `const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("zx_spectrum");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);`
);

// Add helper function to find closest palette color
const closestColorFunction = `
  // Find closest color in platform palette
  const findClosestColor = (r: number, g: number, b: number, palette: string[]): string => {
    let minDistance = Infinity;
    let closestColor = palette[0];

    for (const color of palette) {
      const pr = parseInt(color.slice(1, 3), 16);
      const pg = parseInt(color.slice(3, 5), 16);
      const pb = parseInt(color.slice(5, 7), 16);

      const distance = Math.sqrt(
        Math.pow(r - pr, 2) +
        Math.pow(g - pg, 2) +
        Math.pow(b - pb, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }

    return closestColor;
  };

  // Apply platform palette to image
  const handleApplyPalette = async () => {
    if (!sourceImage || !currentPlatform.palette) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = sourceImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert each pixel to closest palette color
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const closestColor = findClosestColor(r, g, b, currentPlatform.palette);

        data[i] = parseInt(closestColor.slice(1, 3), 16);
        data[i + 1] = parseInt(closestColor.slice(3, 5), 16);
        data[i + 2] = parseInt(closestColor.slice(5, 7), 16);
      }

      ctx.putImageData(imageData, 0, 0);
      const processedImage = canvas.toDataURL('image/png');
      setSourceImage(processedImage);
    } catch (error) {
      console.error('Error applying palette:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Fit image to platform screen dimensions
  const handleFitToScreen = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = sourceImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = currentPlatform.resolution.width;
      canvas.height = currentPlatform.resolution.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw scaled image
      ctx.imageSmoothingEnabled = false; // Pixel-perfect scaling
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const resizedImage = canvas.toDataURL('image/png');
      setSourceImage(resizedImage);
      setHeight(currentPlatform.resolution.height);
    } catch (error) {
      console.error('Error fitting to screen:', error);
    } finally {
      setIsProcessing(false);
    }
  };
`;

// Add helper functions before the return statement
content = content.replace(
  'const previewWidth = currentPlatform.resolution.width * 2;',
  closestColorFunction + '\n  const previewWidth = currentPlatform.resolution.width * 2;'
);

// Add processing buttons after the file input section
content = content.replace(
  `            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Image will be converted to {currentPlatform.resolution.width}×{clampedHeight}px with {currentPlatform.displayName} palette
            </p>
          </div>`,
  `            <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
              Image will be converted to {currentPlatform.resolution.width}×{clampedHeight}px with {currentPlatform.displayName} palette
            </p>
          </div>

          {/* Image Processing Buttons */}
          {sourceImage && (
            <div className="form-group">
              <label className="form-label">Image Processing</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-secondary"
                  onClick={handleFitToScreen}
                  disabled={isProcessing}
                  style={{ flex: 1, fontSize: 12, padding: "8px 12px" }}
                >
                  {isProcessing ? "Processing..." : "Fit to Screen"}
                </button>
                {currentPlatform.palette && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleApplyPalette}
                    disabled={isProcessing}
                    style={{ flex: 1, fontSize: 12, padding: "8px 12px" }}
                  >
                    {isProcessing ? "Processing..." : "Apply Palette"}
                  </button>
                )}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4 }}>
                Fit to Screen: Resize to {currentPlatform.resolution.width}×{currentPlatform.resolution.height}px
                {currentPlatform.palette && ' • Apply Palette: Convert colors to match platform'}
              </p>
            </div>
          )}`
);

fs.writeFileSync(dialogPath, content);
console.log('Added image processing buttons to ImageDialog');
