const fs = require('fs');

// Update compile_game command to handle graphics
let commandsContent = fs.readFileSync('src-tauri/src/commands.rs', 'utf8');

// Replace the compile_game function
commandsContent = commandsContent.replace(
  /\/\/\/ Compile game to platform-specific binary using native Rust compiler[\s\S]*?^}\s*$/m,
  `/// Compile game to platform-specific binary using native Rust compiler
#[tauri::command]
pub async fn compile_game(
    game: DaadGame,
    platform_name: String,
    output_path: String,
) -> Result<String, CommandError> {
    // Convert platform name to Platform enum
    let platform = match platform_name.as_str() {
        "zx_spectrum_48k" => Platform::ZXSpectrum48K,
        "zx_spectrum_128k" => Platform::ZXSpectrum128K,
        "c64" => Platform::C64,
        "amstrad_cpc" => Platform::AmstradCPC,
        "msx" => Platform::MSX,
        "amiga" => Platform::Amiga,
        "atari_st" => Platform::AtariST,
        "msdos" => Platform::MSDOS,
        "pcw" => Platform::PCW,
        "plus4" => Platform::Plus4,
        _ => {
            return Err(CommandError::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                format!("Unknown platform: {}", platform_name),
            )));
        }
    };

    // Export to DSF file
    let code = DaadCodeGenerator::generate(&game);
    let dsf_path = output_path.replace(".tap", ".dsf")
        .replace(".prg", ".dsf")
        .replace(".dsk", ".dsf")
        .replace(".rom", ".dsf")
        .replace(".adf", ".dsf")
        .replace(".st", ".dsf")
        .replace(".exe", ".dsf");

    // Write DSF file
    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&code);
    std::fs::write(&dsf_path, &*encoded)?;

    // Export platform-specific images alongside the binary
    let base_path = std::path::Path::new(&output_path);
    let base_dir = base_path.parent().unwrap_or(std::path::Path::new("."));
    let base_name = base_path.file_stem().unwrap_or_default().to_string_lossy();
    
    // Create platform-specific image directory
    let platform_suffix = match platform_name.as_str() {
        "zx_spectrum_48k" | "zx_spectrum_128k" => "zx_spectrum",
        "c64" => "c64",
        "amstrad_cpc" => "amstrad_cpc",
        "msx" => "msx",
        "amiga" => "amiga",
        "atari_st" => "atari_st",
        "msdos" => "msdos",
        _ => "generic"
    };
    
    let images_dir = base_dir.join(format!("{}_images", platform_suffix));
    std::fs::create_dir_all(&images_dir)?;
    
    // Export images for locations that have them
    for loc in &game.locations {
        if let Some(image) = &loc.image {
            match ImageConverter::decode_base64(&image.source_data) {
                Ok(img) => {
                    let (image_data, ext) = match platform_suffix {
                        "zx_spectrum" => (ImageConverter::to_zx_spectrum(&img, image.height), "scr"),
                        "c64" => (ImageConverter::to_c64(&img, image.height), "prg"),
                        "amstrad_cpc" => (ImageConverter::to_amstrad_cpc_mode0(&img, image.height), "bin"),
                        "msx" => (ImageConverter::to_msx(&img, image.height), "sc2"),
                        "amiga" => (ImageConverter::to_amiga(&img, image.height), "iff"),
                        "atari_st" => (ImageConverter::to_atari_st(&img, image.height), "neo"),
                        "msdos" => (ImageConverter::to_msdos_vga(&img, image.height), "vga"),
                        _ => continue,
                    };
                    
                    let image_file = images_dir.join(format!("{}_loc{}.{}", base_name, loc.id, ext));
                    std::fs::write(&image_file, image_data)?;
                }
                Err(e) => {
                    eprintln!("Warning: Failed to decode image for location {}: {}", loc.id, e);
                }
            }
        }
    }

    // Compile DSF to platform binary
    match compiler::compile_dsf_to_binary(&dsf_path, platform, &output_path) {
        Ok(result) => {
            let image_count = game.locations.iter().filter(|l| l.image.is_some()).count();
            Ok(format!(
                "Compiled successfully to {} ({} bytes)\nExported {} location images to {}",
                result.output_path, result.size, image_count, images_dir.display()
            ))
        },
        Err(e) => Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Compilation failed: {}", e),
        ))),
    }
}`
);

fs.writeFileSync('src-tauri/src/commands.rs', commandsContent, 'utf8');
console.log('✓ Updated compile_game with graphics support');
