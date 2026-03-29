use crate::codegen::DaadCodeGenerator;
use crate::game::DaadGame;
use crate::image_converter::ImageConverter;
// DRC compiler integration - no longer using internal Rust compiler
use crate::mcp_api::SharedGameState;
use crate::validation;
use std::path::{Path, PathBuf};
use std::process::{Command, Child};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use tauri::{Manager, State};

#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

/// Global MCP server process handle
static MCP_SERVER_PROCESS: Lazy<Mutex<Option<Child>>> = Lazy::new(|| Mutex::new(None));

/// Error type for commands
#[derive(Debug, thiserror::Error)]
pub enum CommandError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("Dialog cancelled")]
    Cancelled,
}

impl serde::Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

/// Find the daadready directory by checking multiple possible locations
fn find_daadready_dir() -> Result<PathBuf, CommandError> {
    // Try multiple possible locations for daadready
    let mut possible_paths = vec![
        PathBuf::from("D:/daadah/daadready"),
        PathBuf::from("D:/projects/daadah/daad-builder-claude/daadready"),
    ];

    // Add current dir if available
    if let Ok(current) = std::env::current_dir() {
        possible_paths.push(current.join("daadready"));
        if let Some(parent) = current.parent() {
            possible_paths.push(parent.join("daadready"));
        }
    }

    for path in possible_paths {
        if path.exists() && path.join("TOOLS").join("DRC").exists() {
            return Ok(path);
        }
    }

    Err(CommandError::Io(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "Could not find daadready directory. Please ensure daadready is located at D:/daadah/daadready or in the project directory."
    )))
}

/// Transform frontend game JSON (with exits) to backend format (with connections)
fn transform_game_json(mut game_json: serde_json::Value) -> Result<DaadGame, CommandError> {
    // Transform exits to connections BEFORE validation
    if let Some(locations) = game_json.get_mut("locations").and_then(|v| v.as_array_mut()) {
        for loc in locations {
            if let Some(exits) = loc.get("exits").and_then(|v| v.as_object()) {
                let mut connections = Vec::new();
                for (direction, target) in exits {
                    if let Some(target_id) = target.as_u64() {
                        connections.push(serde_json::json!({
                            "direction": direction,
                            "targetLocation": target_id
                        }));
                    }
                }
                // Add connections field
                loc["connections"] = serde_json::json!(connections);
                // Remove exits field to avoid duplicate
                if let Some(obj) = loc.as_object_mut() {
                    obj.remove("exits");
                }
            }
        }
    }

    // Validate JSON structure AFTER transformation
    let validation_result = validation::validate_game_json(&game_json);
    if !validation_result.is_valid() {
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            validation_result.to_error_message()
        )));
    }

    // Deserialize the validated and transformed JSON
    Ok(serde_json::from_value(game_json)?)
}

/// Create a new empty game
#[tauri::command]
pub fn new_game(title: String, author: String) -> DaadGame {
    DaadGame::new(&title, &author)
}

/// Get default game
#[tauri::command]
pub fn get_default_game() -> DaadGame {
    DaadGame::default()
}

/// Save game to JSON file
#[tauri::command]
pub async fn save_game(game: serde_json::Value, path: String) -> Result<(), CommandError> {
    let game = transform_game_json(game)?;
    let json = serde_json::to_string_pretty(&game)?;
    std::fs::write(&path, json)?;
    Ok(())
}

/// Load game from JSON file
/// Routes through transform_game_json so that files using the frontend
/// "exits" object format are correctly converted to the backend
/// "connections" array format before deserialisation.
#[tauri::command]
pub async fn load_game(path: String) -> Result<DaadGame, CommandError> {
    let json = std::fs::read_to_string(&path)?;
    let game_json: serde_json::Value = serde_json::from_str(&json)?;
    transform_game_json(game_json)
}

/// Sync game state from frontend to MCP API
/// Call this whenever the game state changes in the UI
#[tauri::command]
pub fn sync_game_to_api(game: serde_json::Value, state: State<SharedGameState>) -> Result<(), CommandError> {
    let game = transform_game_json(game)?;
    let mut game_lock = state.lock();
    *game_lock = Some(game);
    Ok(())
}

/// Export game to DAAD source code (with verbose logging)
#[tauri::command]
pub fn export_daad(game: serde_json::Value) -> Result<serde_json::Value, CommandError> {
    let game = transform_game_json(game)?;
    let (dsf_code, logs) = DaadCodeGenerator::generate_verbose(&game);

    Ok(serde_json::json!({
        "dsf": dsf_code,
        "logs": logs
    }))
}

