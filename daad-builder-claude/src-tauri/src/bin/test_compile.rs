use daad_builder::compiler::codegen::generate_dsf_from_json;
use std::fs;

fn main() {
    // Read the test JSON file
    let json_path = "D:/daadah/test_game.json";
    let json_content = fs::read_to_string(json_path)
        .expect("Failed to read JSON file");

    // Generate DSF
    match generate_dsf_from_json(&json_content) {
        Ok(dsf) => {
            // Write to output file
            let output_path = "D:/daadah/test_output.dsf";
            fs::write(output_path, &dsf).expect("Failed to write DSF file");
            println!("SUCCESS! Generated DSF to: {}", output_path);
            println!("\nFirst 50 lines:");
            for (i, line) in dsf.lines().take(50).enumerate() {
                println!("{}: {}", i+1, line);
            }
        }
        Err(e) => {
            eprintln!("ERROR: {}", e);
            std::process::exit(1);
        }
    }
}
