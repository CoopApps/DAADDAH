const fs = require('fs');

const typesPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/types.rs';
let content = fs.readFileSync(typesPath, 'utf8');

// Add image-related structures after Location struct
const imageStructs = `
/// Image data for a location
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LocationImage {
    /// Base64-encoded source image data
    pub source_data: String,
    /// Y position offset in pixels
    pub y_position: u16,
    /// Height in pixels
    pub height: u16,
    /// Platform-specific converted images
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform_images: Option<std::collections::HashMap<String, PlatformImage>>,
}

/// Platform-specific image format
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlatformImage {
    /// Base64-encoded image data in platform format
    pub image_data: String,
    /// Platform-specific color mode
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color_mode: Option<String>,
    /// Palette indices if applicable
    #[serde(skip_serializing_if = "Option::is_none")]
    pub palette_indices: Option<Vec<u8>>,
}
`;

// Insert after Location struct definition
content = content.replace(
  `/// Location with visual editor metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,
    /// Visual editor X position
    pub editor_x: f32,
    /// Visual editor Y position
    pub editor_y: f32,
}`,
  `/// Location with visual editor metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,
    /// Visual editor X position
    pub editor_x: f32,
    /// Visual editor Y position
    pub editor_y: f32,
    /// Optional image for this location
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<LocationImage>,
}
${imageStructs}`
);

fs.writeFileSync(typesPath, content);
console.log('Added image structures to Rust backend types');