/// Export game to DAAD source code with verbose logging
#[tauri::command]
pub fn export_daad_verbose(game: serde_json::Value) -> Result<serde_json::Value, CommandError> {
    let game = transform_game_json(game)?;
    let (dsf_code, logs) = DaadCodeGenerator::generate_verbose(&game);

    Ok(serde_json::json!({
        "dsf": dsf_code,
        "logs": logs
    }))
}

/// Validate game data for DRC compilation
fn validate_drc_requirements(game: &DaadGame) -> Result<(), CommandError> {
    // Check locations have consecutive numbering (0, 1, 2, 3...)
    for (expected_id, loc) in game.locations.iter().enumerate() {
        if loc.id as usize != expected_id {
            return Err(CommandError::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!(
                    "Location numbering gap: Expected location {}, found {}. DRC requires consecutive numbering starting from 0.",
                    expected_id, loc.id
                )
            )));
        }
    }

    // Check objects have consecutive numbering (0, 1, 2, 3...)
    for (expected_id, obj) in game.objects.iter().enumerate() {
        if obj.id as usize != expected_id {
            return Err(CommandError::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidData,
                format!(
                    "Object numbering gap: Expected object {}, found {}. DRC requires consecutive numbering starting from 0.",
                    expected_id, obj.id
                )
            )));
        }
    }

    // Check message count (max 255, indexed 0-254)
    if game.messages.len() > 255 {
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!(
                "Too many messages: DRC maximum is 255 (0-254), found {}",
                game.messages.len()
            )
        )));
    }

    // Check vocabulary word length (max 5 characters) — warning only, DRC truncates automatically
    for vocab in &game.vocabulary {
        if vocab.word.len() > 5 {
            // Note: this is a warning, not an error. DRC handles truncation.
            // The warning is surfaced via compilation_logs in compile_game().
        }
    }

    // Check object count limits
    if game.objects.len() > 256 {
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            format!(
                "Too many objects: DRC V2 maximum is 256, found {}. Consider using DRC V3 or reducing object count.",
                game.objects.len()
            )
        )));
    }

    Ok(())
}

/// Export game to DAAD source code and save to file (with verbose logging)
#[tauri::command]
pub async fn export_daad_to_file(game: serde_json::Value, path: String) -> Result<serde_json::Value, CommandError> {
    let game = transform_game_json(game)?;
    // Validate DRC requirements before export
    validate_drc_requirements(&game)?;

    let (code, logs) = DaadCodeGenerator::generate_verbose(&game);

    // Convert to ISO-8859-1 (Latin1) encoding as required by DRC compiler
    // DRC expects ISO-8859-1/Windows-1252, not UTF-8
    let (encoded, _, had_errors) = encoding_rs::WINDOWS_1252.encode(&code);

    if had_errors {
        eprintln!("Warning: Some characters could not be encoded in ISO-8859-1 and were replaced");
    }

    std::fs::write(&path, &*encoded)?;

    // Export platform-specific images if any locations have images
    let base_path = Path::new(&path);
    let base_dir = base_path.parent().unwrap_or(Path::new("."));
    let base_name = base_path.file_stem().unwrap_or_default().to_string_lossy();

    for loc in &game.locations {
        if let Some(image) = &loc.image {
            // Decode base64 image
            match ImageConverter::decode_base64(&image.source_data) {
                Ok(img) => {
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

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "atari_st",
                        "neo",
                        &ImageConverter::to_atari_st,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "msdos",
                        "vga",
                        &ImageConverter::to_msdos_vga,
                    )?;

                    export_platform_image(
                        &img,
                        image.height,
                        loc.id,
                        &base_dir,
                        &base_name,
                        "amstrad_cpc_mode1",
                        "m1",
                        &ImageConverter::to_amstrad_cpc_mode1,
                    )?;
                }
                Err(e) => {
                    eprintln!("Failed to decode image for location {}: {}", loc.id, e);
                }
            }
        }
    }

    Ok(serde_json::json!({
        "success": true,
        "logs": logs,
        "path": path
    }))
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
}

/// Get suggested filename from game title
#[tauri::command]
pub fn get_suggested_filename(title: String, extension: String) -> String {
    let clean_title = title
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == ' ' || *c == '_')
        .collect::<String>()
        .replace(' ', "_")
        .to_lowercase();

    if clean_title.is_empty() {
        format!("untitled.{}", extension)
    } else {
        format!("{}.{}", clean_title, extension)
    }
}

