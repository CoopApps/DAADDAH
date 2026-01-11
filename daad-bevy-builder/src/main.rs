use bevy::prelude::*;

mod builder;
mod daad;
mod viewer;
mod preview;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "DAAD Bevy Builder - Visual Adventure Creator".to_string(),
                resolution: (1600.0, 900.0).into(),
                ..default()
            }),
            ..default()
        }))
        .init_resource::<builder::state::BuilderState>()
        .add_systems(Startup, setup)
        .add_systems(Update, (
            builder::ui::main_menu::render_menu,
            builder::ui::toolbar::render_toolbar,
            builder::ui::panels::render_active_panel,
            builder::ui::toolbar::handle_toolbar_clicks,
            viewer::code_display::render_code_viewer,
            handle_keyboard_shortcuts,
        ))
        .add_systems(Update, (
            // Location editor systems
            builder::editors::location_editor::render_location_editor,
            builder::editors::location_editor::handle_location_node_clicks,
            builder::editors::location_editor::handle_add_location_button,
            builder::editors::location_editor::handle_location_drag,
            builder::editors::location_editor::handle_connection_creation,
            builder::editors::location_editor::render_connection_preview,
        ))
        .add_systems(Update, (
            // Object editor systems
            builder::editors::object_editor::render_object_sidebar,
            builder::editors::object_editor::handle_object_card_clicks,
            builder::editors::object_editor::handle_add_object_button,
            // Rule editor systems
            builder::editors::rule_editor::render_rule_sidebar,
            builder::editors::rule_editor::render_rule_detail_editor,
            builder::editors::rule_editor::handle_rule_card_clicks,
            builder::editors::rule_editor::handle_add_rule_button,
            builder::editors::rule_editor::handle_add_condition_button,
            builder::editors::rule_editor::handle_add_action_button,
        ))
        .add_systems(Update, (
            // Flags and messages editor systems
            builder::editors::property_forms::render_flags_editor,
            builder::editors::property_forms::render_messages_editor,
            builder::editors::property_forms::handle_flag_card_clicks,
            builder::editors::property_forms::handle_message_card_clicks,
            builder::editors::property_forms::handle_add_flag_button,
            builder::editors::property_forms::handle_add_message_button,
        ))
        .add_systems(Update, (
            // Preview/playtest systems
            preview::preview_ui::render_preview_panel,
            preview::preview_ui::handle_start_game_button,
            preview::preview_ui::handle_preview_command_buttons,
            preview::preview_ui::handle_reset_game_button,
        ))
        .add_systems(Update, (
            // Export systems
            builder::ui::export_ui::render_export_panel,
            builder::ui::export_ui::handle_save_json_button,
            builder::ui::export_ui::handle_export_daad_button,
            builder::ui::export_ui::handle_preview_daad_button,
        ))
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
}

fn handle_keyboard_shortcuts(
    keys: Res<Input<KeyCode>>,
    mut state: ResMut<builder::state::BuilderState>,
) {
    // F1 = Toggle code viewer
    if keys.just_pressed(KeyCode::F1) {
        state.show_code_viewer = !state.show_code_viewer;
        info!("Code viewer: {}", state.show_code_viewer);
    }

    // F5 = Toggle preview
    if keys.just_pressed(KeyCode::F5) {
        state.show_preview = !state.show_preview;
        info!("Preview mode: {}", state.show_preview);
    }

    // Ctrl+S = Save project to JSON
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::S) {
        // Create exports directory if it doesn't exist
        let _ = std::fs::create_dir_all("./exports");

        // Generate filename from game title
        let filename = state.current_game.title.replace(' ', "_").to_lowercase();
        let filepath = format!("./exports/{}.json", filename);

        // Serialize and save
        match serde_json::to_string_pretty(&state.current_game) {
            Ok(json) => {
                match std::fs::write(&filepath, json) {
                    Ok(_) => {
                        state.current_file_path = Some(filepath.clone());
                        state.unsaved_changes = false;
                        info!("✅ Project saved to: {}", filepath);
                    }
                    Err(e) => {
                        error!("❌ Failed to write JSON file: {}", e);
                    }
                }
            }
            Err(e) => {
                error!("❌ Failed to serialize game to JSON: {}", e);
            }
        }
    }

    // Ctrl+E = Export to DAAD source code
    if keys.pressed(KeyCode::ControlLeft) && keys.just_pressed(KeyCode::E) {
        // Create exports directory if it doesn't exist
        let _ = std::fs::create_dir_all("./exports");

        // Generate filename from game title
        let filename = state.current_game.title.replace(' ', "_").to_lowercase();
        let filepath = format!("./exports/{}.sce", filename);

        // Generate DAAD source code
        let daad_code = daad::codegen::DaadCodeGenerator::generate(&state.current_game);

        // Write to file
        match std::fs::write(&filepath, daad_code) {
            Ok(_) => {
                info!("✅ DAAD source exported to: {}", filepath);
            }
            Err(e) => {
                error!("❌ Failed to write DAAD source file: {}", e);
            }
        }
    }
}
