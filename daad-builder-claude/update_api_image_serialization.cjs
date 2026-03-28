const fs = require('fs');

const apiPath = 'D:/projects/daadah/daad-builder-ui/src/api/tauri.ts';
let content = fs.readFileSync(apiPath, 'utf8');

// 1. Add image interfaces to BackendLocation
content = content.replace(
  `interface BackendLocation {
  id: number;
  name: string;
  description: string;
  is_dark: boolean;
  connections: BackendConnection[];
  editor_x: number;
  editor_y: number;
}`,
  `interface BackendLocation {
  id: number;
  name: string;
  description: string;
  is_dark: boolean;
  connections: BackendConnection[];
  editor_x: number;
  editor_y: number;
  image?: BackendLocationImage;
}

interface BackendLocationImage {
  source_data: string;
  y_position: number;
  height: number;
  platform_images?: Record<string, BackendPlatformImage>;
}

interface BackendPlatformImage {
  image_data: string;
  color_mode?: string;
  palette_indices?: number[];
}`
);

// 2. Update toBackendGame to include image data
content = content.replace(
  `    locations: game.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      is_dark: loc.isDark,
      connections: Object.entries(loc.exits)
        .filter(([, target]) => target !== null)
        .map(([direction, target]) => ({
          direction: direction.charAt(0).toUpperCase() + direction.slice(1),
          target_location: target as number,
        })),
      editor_x: loc.x,
      editor_y: loc.y,
    })),`,
  `    locations: game.locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      description: loc.description,
      is_dark: loc.isDark,
      connections: Object.entries(loc.exits)
        .filter(([, target]) => target !== null)
        .map(([direction, target]) => ({
          direction: direction.charAt(0).toUpperCase() + direction.slice(1),
          target_location: target as number,
        })),
      editor_x: loc.x,
      editor_y: loc.y,
      image: loc.image ? {
        source_data: loc.image.sourceData,
        y_position: loc.image.yPosition,
        height: loc.image.height,
        platform_images: loc.image.platformImages,
      } : undefined,
    })),`
);

// 3. Update toFrontendGame to include image data
content = content.replace(
  `      return {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        isDark: loc.is_dark,
        exits,
        x: loc.editor_x,
        y: loc.editor_y,
      };`,
  `      return {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        isDark: loc.is_dark,
        exits,
        x: loc.editor_x,
        y: loc.editor_y,
        image: loc.image ? {
          sourceData: loc.image.source_data,
          yPosition: loc.image.y_position,
          height: loc.image.height,
          platformImages: loc.image.platform_images,
        } : undefined,
      };`
);

fs.writeFileSync(apiPath, content);
console.log('Updated API serialization to include image data');
