use std::fs;
use daad_builder_lib::game::DaadGame;
use daad_builder_lib::codegen::DaadCodeGenerator;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: gen_dsf <input.json> <output.dsf>");
        std::process::exit(1);
    }
    let json_str = fs::read_to_string(&args[1]).expect("Failed to read JSON");
    let game: DaadGame = serde_json::from_str(&json_str).expect("Failed to parse JSON");
    let dsf = DaadCodeGenerator::generate(&game);
    // Encode as Windows-1252
    let (encoded, _, _) = encoding_rs::WINDOWS_1252.encode(&dsf);
    fs::write(&args[2], &*encoded).expect("Failed to write DSF");
    eprintln!("Generated {} bytes DSF from {} rules, {} locations, {} objects",
        encoded.len(), game.rules.len(), game.locations.len(), game.objects.len());
}
