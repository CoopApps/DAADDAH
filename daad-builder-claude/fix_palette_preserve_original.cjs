const fs = require('fs');

const dialogPath = 'D:/projects/daadah/daad-builder-ui/src/components/ImageDialog.tsx';
let content = fs.readFileSync(dialogPath, 'utf8');

// Add originalImage state to preserve the unprocessed source
content = content.replace(
  `  const [sourceImage, setSourceImage] = useState<string | null>(
    location.image?.sourceData || null
  );`,
  `  const [sourceImage, setSourceImage] = useState<string | null>(
    location.image?.sourceData || null
  );
  const [originalImage, setOriginalImage] = useState<string | null>(
    location.image?.sourceData || null
  );`
);

// Update handleFileSelect to save both original and display version
content = content.replace(
  `  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSourceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };`,
  `  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setSourceImage(imageData);
      setOriginalImage(imageData); // Save original for reprocessing
    };
    reader.readAsDataURL(file);
  };`
);

// Update handleApplyPalette to use originalImage
content = content.replace(
  `  // Apply platform palette to image
  const handleApplyPalette = async () => {
    if (!sourceImage || !currentPlatform.palette) return;`,
  `  // Apply platform palette to image
  const handleApplyPalette = async () => {
    if (!originalImage || !currentPlatform.palette) return;`
);

content = content.replace(
  `      const img = new Image();
      img.src = sourceImage;`,
  `      const img = new Image();
      img.src = originalImage; // Always process from original`
);

// Update handleFitToScreen to use originalImage
content = content.replace(
  `  // Fit image to platform screen dimensions
  const handleFitToScreen = async () => {
    if (!sourceImage) return;`,
  `  // Fit image to platform screen dimensions
  const handleFitToScreen = async () => {
    if (!originalImage) return;`
);

content = content.replace(
  `      const img = new Image();
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
      setHeight(currentPlatform.resolution.height);`,
  `      const img = new Image();
      img.src = originalImage; // Always process from original

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
      setOriginalImage(resizedImage); // Update original after resize
      setHeight(currentPlatform.resolution.height);`
);

// Update handleRemove to clear both
content = content.replace(
  `  const handleRemove = () => {
    setSourceImage(null);
    onSave(undefined);
    onClose();
  };`,
  `  const handleRemove = () => {
    setSourceImage(null);
    setOriginalImage(null);
    onSave(undefined);
    onClose();
  };`
);

fs.writeFileSync(dialogPath, content);
console.log('Fixed palette processing to preserve original image');
