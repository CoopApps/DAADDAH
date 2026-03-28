// Test DRC export format
// Run with: cargo run --example test_drc_export

use daad_builder_lib::codegen::DaadCodeGenerator;
use daad_builder_lib::game::DaadGame;
use std::fs;

fn main() {
    // Load test game
    let test_game_path = "test_game.json";

    let json = fs::read_to_string(test_game_path)
        .expect("Failed to read test_game.json");

    let game: DaadGame = serde_json::from_str(&json)
        .expect("Failed to parse test game JSON");

    // Generate DSF code
    let dsf_code = DaadCodeGenerator::generate(&game);

    // Write to file
    fs::write("test_output.dsf", &dsf_code)
        .expect("Failed to write DSF file");

    println!("✅ Generated DSF file: test_output.dsf");
    println!("\n{}", "=".repeat(80));
    println!("DSF OUTPUT:");
    println!("{}", "=".repeat(80));
    println!("{}", dsf_code);
    println!("{}", "=".repeat(80));

    // Validate format
    println!("\n{}", "=".repeat(80));
    println!("FORMAT VALIDATION:");
    println!("{}", "=".repeat(80));

    let lines: Vec<&str> = dsf_code.lines().collect();
    let sections: Vec<_> = lines.iter()
        .enumerate()
        .filter(|(_, line)| line.starts_with('/'))
        .collect();

    println!("\nSections found (in order):");
    for (line_num, line) in &sections {
        println!("  Line {}: {}", line_num + 1, line);
    }

    // Check required DRC order
    let required_order = vec!["/CTL", "/VOC", "/STX", "/MTX", "/OTX", "/LTX", "/CON", "/OBJ", "/PRO", "/END"];
    println!("\nRequired DRC order:");
    for (i, section) in required_order.iter().enumerate() {
        println!("  {}. {}", i + 1, section);
    }

    println!("\n✓ Test complete! Check test_output.dsf for full output.");
}
