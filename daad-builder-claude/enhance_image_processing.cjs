const fs = require('fs');

const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let content = fs.readFileSync(dialogPath, 'utf8');

// Add dithering option state after other states
content = content.replace(
  'const [isProcessing, setIsProcessing] = useState(false);',
  `const [isProcessing, setIsProcessing] = useState(false);
  const [useDithering, setUseDithering] = useState(false);
  const [enforceAttributeClash, setEnforceAttributeClash] = useState(true);`
);

// Replace the findClosestColor and processing functions with enhanced versions
const enhancedProcessingFunctions = `
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

  // Get most common colors in an 8x8 block
  const getBlockColors = (
    imageData: ImageData,
    blockX: number,
    blockY: number,
    blockSize: { width: number; height: number },
    palette: string[]
  ): string[] => {
    const colorCounts = new Map<string, number>();

    for (let y = 0; y < blockSize.height; y++) {
      for (let x = 0; x < blockSize.width; x++) {
        const px = blockX * blockSize.width + x;
        const py = blockY * blockSize.height + y;

        if (px >= imageData.width || py >= imageData.height) continue;

        const idx = (py * imageData.width + px) * 4;
        const r = imageData.data[idx];
        const g = imageData.data[idx + 1];
        const b = imageData.data[idx + 2];

        const color = findClosestColor(r, g, b, palette);
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    }

    // Return top 2 colors
    return Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([color]) => color);
  };

  // Apply Floyd-Steinberg dithering
  const applyFloydSteinbergDithering = (
    imageData: ImageData,
    palette: string[]
  ) => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const oldR = data[idx];
        const oldG = data[idx + 1];
        const oldB = data[idx + 2];

        const newColor = findClosestColor(oldR, oldG, oldB, palette);
        const newR = parseInt(newColor.slice(1, 3), 16);
        const newG = parseInt(newColor.slice(3, 5), 16);
        const newB = parseInt(newColor.slice(5, 7), 16);

        data[idx] = newR;
        data[idx + 1] = newG;
        data[idx + 2] = newB;

        const errR = oldR - newR;
        const errG = oldG - newG;
        const errB = oldB - newB;

        // Distribute error to neighboring pixels
        const distributeError = (offsetX: number, offsetY: number, factor: number) => {
          const targetX = x + offsetX;
          const targetY = y + offsetY;
          if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
            const targetIdx = (targetY * width + targetX) * 4;
            data[targetIdx] = Math.max(0, Math.min(255, data[targetIdx] + errR * factor));
            data[targetIdx + 1] = Math.max(0, Math.min(255, data[targetIdx + 1] + errG * factor));
            data[targetIdx + 2] = Math.max(0, Math.min(255, data[targetIdx + 2] + errB * factor));
          }
        };

        distributeError(1, 0, 7 / 16);
        distributeError(-1, 1, 3 / 16);
        distributeError(0, 1, 5 / 16);
        distributeError(1, 1, 1 / 16);
      }
    }
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

      // Apply dithering if enabled
      if (useDithering) {
        applyFloydSteinbergDithering(imageData, currentPlatform.palette);
      } else if (enforceAttributeClash && currentPlatform.restrictions.attributeBlockSize) {
        // Apply attribute clash restriction
        const blockSize = currentPlatform.restrictions.attributeBlockSize;
        const blocksX = Math.ceil(canvas.width / blockSize.width);
        const blocksY = Math.ceil(canvas.height / blockSize.height);

        // First pass: determine block colors
        const blockPalettes = new Map<string, string[]>();

        for (let by = 0; by < blocksY; by++) {
          for (let bx = 0; bx < blocksX; bx++) {
            const blockColors = getBlockColors(imageData, bx, by, blockSize, currentPlatform.palette);
            blockPalettes.set(\`\${bx},\${by}\`, blockColors);
          }
        }

        // Second pass: apply restricted palette to each block
        const data = imageData.data;
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const bx = Math.floor(x / blockSize.width);
            const by = Math.floor(y / blockSize.height);
            const blockColors = blockPalettes.get(\`\${bx},\${by}\`) || currentPlatform.palette;

            const idx = (y * canvas.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];

            const closestColor = findClosestColor(r, g, b, blockColors);

            data[idx] = parseInt(closestColor.slice(1, 3), 16);
            data[idx + 1] = parseInt(closestColor.slice(3, 5), 16);
            data[idx + 2] = parseInt(closestColor.slice(5, 7), 16);
          }
        }
      } else {
        // Simple palette conversion without restrictions
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const closestColor = findClosestColor(r, g, b, currentPlatform.palette);

          data[i] = parseInt(closestColor.slice(1, 3), 16);
          data[i + 1] = parseInt(closestColor.slice(3, 5), 16);
          data[i + 2] = parseInt(closestColor.slice(5, 7), 16);
        }
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

// Find and replace the old processing functions
content = content.replace(
  /\/\/ Find closest color in platform palette[\s\S]*?setIsProcessing\(false\);\s+}\s+};/,
  enhancedProcessingFunctions.trim()
);

// Add checkboxes for dithering and attribute clash before the buttons
content = content.replace(
  `          {/* Image Processing Buttons */}
          {sourceImage && (
            <div className="form-group">
              <label className="form-label">Image Processing</label>`,
  `          {/* Image Processing Buttons */}
          {sourceImage && (
            <div className="form-group">
              <label className="form-label">Image Processing</label>

              {/* Processing Options */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={useDithering}
                    onChange={(e) => setUseDithering(e.target.checked)}
                  />
                  <span style={{ color: "var(--text-primary)" }}>Floyd-Steinberg Dithering</span>
                </label>
                {currentPlatform.restrictions.attributeBlockSize && (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, cursor: "pointer", marginTop: 4 }}>
                    <input
                      type="checkbox"
                      checked={enforceAttributeClash}
                      onChange={(e) => setEnforceAttributeClash(e.target.checked)}
                      disabled={useDithering}
                    />
                    <span style={{ color: useDithering ? "var(--text-dim)" : "var(--text-primary)" }}>
                      Enforce Attribute Clash ({currentPlatform.restrictions.colorsPerBlock} colors per {currentPlatform.restrictions.attributeBlockSize.width}×{currentPlatform.restrictions.attributeBlockSize.height}px)
                    </span>
                  </label>
                )}
              </div>`
);

fs.writeFileSync(dialogPath, content);
console.log('Enhanced image processing with dithering and attribute clash');