/// Get exports directory path
#[tauri::command]
pub fn get_exports_dir() -> Result<String, CommandError> {
    let dir = PathBuf::from("./exports");
    if !dir.exists() {
        std::fs::create_dir_all(&dir)?;
    }
    Ok(dir.to_string_lossy().to_string())
}

/// Validate game for export
#[tauri::command]
pub fn validate_game(game: serde_json::Value) -> Result<Vec<String>, CommandError> {
    let game = transform_game_json(game)?;
    let mut warnings = Vec::new();

    if game.locations.is_empty() {
        warnings.push("Game has no locations".to_string());
    }

    if game.title.is_empty() {
        warnings.push("Game has no title".to_string());
    }

    // Check for orphaned locations (no connections to/from)
    for loc in &game.locations {
        if loc.connections.is_empty() {
            let has_incoming = game.locations.iter().any(|other| {
                other.connections.iter().any(|conn| conn.target_location == loc.id)
            });
            if !has_incoming && loc.id != 0 {
                warnings.push(format!("Location '{}' has no exits and no entrances", loc.name));
            }
        }
    }

    // Check for objects in non-existent locations
    for obj in &game.objects {
        if let crate::types::ObjectLocation::At { location_id } = &obj.location {
            if game.get_location(*location_id).is_none() {
                warnings.push(format!("Object '{}' is at non-existent location {}", obj.name, location_id));
            }
        }
    }

    Ok(warnings)
}

