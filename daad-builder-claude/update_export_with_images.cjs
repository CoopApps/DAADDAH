const fs = require('fs');

const commandsPath = 'D:/projects/daadah/daad-builder-ui/src-tauri/src/commands.rs';
let content = fs.readFileSync(commandsPath, 'utf8');

// Add image_converter import
content = content.replace(
  `use crate::codegen::DaadCodeGenerator;
use crate::game::DaadGame;
use std::path::PathBuf;`,
  `use crate::codegen::DaadCodeGenerator;
use crate::game::DaadGame;
use crate::image_converter::ImageConverter;
use std::path::{Path, PathBuf};`
);

// Replace export_daad_to_file function with enhanced version
content = content.replace(
  `/// Export game to DAAD source code and save to file
#[tauri::command]
pub async fn export_daad_to_file(game: DaadGame, path: String) -> Result<(), CommandError> {
    let code = DaadCodeGenerator::generate(&game);
    std::fs::write(&path, code)?;
    Ok(())
}`,
  `/// Export game to DAAD source code and save to file
#[tauri::command]
pub async fn export_daad_to_file(game: DaadGame, path: String) -> Result<(), CommandError> {
    let code = DaadCodeGenerator::generate(&game);
    std::fs::write(&path, code)?;

    // Export platform-specific images if any locations have images
    let base_path = Path::new(&path);
    let base_dir = base_path.parent().unwrap_or(Path::new("."));
    let base_name = base_path.file_stem().unwrap_or_default().to_string_lossy();

    for loc in &game.locations {
        if let Some(image) = &loc.image {
            // Decode base64 image
            match ImageConverter::decode_base64(&image.source_data) {
                Ok(img) => {
                    // Export for each platform
                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "zx_spectrum",
                        "scr",
                        &ImageConverter::to_zx_spectrum,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "c64",
                        "prg",
                        &ImageConverter::to_c64,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amstrad_cpc",
                        "bin",
                        &ImageConverter::to_amstrad_cpc_mode0,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "msx",
                        "sc2",
                        &ImageConverter::to_msx,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amiga",
                        "iff",
                        &ImageConverter::to_amiga,
                    )?;
                }
                Err(e) => {
                    eprintln!("Failed to decode image for location {}: {}", loc.id, e);
                }
            }
        }
    }

    Ok(())
}

/// Helper function to export platform-specific image
fn export_platform_image<F>(
    img: &image::DynamicImage,
    height: u16,
    loc_id: u8,
    base_dir: &Path,
    base_name: &str,
    platform: &str,
    ext: &str,
    converter: &F,
) -> Result<(), CommandError>
where
    F: Fn(&image::DynamicImage, u16) -> Vec<u8>,
{
    let platform_dir = base_dir.join(platform);
    std::fs::create_dir_all(&platform_dir)?;

    let image_file = platform_dir.join(format!("{}_loc{}.{}", base_name, loc_id, ext));
    let image_data = converter(img, height);
    std::fs::write(&image_file, image_data)?;

    Ok(())
}`
);

fs.writeFileSync(commandsPath, content);
console.log('Updated export to generate platform-specific image files');
