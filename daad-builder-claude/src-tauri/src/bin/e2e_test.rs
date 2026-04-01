/// End-to-end compilation test
/// Loads a game JSON → generates DSF → runs DRF → runs DRB → produces DDB

use std::path::{Path, PathBuf};
use std::process::Command;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let json_path = args.get(1).map(|s| s.as_str()).unwrap_or("CARRADOS_FINAL_WORKING.json");

    println!("=== DAAD End-to-End Compile Test ===");
    println!("Input: {}", json_path);

    // Step 1: Load and parse JSON
    println!("\n[1] Loading game JSON...");
    // Try UTF-8 first, fall back to Windows-1252 decoding
    let json_str = match std::fs::read_to_string(json_path) {
        Ok(s) => s,
        Err(_) => {
            let bytes = std::fs::read(json_path).expect("Failed to read game JSON");
            let (decoded, _, _) = encoding_rs::WINDOWS_1252.decode(&bytes);
            decoded.into_owned()
        }
    };

    let mut game_json: serde_json::Value = serde_json::from_str(&json_str)
        .expect("Failed to parse JSON");

    // Transform exits → connections AND fix snake_case fields
    if let Some(locations) = game_json.get_mut("locations").and_then(|v| v.as_array_mut()) {
        for loc in locations {
            // Fix snake_case fields in existing connections
            if let Some(conns) = loc.get_mut("connections").and_then(|v| v.as_array_mut()) {
                for conn in conns.iter_mut() {
                    if let Some(obj) = conn.as_object_mut() {
                        if let Some(val) = obj.remove("target_location") {
                            obj.insert("targetLocation".to_string(), val);
                        }
                    }
                }
            }
            // Transform exits → connections if exits field present
            if let Some(exits) = loc.get("exits").and_then(|v| v.as_object()).cloned() {
                let mut connections = Vec::new();
                for (direction, target) in &exits {
                    if let Some(target_id) = target.as_u64() {
                        connections.push(serde_json::json!({
                            "direction": direction,
                            "targetLocation": target_id
                        }));
                    }
                }
                let obj = loc.as_object_mut().unwrap();
                obj.remove("exits");
                if !obj.contains_key("connections") {
                    obj.insert("connections".to_string(), serde_json::json!(connections));
                }
            }
            // Fix snake_case location fields
            if let Some(obj) = loc.as_object_mut() {
                if let Some(v) = obj.remove("is_dark") { obj.insert("isDark".to_string(), v); }
                if let Some(v) = obj.remove("editor_x") { obj.insert("editorX".to_string(), v); }
                if let Some(v) = obj.remove("editor_y") { obj.insert("editorY".to_string(), v); }
            }
        }
    }

    // Fix snake_case → camelCase for flags (older JSONs use snake_case)
    if let Some(flags) = game_json.get_mut("flags").and_then(|v| v.as_array_mut()) {
        for flag in flags {
            if let Some(obj) = flag.as_object_mut() {
                if let Some(val) = obj.remove("initial_value") {
                    obj.insert("initialValue".to_string(), val);
                }
            }
        }
    }

    let game: daad_builder_lib::game::DaadGame = serde_json::from_value(game_json.clone())
        .unwrap_or_else(|e| {
            eprintln!("  Deserialization error: {}", e);
            // Print first problematic location for debugging
            if let Some(locs) = game_json.get("locations").and_then(|v| v.as_array()) {
                if let Some(first) = locs.first() {
                    eprintln!("  First location: {}", serde_json::to_string_pretty(first).unwrap_or_default());
                }
            }
            std::process::exit(1);
        });

    println!("  Title: {}", game.title);
    println!("  Locations: {}", game.locations.len());
    println!("  Objects: {}", game.objects.len());
    println!("  Rules: {}", game.rules.len());
    println!("  Messages: {}", game.messages.len());
    println!("  Vocabulary: {}", game.vocabulary.len());

    // Step 2: Generate DSF
    println!("\n[2] Generating DSF...");
    let (dsf_code, logs) = daad_builder_lib::codegen::DaadCodeGenerator::generate_verbose(&game);

    // Print validation warnings and notes from codegen logs
    let validation_lines: Vec<&String> = logs.iter()
        .filter(|l| l.contains("⚠") || l.contains("ℹ") || l.contains("[VALIDATION]") || l.contains("warning") || l.contains("parameter"))
        .collect();
    if !validation_lines.is_empty() {
        for line in &validation_lines {
            println!("  {}", line);
        }
    } else {
        // Print last few log lines as fallback
        for line in logs.iter().rev().take(5).collect::<Vec<_>>().iter().rev() {
            println!("  {}", line);
        }
    }

    let dsf_lines = dsf_code.lines().count();
    println!("  DSF: {} lines generated", dsf_lines);

    // Step 3: Validate DSF
    println!("\n[3] Validating DSF...");
    let errors = daad_builder_lib::codegen::DaadCodeGenerator::validate_dsf(&dsf_code);
    if !errors.is_empty() {
        println!("  ERRORS:");
        for e in &errors {
            println!("    {}", e);
        }
        std::process::exit(1);
    }
    println!("  0 validation errors");

    // Step 4: Write DSF file (use _build/ subdir to avoid DRF overwriting source JSON)
    let build_dir = Path::new("_build");
    std::fs::create_dir_all(build_dir).expect("Failed to create _build directory");
    let stem = Path::new(json_path).file_stem().unwrap_or_default();
    let dsf_path = build_dir.join(format!("{}.dsf", stem.to_string_lossy()));
    println!("\n[4] Writing DSF to {}...", dsf_path.display());

    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&dsf_code);
    std::fs::write(&dsf_path, &*encoded).expect("Failed to write DSF file");
    println!("  Written ({} bytes)", encoded.len());

    // Step 5: Find DRC tools
    println!("\n[5] Looking for DRC tools...");
    let daadready = std::fs::canonicalize(find_daadready()).expect("Failed to canonicalize daadready");
    let drc_dir = daadready.join("TOOLS").join("DRC");
    let drf_exe = drc_dir.join("drf.exe");
    let php_exe = daadready.join("PHP").join("php.exe");
    let drb_php = drc_dir.join("drb.php");

    if !drf_exe.exists() {
        println!("  ERROR: drf.exe not found at {}", drf_exe.display());
        std::process::exit(1);
    }
    println!("  DRF: {}", drf_exe.display());
    println!("  DRB: {}", drb_php.display());

    // Step 6: Run DRF (DSF → JSON)
    let dsf_abs = std::fs::canonicalize(&dsf_path).unwrap_or(dsf_path.clone());
    println!("\n[6] Running DRF (DSF → intermediate JSON)...");
    println!("  {} pc vga {}", drf_exe.display(), dsf_abs.display());

    let drf_output = Command::new(&drf_exe)
        .args(&["pc", "vga", &dsf_abs.to_string_lossy()])
        .current_dir(&drc_dir)
        .output()
        .expect("Failed to run drf.exe");

    let stdout = String::from_utf8_lossy(&drf_output.stdout);
    let stderr = String::from_utf8_lossy(&drf_output.stderr);

    if !stdout.is_empty() {
        for line in stdout.lines().take(20) {
            println!("  [DRF] {}", line);
        }
    }
    if !stderr.is_empty() {
        for line in stderr.lines().take(20) {
            println!("  [DRF ERR] {}", line);
        }
    }

    if !drf_output.status.success() {
        println!("  FAILED (exit code: {:?})", drf_output.status.code());
        // Write DSF for inspection
        println!("\n  DSF first 50 lines:");
        for (i, line) in dsf_code.lines().take(50).enumerate() {
            println!("  {:4}: {}", i+1, line);
        }
        std::process::exit(1);
    }
    println!("  DRF: OK");

    // Step 7: Run DRB (JSON → DDB)
    let json_intermediate = dsf_abs.with_extension("json");
    let ddb_path = dsf_abs.with_extension("ddb");

    // Strip UNC prefix for PHP
    let json_str_path = json_intermediate.to_string_lossy().replace(r"\\?\", "");
    let ddb_str_path = ddb_path.to_string_lossy().replace(r"\\?\", "");

    println!("\n[7] Running DRB (JSON → DDB)...");
    println!("  {} {} pc vga EN {} {}", php_exe.display(), drb_php.display(), json_str_path, ddb_str_path);

    let drb_abs = drb_php.to_string_lossy().replace(r"\\?\", "");
    let php_abs = php_exe.to_string_lossy().replace(r"\\?\", "");
    let drb_output = Command::new(&*php_abs)
        .args(&[&*drb_abs, "pc", "vga", "EN", &json_str_path, &ddb_str_path])
        .current_dir(&drc_dir)
        .output()
        .expect("Failed to run drb.php");

    let stdout = String::from_utf8_lossy(&drb_output.stdout);
    let stderr = String::from_utf8_lossy(&drb_output.stderr);

    if !stdout.is_empty() {
        for line in stdout.lines().take(10) {
            println!("  [DRB] {}", line);
        }
    }
    if !stderr.is_empty() {
        for line in stderr.lines().take(10) {
            println!("  [DRB ERR] {}", line);
        }
    }

    if !drb_output.status.success() {
        println!("  FAILED (exit code: {:?})", drb_output.status.code());
        std::process::exit(1);
    }

    // Step 8: Verify DDB
    if ddb_path.exists() {
        let meta = std::fs::metadata(&ddb_path).unwrap();
        println!("\n[8] SUCCESS!");
        println!("  DDB: {} ({} bytes)", ddb_path.display(), meta.len());

        // Quick sanity check: read first few bytes
        let ddb_data = std::fs::read(&ddb_path).unwrap();
        if ddb_data.len() > 4 {
            println!("  Header: {:02X} {:02X} {:02X} {:02X}", ddb_data[0], ddb_data[1], ddb_data[2], ddb_data[3]);
        }
    } else {
        println!("\n[8] FAILED: DDB file not created at {}", ddb_path.display());
        std::process::exit(1);
    }

    println!("\n=== Test Complete ===");
}

fn find_daadready() -> PathBuf {
    // Try relative paths from common locations
    let candidates = [
        PathBuf::from("daadready"),
        PathBuf::from("../daadready"),
        PathBuf::from("../../daadready"),
        PathBuf::from("D:/projects/daadah/daad-builder-claude/daadready"),
    ];

    for p in &candidates {
        if p.join("TOOLS").join("DRC").join("drf.exe").exists() {
            return p.clone();
        }
    }

    panic!("Could not find daadready directory with DRC tools");
}
