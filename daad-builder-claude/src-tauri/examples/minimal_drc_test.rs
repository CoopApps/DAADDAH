// Minimal DRC export test - construct game directly in Rust
// Run with: cargo run --example minimal_drc_test

use daad_builder_lib::codegen::DaadCodeGenerator;
use daad_builder_lib::game::DaadGame;
use std::fs;

fn main() {
    println!("✅ Generating minimal DRC-compliant DSF file...\n");

    // Use the default game template
    let game = DaadGame::default();

    // Generate DSF code
    let dsf_code = DaadCodeGenerator::generate(&game);

    // Write to file
    fs::write("minimal_test.dsf", &dsf_code)
        .expect("Failed to write DSF file");

    println!("{}", "=".repeat(80));
    println!("MINIMAL DSF OUTPUT:");
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
        let section_name = line.split_whitespace().next().unwrap_or(line);
        println!("  Line {:3}: {}", line_num + 1, section_name);
    }

    // Check required DRC order
    let required_order = vec!["/CTL", "/VOC", "/STX", "/MTX", "/OTX", "/LTX", "/CON", "/OBJ", "/PRO", "/END"];
    println!("\n{}", "-".repeat(80));
    println!("Required DRC section order:");
    for (i, section) in required_order.iter().enumerate() {
        println!("  {}. {}", i + 1, section);
    }

    // Extract actual section order
    let actual_sections: Vec<String> = sections.iter()
        .map(|(_, line)| {
            line.split_whitespace()
                .next()
                .unwrap_or(line)
                .to_string()
        })
        .collect();

    println!("\n{}", "-".repeat(80));
    println!("Actual section order:");
    for (i, section) in actual_sections.iter().enumerate() {
        // Check if this matches the required order
        if i < required_order.len() {
            let expected = required_order[i];
            if section == expected {
                println!("  {}. {} ✓", i + 1, section);
            } else {
                println!("  {}. {} ✗ (expected {})", i + 1, section, expected);
            }
        } else {
            println!("  {}. {} (extra)", i + 1, section);
        }
    }

    println!("\n{}", "=".repeat(80));
    println!("✓ Test complete! Output saved to: minimal_test.dsf");
    println!("{}", "=".repeat(80));
}