/// Compile game to platform-specific binary using DRC tools (with verbose logging)
#[tauri::command]
pub async fn compile_game(
    game: serde_json::Value,
    platform_name: String,
    output_path: String,
) -> Result<serde_json::Value, CommandError> {
    let game = transform_game_json(game)?;
    let mut compilation_logs = Vec::new();

    compilation_logs.push("=".repeat(60));
    compilation_logs.push(format!("DAAD Game Compilation: {}", game.title));
    compilation_logs.push(format!("Platform: {}", platform_name));
    compilation_logs.push("=".repeat(60));

    // Map platform names to DRC target/subtarget codes
    // DRF targets: ZX, CPC, C64, CP4, MSX, MSX2, PCW, PC, AMIGA, ST, HTML
    // DRB targets: same list
    let (drc_platform, drc_mode) = match platform_name.as_str() {
        "msdos" => ("pc", "vga"),
        "msdos_vga256" => ("pc", "vga256"),
        "msdos_ega" => ("pc", "ega"),
        "msdos_cga" => ("pc", "cga"),
        "msdos_text" => ("pc", "text"),
        "zx_spectrum_48k" => ("zx", "48k"),
        "zx_spectrum_128k" => ("zx", "128k"),
        "zx_spectrum_plus3" => ("zx", "plus3"),
        "zx_spectrum_esxdos" => ("zx", "esxdos"),
        "zx_spectrum_next" => ("zx", "next"),
        "zx_spectrum_uno" => ("zx", "uno"),
        "c64" => ("c64", ""),
        "amstrad_cpc" => ("cpc", ""),
        "msx" => ("msx", ""),
        "amiga" => ("amiga", ""),
        "atari_st" => ("st", ""),
        "pcw" => ("pcw", ""),
        "plus4" => ("cp4", ""),
        "html" => ("html", ""),
        _ => {
            return Err(CommandError::Io(std::io::Error::new(
                std::io::ErrorKind::InvalidInput,
                format!("Unknown platform: {}. Valid: msdos, zx_spectrum_48k, zx_spectrum_128k, zx_spectrum_plus3, zx_spectrum_esxdos, zx_spectrum_next, zx_spectrum_uno, c64, amstrad_cpc, msx, amiga, atari_st, pcw, plus4, html", platform_name),
            )));
        }
    };

    // Step 1: Generate DSF code with verbose logging
    compilation_logs.push(String::new());
    compilation_logs.push("[Step 1] Generating DSF source code...".to_string());
    let (code, dsf_logs) = DaadCodeGenerator::generate_verbose(&game);
    compilation_logs.extend(dsf_logs);

    // Surface vocabulary truncation warnings
    for vocab in &game.vocabulary {
        if vocab.word.len() > 5 {
            compilation_logs.push(format!("  ⚠ Vocabulary: '{}' will be truncated to '{}' (DAAD 5-char limit)",
                vocab.word, &vocab.word[0..5]));
        }
    }
    compilation_logs.push(String::new());

    // Validate DSF before writing — catch all syntax errors at once
    compilation_logs.push(String::new());
    compilation_logs.push("[Step 1b] Validating DSF syntax...".to_string());
    let dsf_errors = DaadCodeGenerator::validate_dsf(&code);
    if !dsf_errors.is_empty() {
        let mut msg = format!(
            "DSF validation found {} error(s):\n",
            dsf_errors.len()
        );
        for e in &dsf_errors {
            msg.push_str(&format!("  {}\n", e));
            compilation_logs.push(format!("  ✗ {}", e));
        }
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidData,
            msg,
        )));
    }
    compilation_logs.push("  ✓ DSF pre-validation passed (0 errors)".to_string());

    compilation_logs.push("[Step 2] Writing DSF file...".to_string());
    let dsf_path = output_path.replace(".ddb", ".dsf")
        .replace(".tap", ".dsf")
        .replace(".prg", ".dsf")
        .replace(".dsk", ".dsf")
        .replace(".rom", ".dsf")
        .replace(".adf", ".dsf")
        .replace(".st", ".dsf")
        .replace(".exe", ".dsf");

    // Write DSF file - convert to absolute path
    let dsf_path_abs = std::path::Path::new(&dsf_path)
        .canonicalize()
        .unwrap_or_else(|_| {
            // If file doesn't exist yet, make parent canonical and append filename
            let path = std::path::Path::new(&dsf_path);
            if let Some(parent) = path.parent() {
                if let Ok(canonical_parent) = std::fs::canonicalize(parent) {
                    return canonical_parent.join(path.file_name().unwrap_or_default());
                }
            }
            std::path::PathBuf::from(&dsf_path)
        });

    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&code);
    std::fs::write(&dsf_path_abs, &*encoded)?;

    let dsf_path = dsf_path_abs.to_string_lossy().to_string();

    // Export platform-specific images alongside the binary
    let base_path = std::path::Path::new(&output_path);
    let base_dir = base_path.parent().unwrap_or(std::path::Path::new("."));
    let base_name = base_path.file_stem().unwrap_or_default().to_string_lossy();

    // Create platform-specific image directory
    let platform_suffix = match platform_name.as_str() {
        "zx_spectrum_48k" | "zx_spectrum_128k" | "zx_spectrum_plus3"
        | "zx_spectrum_esxdos" | "zx_spectrum_next" | "zx_spectrum_uno" => "zx_spectrum",
        "c64" => "c64",
        "plus4" => "plus4",
        "amstrad_cpc" => "amstrad_cpc",
        "pcw" => "pcw",
        "msx" => "msx",
        "amiga" => "amiga",
        "atari_st" => "atari_st",
        "msdos" | "msdos_vga256" | "msdos_ega" | "msdos_cga" | "msdos_text" => "msdos",
        "html" => "html",
        _ => "generic"
    };

    let images_dir = base_dir.join(format!("{}_images", platform_suffix));
    std::fs::create_dir_all(&images_dir)?;

    // Export images for locations that have them
    let mut image_count_exported = 0;
    for loc in &game.locations {
        if let Some(image) = &loc.image {
            match ImageConverter::decode_base64(&image.source_data) {
                Ok(img) => {
                    // For PCDAAD (msdos): output as PCX files named {locId:03d}.PCX
                    // placed alongside the DDB in the output directory.
                    // PCDAAD loads PICTURE N from file "{N:03d}.PCX".
                    // For other platforms: use platform-specific format in images subdir.
                    let (image_data, filename) = match platform_suffix {
                        "msdos" => {
                            let pcx = ImageConverter::to_pcx(&img, image.height);
                            let name = format!("{:03}.PCX", loc.id);
                            (pcx, name)
                        },
                        "zx_spectrum" => (ImageConverter::to_zx_spectrum(&img, image.height),
                            format!("{}_loc{}.scr", base_name, loc.id)),
                        "c64" => (ImageConverter::to_c64(&img, image.height),
                            format!("{}_loc{}.prg", base_name, loc.id)),
                        "amstrad_cpc" => (ImageConverter::to_amstrad_cpc_mode0(&img, image.height),
                            format!("{}_loc{}.bin", base_name, loc.id)),
                        "msx" => (ImageConverter::to_msx(&img, image.height),
                            format!("{}_loc{}.sc2", base_name, loc.id)),
                        "amiga" => (ImageConverter::to_amiga(&img, image.height),
                            format!("{}_loc{}.iff", base_name, loc.id)),
                        "atari_st" => (ImageConverter::to_atari_st(&img, image.height),
                            format!("{}_loc{}.neo", base_name, loc.id)),
                        _ => continue,
                    };

                    // PCDAAD images go alongside the DDB; others go to images subdir
                    let image_path = if platform_suffix == "msdos" {
                        base_dir.join(&filename)
                    } else {
                        images_dir.join(&filename)
                    };
                    std::fs::write(&image_path, image_data)?;
                    image_count_exported += 1;
                    compilation_logs.push(format!("  Image: {} ({} bytes)", image_path.display(),
                        std::fs::metadata(&image_path).map(|m| m.len()).unwrap_or(0)));
                }
                Err(e) => {
                    compilation_logs.push(format!("  ⚠ Image error for location {}: {}", loc.id, e));
                }
            }
        }
    }

    // Copy font file for PCDAAD
    if platform_suffix == "msdos" {
        let daadready_check = find_daadready_dir();
        if let Ok(ref dr) = daadready_check {
            let font_src = dr.join("ASSETS").join("CHARSET").join("MSDOS.FNT");
            let font_dst = base_dir.join("DAAD.FNT");
            if font_src.exists() && !font_dst.exists() {
                std::fs::copy(&font_src, &font_dst)?;
                compilation_logs.push(format!("  Font: {} copied", font_dst.display()));
            }
        }
    }

    // Compile DSF using DRC tools
    let daadready_path = find_daadready_dir()?;
    let drc_dir = daadready_path.join("TOOLS").join("DRC");
    let drf_exe = drc_dir.join("drf.exe");
    let drb_php = drc_dir.join("drb.php");

    // Step 1: Run DRF (frontend compiler) - DSF → JSON
    let mut drf_args = vec![drc_platform.to_string()];
    if !drc_mode.is_empty() {
        drf_args.push(drc_mode.to_string());
    }
    drf_args.push(dsf_path.clone());

    compilation_logs.push(String::new());
    compilation_logs.push("[Step 3] Running DRF compiler (DSF → JSON)...".to_string());
    compilation_logs.push(format!("  Command: {} {}", drf_exe.display(), drf_args.join(" ")));

    let drf_output = std::process::Command::new(&drf_exe)
        .args(&drf_args)
        .current_dir(&drc_dir)
        .output()
        .map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to execute DRF compiler: {}", e),
        )))?;

    if !drf_output.status.success() {
        let stderr_msg = String::from_utf8_lossy(&drf_output.stderr);
        let stdout_msg = String::from_utf8_lossy(&drf_output.stdout);
        let exit_code = drf_output.status.code().unwrap_or(-1);

        let mut error_details = format!(
            "DRF compilation failed (exit code: {})\n\
             Command: {} {}\n\
             Working directory: {}\n",
            exit_code,
            drf_exe.display(),
            drf_args.join(" "),
            drc_dir.display()
        );

        if !stdout_msg.is_empty() {
            error_details.push_str(&format!("\nStdout:\n{}", stdout_msg));
        }
        if !stderr_msg.is_empty() {
            error_details.push_str(&format!("\nStderr:\n{}", stderr_msg));
        }

        if stdout_msg.is_empty() && stderr_msg.is_empty() {
            error_details.push_str("\n(No error output - the compiler may have crashed silently)");
        }

        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            error_details,
        )));
    }

    compilation_logs.push("  ✓ DRF compilation successful".to_string());

    // Step 4: Run DRB (backend compiler) - JSON → DDB
    compilation_logs.push(String::new());
    compilation_logs.push("[Step 4] Running DRB compiler (JSON → DDB)...".to_string());

    // Strip UNC prefix (\\?\) from paths as PHP can't handle them
    let json_path = dsf_path.replace(".dsf", ".json")
        .replace(r"\\?\", "");
    let ddb_path = output_path.replace(".tap", ".ddb")
        .replace(".prg", ".ddb")
        .replace(".dsk", ".ddb")
        .replace(".exe", ".ddb")
        .replace(r"\\?\", "");

    compilation_logs.push(format!("  JSON path: {}", json_path));
    compilation_logs.push(format!("  DDB path: {}", ddb_path));

    let mut drb_args = vec![
        drb_php.to_string_lossy().to_string(),
        drc_platform.to_string(),
    ];
    if !drc_mode.is_empty() {
        drb_args.push(drc_mode.to_string());
    }
    drb_args.push("EN".to_string()); // Language
    drb_args.push(json_path.clone());
    drb_args.push(ddb_path.clone());

    // Find PHP executable
    let php_exe = daadready_path.join("PHP").join("php.exe");

    let drb_output = std::process::Command::new(&php_exe)
        .args(&drb_args)
        .current_dir(&drc_dir)
        .output()
        .map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to execute DRB compiler: {}", e),
        )))?;

    if !drb_output.status.success() {
        let error_msg = String::from_utf8_lossy(&drb_output.stderr);
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("DRB compilation failed:\n{}", error_msg),
        )));
    }

    compilation_logs.push("  ✓ DRB compilation successful".to_string());

    // Get file size
    let file_size = std::fs::metadata(&ddb_path)
        .map(|m| m.len())
        .unwrap_or(0);

    let image_count = game.locations.iter().filter(|l| l.image.is_some()).count();
    let compile_output = String::from_utf8_lossy(&drf_output.stdout);

    // Add final summary logs
    compilation_logs.push(String::new());
    compilation_logs.push("=".repeat(60));
    compilation_logs.push("✓ Compilation Complete!".to_string());
    compilation_logs.push("=".repeat(60));
    compilation_logs.push(format!("Platform: {} {}", drc_platform, drc_mode));
    compilation_logs.push(format!("Output: {} ({} bytes)", ddb_path, file_size));
    compilation_logs.push(format!("Exported {} location images to {}", image_count, images_dir.display()));
    if !compile_output.is_empty() {
        compilation_logs.push(String::new());
        compilation_logs.push("DRF Compiler Output:".to_string());
        for line in compile_output.lines() {
            compilation_logs.push(format!("  {}", line));
        }
    }

    Ok(serde_json::json!({
        "success": true,
        "logs": compilation_logs,
        "output_path": ddb_path,
        "file_size": file_size,
        "image_count": image_count,
        "images_dir": images_dir.to_string_lossy().to_string()
    }))
}

