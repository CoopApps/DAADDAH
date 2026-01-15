// DAAD Standalone Game Player
// Loads and plays DAAD games exported as JSON from the DAAD Builder

use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::io::{self, Write};

mod types;
mod interpreter;

use types::*;
use interpreter::GameRuntime;

fn main() {
    println!("╔═══════════════════════════════════════════╗");
    println!("║   DAAD Game Player - Standalone Runtime  ║");
    println!("╚═══════════════════════════════════════════╝");
    println!();

    // Get game file from command line args
    let args: Vec<String> = env::args().collect();

    let game_file = if args.len() > 1 {
        args[1].clone()
    } else {
        println!("Usage: daad-player <game.json>");
        println!();
        println!("Drag and drop a .json game file onto this executable,");
        println!("or run from command line: daad-player mygame.json");
        println!();
        println!("Press Enter to exit...");
        let mut buffer = String::new();
        io::stdin().read_line(&mut buffer).ok();
        return;
    };

    // Load game
    println!("Loading game: {}", game_file);
    let json_content = match fs::read_to_string(&game_file) {
        Ok(content) => content,
        Err(e) => {
            eprintln!("❌ Error reading file: {}", e);
            println!("\nPress Enter to exit...");
            let mut buffer = String::new();
            io::stdin().read_line(&mut buffer).ok();
            return;
        }
    };

    let game: DaadGame = match serde_json::from_str(&json_content) {
        Ok(game) => game,
        Err(e) => {
            eprintln!("❌ Error parsing JSON: {}", e);
            println!("\nPress Enter to exit...");
            let mut buffer = String::new();
            io::stdin().read_line(&mut buffer).ok();
            return;
        }
    };

    println!("✅ Game loaded successfully!");
    println!();

    // Start game runtime
    let mut runtime = GameRuntime::new(&game);

    // Display initial game state
    runtime.display_output();

    // Main game loop
    loop {
        print!("\n> ");
        io::stdout().flush().unwrap();

        let mut input = String::new();
        match io::stdin().read_line(&mut input) {
            Ok(_) => {
                let command = input.trim();

                if command.is_empty() {
                    continue;
                }

                if command.eq_ignore_ascii_case("quit") || command.eq_ignore_ascii_case("exit") {
                    println!("\nThanks for playing!");
                    break;
                }

                runtime.execute_command(command, &game);
                runtime.display_output();
            }
            Err(e) => {
                eprintln!("Error reading input: {}", e);
                break;
            }
        }
    }
}
