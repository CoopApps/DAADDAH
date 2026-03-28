const fs = require('fs');

// Read the current commands.rs
let content = fs.readFileSync('src-tauri/src/commands.rs', 'utf8');

// Add compiler import
content = content.replace(
  'use crate::image_converter::ImageConverter;',
  `use crate::image_converter::ImageConverter;
use crate::compiler::{self, Platform};`
);

// Add compile command at the end before the last closing brace
const compileCommand = `
/// Compile game to platform-specific binary using native Rust compiler
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

    // First export to DSF file
    let code = DaadCodeGenerator::generate(&game);
    let dsf_path = output_path.replace(".tap", ".dsf")
        .replace(".prg", ".dsf")
        .replace(".dsk", ".dsf");

    // Write DSF file
    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&code);
    std::fs::write(&dsf_path, &*encoded)?;

    // Compile DSF to platform binary
    match compiler::compile_dsf_to_binary(&dsf_path, platform, &output_path) {
        Ok(result) => Ok(format!("Compiled successfully to {} ({} bytes)", result.output_path, result.size)),
        Err(e) => Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Compilation failed: {}", e),
        ))),
    }
}
`;

content = content + compileCommand;

fs.writeFileSync('src-tauri/src/commands.rs', content, 'utf8');
console.log('✓ Added compile_game command');