/// Compile game to HTML using DAAD Ready tools
#[tauri::command]
pub async fn compile_to_html(
    game: serde_json::Value,
    output_dir: String,
) -> Result<String, CommandError> {
    let game = transform_game_json(game)?;

    // Validate DRC requirements
    validate_drc_requirements(&game)?;

    // Setup paths
    let daadready_path = find_daadready_dir()?;
    let output_path = PathBuf::from(&output_dir);
    let game_name = game.title.replace(" ", "_").to_lowercase();

    // Create output directory
    std::fs::create_dir_all(&output_path)?;

    // Step 1: Export to DSF file
    let dsf_path = daadready_path.join(format!("{}.DSF", game_name.to_uppercase()));
    let code = DaadCodeGenerator::generate(&game);
    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&code);
    std::fs::write(&dsf_path, &*encoded)?;

    // Step 2: Compile DSF to JSON using DRF
    let drf_exe = daadready_path.join("TOOLS").join("DRC").join("drf.exe");
    let drf_output = Command::new(&drf_exe)
        .args(&["html", dsf_path.to_str().unwrap()])
        .current_dir(&daadready_path)
        .output()?;

    if !drf_output.status.success() {
        let error_msg = String::from_utf8_lossy(&drf_output.stderr);
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("DRF compilation failed: {}", error_msg)
        )));
    }

    // Step 3: Compile JSON to JDDB using PHP + DRB
    let json_path = daadready_path.join(format!("{}.json", game_name.to_uppercase()));
    let jddb_path = daadready_path.join(format!("{}.JDDB", game_name.to_uppercase()));
    let php_exe = daadready_path.join("PHP").join("PHP.exe");
    let drb_php = daadready_path.join("TOOLS").join("DRC").join("drb.php");

    let drb_output = Command::new(&php_exe)
        .args(&[
            drb_php.to_str().unwrap(),
            "html",
            "EN", // Language
            json_path.to_str().unwrap(),
            jddb_path.to_str().unwrap(),
        ])
        .current_dir(&daadready_path)
        .output()?;

    if !drb_output.status.success() {
        let error_msg = String::from_utf8_lossy(&drb_output.stderr);
        return Err(CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("DRB compilation failed: {}", error_msg)
        )));
    }

    // Step 4: Copy HTML template files
    let html_assets = daadready_path.join("ASSETS").join("HTML");
    let release_html = output_path.join("html");
    std::fs::create_dir_all(&release_html)?;

    copy_dir_all(&html_assets, &release_html)?;

    // Step 5: Copy JDDB to daad.jddb
    std::fs::copy(&jddb_path, release_html.join("daad.jddb"))?;

    // Step 6: Generate font.js
    let font_file = daadready_path.join("ASSETS").join("CHARSET").join("AD8x6.CHR");
    let font_maker = daadready_path.join("TOOLS").join("jDAADFontMaker").join("jDAADFontMaker.php");
    let font_output = release_html.join("font.js");

    Command::new(&php_exe)
        .args(&[
            font_maker.to_str().unwrap(),
            font_file.to_str().unwrap(),
            font_output.to_str().unwrap(),
        ])
        .current_dir(&daadready_path)
        .output()?;

    // Step 7: Process images (if any)
    for loc in &game.locations {
        if let Some(image) = &loc.image {
            match ImageConverter::decode_base64(&image.source_data) {
                Ok(img) => {
                    // Export as PNG for HTML
                    let images_html_dir = daadready_path.join("IMAGES").join("HTML");
                    std::fs::create_dir_all(&images_html_dir)?;

                    let png_path = images_html_dir.join(format!("{:03}.png", loc.id));
                    img.save(&png_path)
                        .map_err(|e| CommandError::Io(std::io::Error::new(
                            std::io::ErrorKind::Other,
                            format!("Failed to save PNG: {}", e)
                        )))?;

                    // Process with jDAADImager
                    let imager = daadready_path.join("TOOLS").join("jDAADImager").join("jDAADImager.php");
                    let images_js = release_html.join("images.js");

                    Command::new(&php_exe)
                        .args(&[
                            imager.to_str().unwrap(),
                            png_path.to_str().unwrap(),
                            images_js.to_str().unwrap(),
                            "0,0"
                        ])
                        .current_dir(&daadready_path)
                        .output()?;
                }
                Err(e) => {
                    eprintln!("Warning: Failed to process image for location {}: {}", loc.id, e);
                }
            }
        }
    }

    // Step 8: Generate multimedia.js (sounds/videos placeholder)
    let multimedia_tool = daadready_path.join("TOOLS").join("jDAADImager").join("jDAADMultimedia.php");
    Command::new(&php_exe)
        .args(&[
            multimedia_tool.to_str().unwrap(),
            release_html.to_str().unwrap(),
            "0,0"
        ])
        .current_dir(&daadready_path)
        .output()?;

    // Step 9: Cleanup temporary files
    let _ = std::fs::remove_file(&dsf_path);
    let _ = std::fs::remove_file(&json_path);
    let _ = std::fs::remove_file(&jddb_path);

    Ok(format!("HTML game compiled successfully to: {}\nOpen index.html in a web browser to play!", release_html.display()))
}

