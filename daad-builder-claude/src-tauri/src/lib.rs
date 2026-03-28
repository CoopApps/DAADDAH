#![recursion_limit = "256"]

pub mod types;
pub mod game;
pub mod codegen;
pub mod commands;
pub mod image_converter;
pub mod compiler;
pub mod mcp_api;
pub mod validation;

use commands::*;
use parking_lot::Mutex;
use std::sync::Arc;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Create shared game state for MCP API
    let game_state: mcp_api::SharedGameState = Arc::new(Mutex::new(None));
    let game_state_for_api = game_state.clone();
    let game_state_managed = game_state.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        // Make game state available to Tauri commands
        .manage(game_state_managed)
        .setup(move |app| {
            let app_handle = app.handle().clone();

            // Start HTTP API server in background
            tauri::async_runtime::spawn(async move {
                if let Err(e) = mcp_api::start_api_server(game_state_for_api, app_handle).await {
                    eprintln!("MCP API server error: {}", e);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            new_game,
            get_default_game,
            save_game,
            load_game,
            export_daad,
            export_daad_verbose,
            export_daad_to_file,
            get_suggested_filename,
            get_exports_dir,
            validate_game,
            compile_game,
            compile_to_html,
            launch_ai_assistance,
            stop_ai_assistance,
            check_ai_status,
            sync_game_to_api,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
