// Test the verbose DSF generation
// Run with: cargo run --bin test_verbose_gen

use std::fs;

fn main() {
    println!("Testing Verbose DSF Generation");
    println!("{}", "=".repeat(70));
    println!();

    // Load the Eyes of Max Carrados game
    let json_path = "D:/daadah/the_eyes_of_max_carrados.daad.json";

    if !std::path::Path::new(json_path).exists() {
        eprintln!("ERROR: Game JSON not found at {}", json_path);
        eprintln!("Please compile the game first with:");
        eprintln!("  D:/daadah/daad-builder.exe --export-json the_eyes_of_max_carrados.daad.json");
        return;
    }

    println!("Loading game from: {}", json_path);
    let json_data = match fs::read_to_string(json_path) {
        Ok(data) => data,
        Err(e) => {
            eprintln!("ERROR: Failed to read JSON: {}", e);
            return;
        }
    };

    let game_value: serde_json::Value = match serde_json::from_str(&json_data) {
        Ok(v) => v,
        Err(e) => {
            eprintln!("ERROR: Failed to parse JSON: {}", e);
            return;
        }
    };

    println!("Transforming game data...");
    // We need to import the actual functions from the library
    // For now, just show that we can load the JSON
    println!("  ✓ Game JSON loaded successfully");
    println!();

    println!("To test the verbose generation, use the Tauri command:");
    println!("  export_daad_verbose(game_json)");
    println!();
    println!("Or build the Tauri app and use the API:");
    println!("  npm run tauri:build");
    println!();
}