/// Helper function to recursively copy directories
fn copy_dir_all(src: &Path, dst: &Path) -> std::io::Result<()> {
    std::fs::create_dir_all(dst)?;
    for entry in std::fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        let src_path = entry.path();
        let dst_path = dst.join(entry.file_name());

        if ty.is_dir() {
            copy_dir_all(&src_path, &dst_path)?;
        } else {
            std::fs::copy(&src_path, &dst_path)?;
        }
    }
    Ok(())
}

/// Launch AI assistance - starts MCP server and opens Claude Desktop
#[tauri::command]
pub async fn launch_ai_assistance(app_handle: tauri::AppHandle) -> Result<String, CommandError> {
    // Get the app's resource directory to find the MCP server
    let resource_path = app_handle.path().resource_dir()
        .map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            format!("Could not find resource directory: {}", e)
        )))?;

    // Try multiple possible locations for the MCP server
    let mcp_server_paths = vec![
        resource_path.join("mcp-server").join("index.js"),
        resource_path.parent().unwrap_or(&resource_path).join("mcp-server").join("index.js"),
        PathBuf::from("D:/projects/daadah/daad-builder-claude/mcp-server/index.js"),
    ];

    let mcp_server_path = mcp_server_paths.iter()
        .find(|p: &&PathBuf| p.exists())
        .cloned()
        .unwrap_or_else(|| PathBuf::from("D:/projects/daadah/daad-builder-claude/mcp-server/index.js"));

    // Check if MCP server is already running
    {
        let mut process_guard = MCP_SERVER_PROCESS.lock().unwrap();
        if let Some(ref mut child) = *process_guard {
            match child.try_wait() {
                Ok(None) => {
                    // Process is still running, just launch Claude Desktop
                    return launch_claude_desktop();
                }
                Ok(Some(_)) => {
                    // Process has exited, clear it
                    *process_guard = None;
                }
                Err(_) => {
                    *process_guard = None;
                }
            }
        }
    }

    // Start the MCP server
    let node_paths = vec![
        "node",
        "D:/nodejs/node.exe",
        "C:/Program Files/nodejs/node.exe",
        "C:/nodejs/node.exe",
    ];

    let mut node_cmd = None;
    for node_path in &node_paths {
        #[cfg(windows)]
        let check = Command::new(node_path)
            .arg("--version")
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        #[cfg(not(windows))]
        let check = Command::new(node_path)
            .arg("--version")
            .output();

        if check.is_ok() {
            node_cmd = Some(node_path.to_string());
            break;
        }
    }

    let node = node_cmd.ok_or_else(|| CommandError::Io(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "Node.js not found. Please install Node.js and ensure it's in PATH or at D:/nodejs"
    )))?;

    #[cfg(windows)]
    let child = Command::new(&node)
        .arg(&mcp_server_path)
        .env("DAAD_PROJECT_PATH", "D:/projects/daadah/daad-builder-claude/current_project.json")
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to start MCP server: {}", e)
        )))?;

    #[cfg(not(windows))]
    let child = Command::new(&node)
        .arg(&mcp_server_path)
        .env("DAAD_PROJECT_PATH", "D:/projects/daadah/daad-builder-claude/current_project.json")
        .spawn()
        .map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to start MCP server: {}", e)
        )))?;

    // Store the process handle
    {
        let mut process_guard = MCP_SERVER_PROCESS.lock().unwrap();
        *process_guard = Some(child);
    }

    // Give the MCP server a moment to start
    std::thread::sleep(std::time::Duration::from_millis(500));

    // Launch Claude Desktop
    launch_claude_desktop()
}

/// Launch Claude Desktop application
fn launch_claude_desktop() -> Result<String, CommandError> {
    let claude_paths = vec![
        std::env::var("LOCALAPPDATA")
            .map(|p| PathBuf::from(p).join("AnthropicClaude").join("claude.exe"))
            .unwrap_or_default(),
        std::env::var("LOCALAPPDATA")
            .map(|p| PathBuf::from(p).join("Programs").join("Claude").join("Claude.exe"))
            .unwrap_or_default(),
        PathBuf::from("C:/Users")
            .join(std::env::var("USERNAME").unwrap_or_default())
            .join("AppData/Local/AnthropicClaude/claude.exe"),
        PathBuf::from("C:/Users")
            .join(std::env::var("USERNAME").unwrap_or_default())
            .join("AppData/Local/Programs/Claude/Claude.exe"),
        PathBuf::from("C:/Program Files/Claude/Claude.exe"),
        PathBuf::from("C:/Program Files (x86)/Claude/Claude.exe"),
    ];

    for claude_path in &claude_paths {
        if claude_path.exists() {
            Command::new(claude_path)
                .spawn()
                .map_err(|e| CommandError::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Failed to launch Claude Desktop: {}", e)
                )))?;

            return Ok("AI assistance activated! Claude Desktop is starting...".to_string());
        }
    }

    Err(CommandError::Io(std::io::Error::new(
        std::io::ErrorKind::NotFound,
        "Claude Desktop not found. Please install it from https://claude.ai/download"
    )))
}

/// Stop AI assistance - terminates MCP server
#[tauri::command]
pub fn stop_ai_assistance() -> Result<String, CommandError> {
    let mut process_guard = MCP_SERVER_PROCESS.lock().unwrap();

    if let Some(ref mut child) = *process_guard {
        child.kill().map_err(|e| CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to stop MCP server: {}", e)
        )))?;
        *process_guard = None;
        Ok("AI assistance stopped".to_string())
    } else {
        Ok("AI assistance was not running".to_string())
    }
}

/// Check if AI assistance is active
#[tauri::command]
pub fn check_ai_status() -> bool {
    let process_guard = MCP_SERVER_PROCESS.lock().unwrap();

    if let Some(ref child) = *process_guard {
        #[cfg(windows)]
        let result = std::process::Command::new("tasklist")
            .args(["/FI", &format!("PID eq {}", child.id())])
            .creation_flags(CREATE_NO_WINDOW)
            .output();

        #[cfg(not(windows))]
        let result = std::process::Command::new("tasklist")
            .args(["/FI", &format!("PID eq {}", child.id())])
            .output();

        match result {
            Ok(output) => {
                let output_str = String::from_utf8_lossy(&output.stdout);
                output_str.contains(&child.id().to_string())
            }
            Err(_) => false,
        }
    } else {
        false
    }
}