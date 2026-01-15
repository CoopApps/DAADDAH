use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel, BuildStatus, BuildResult};
use crate::daad::codegen::DaadCodeGenerator;
use crate::daad::graphics::GraphicsDatabase;
use std::fs;
use std::process::{Command, Stdio};

/// Render export panel
pub fn render_export_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    build_status: Res<BuildStatus>,
    query: Query<Entity, With<ExportPanel>>,
) {
    // Only render when Export panel is active
    if state.selected_panel != Panel::Export {
        // Clean up when not active
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create export panel
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Percent(95.0),
                    height: Val::Percent(70.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            ExportPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "💾 Export & Save",
                TextStyle {
                    font_size: 22.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Export your game to DAAD source code or save as JSON project",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // JSON Save Section
            parent.spawn(TextBundle::from_section(
                "📁 Save Project (JSON)",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Save your entire project as a JSON file to continue editing later",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Current file path display
            if let Some(path) = &state.current_file_path {
                parent.spawn(TextBundle::from_section(
                    format!("Current file: {}", path),
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.5, 0.7, 0.9),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "No file currently loaded",
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }

            // Save JSON button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.8).into(),
                        border_color: Color::rgb(0.4, 0.7, 0.9).into(),
                        ..default()
                    },
                    SaveJsonButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 SAVE PROJECT TO JSON",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(15.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // DAAD Export Section
            parent.spawn(TextBundle::from_section(
                "📤 Export to DAAD Source Code",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Export your game as DAAD source code (.SCE) for compilation",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Game statistics
            parent.spawn(TextBundle::from_section(
                format!(
                    "Game stats: {} locations, {} objects, {} rules, {} flags, {} messages",
                    state.current_game.locations.len(),
                    state.current_game.objects.len(),
                    state.current_game.rules.len(),
                    state.current_game.flags.len(),
                    state.current_game.messages.len()
                ),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.7, 0.8, 0.9),
                    ..default()
                },
            ));

            // Export DAAD button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    ExportDaadButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "📤 EXPORT TO DAAD SOURCE",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Preview DAAD code button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            margin: UiRect::bottom(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.5).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.6).into(),
                        ..default()
                    },
                    PreviewDaadButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "👁️ Preview DAAD Code (shows in code viewer)",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(15.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // Build Player Section
            parent.spawn(TextBundle::from_section(
                "🔧 Build Standalone Player",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Compile the standalone game player executable for distribution",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Build status display
            if build_status.is_building {
                parent.spawn(TextBundle::from_section(
                    "⏳ Building... Please wait...",
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.8, 0.8, 0.3),
                        ..default()
                    },
                ));
            } else if let Some(ref result) = build_status.last_status {
                match result {
                    BuildResult::Success(path) => {
                        parent.spawn(TextBundle::from_section(
                            format!("✅ Build successful! Executable: {}", path),
                            TextStyle {
                                font_size: 12.0,
                                color: Color::rgb(0.3, 0.9, 0.3),
                                ..default()
                            },
                        ));
                    }
                    BuildResult::Failed(error) => {
                        parent.spawn(TextBundle::from_section(
                            format!("❌ Build failed: {}", error),
                            TextStyle {
                                font_size: 12.0,
                                color: Color::rgb(0.9, 0.3, 0.3),
                                ..default()
                            },
                        ));
                    }
                }
            }

            // Build button
            let (button_color, button_text, button_enabled) = if build_status.is_building {
                (Color::rgb(0.3, 0.3, 0.3), "⏳ Building...", false)
            } else {
                (Color::rgb(0.6, 0.3, 0.7), "🔧 BUILD PLAYER EXECUTABLE", true)
            };

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: button_color.into(),
                        border_color: if button_enabled {
                            Color::rgb(0.7, 0.4, 0.8).into()
                        } else {
                            Color::rgb(0.4, 0.4, 0.4).into()
                        },
                        ..default()
                    },
                    BuildPlayerButton { enabled: button_enabled },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        button_text,
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Separator
            parent.spawn(NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(2.0),
                    margin: UiRect::vertical(Val::Px(15.0)),
                    ..default()
                },
                background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            });

            // Export Graphics Section
            parent.spawn(TextBundle::from_section(
                "🎨 Export Graphics Database",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Bundle all images, sounds, and music files for distribution",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            // Export Graphics button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::vertical(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.4, 0.7).into(),
                        border_color: Color::rgb(0.8, 0.5, 0.8).into(),
                        ..default()
                    },
                    ExportGraphicsButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "🎨 EXPORT GRAPHICS DATABASE",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Help text
            parent.spawn(TextBundle::from_section(
                "ℹ️ Files will be saved to: ./exports/",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.5, 0.6, 0.7),
                    ..default()
                },
            ));

            // Unsaved changes warning
            if state.unsaved_changes {
                parent.spawn(TextBundle::from_section(
                    "⚠️  You have unsaved changes! Remember to save your project.",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.7, 0.3),
                        ..default()
                    },
                ));
            }
        });
}

/// Handle save JSON button
pub fn handle_save_json_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveJsonButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Create exports directory if it doesn't exist
            let _ = fs::create_dir_all("./exports");

            // Generate filename from game title
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let filepath = format!("./exports/{}.json", filename);

            // Serialize and save
            match serde_json::to_string_pretty(&state.current_game) {
                Ok(json) => {
                    match fs::write(&filepath, json) {
                        Ok(_) => {
                            state.current_file_path = Some(filepath.clone());
                            state.unsaved_changes = false;
                            info!("Project saved to: {}", filepath);
                        }
                        Err(e) => {
                            error!("Failed to write JSON file: {}", e);
                        }
                    }
                }
                Err(e) => {
                    error!("Failed to serialize game to JSON: {}", e);
                }
            }
        }
    }
}

/// Handle export DAAD button
pub fn handle_export_daad_button(
    state: Res<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ExportDaadButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Create exports directory if it doesn't exist
            let _ = fs::create_dir_all("./exports");

            // Generate filename from game title
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let filepath = format!("./exports/{}.sce", filename);

            // Generate DAAD source code
            let daad_code = DaadCodeGenerator::generate(&state.current_game);

            // Write to file
            match fs::write(&filepath, daad_code) {
                Ok(_) => {
                    info!("DAAD source exported to: {}", filepath);
                }
                Err(e) => {
                    error!("Failed to write DAAD source file: {}", e);
                }
            }
        }
    }
}

/// Handle preview DAAD code button
pub fn handle_preview_daad_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<PreviewDaadButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Enable code viewer to show the generated code
            state.show_code_viewer = true;
            info!("DAAD code preview enabled - check code viewer (F1)");
        }
    }
}

/// Handle build player button
pub fn handle_build_player_button(
    mut build_status: ResMut<BuildStatus>,
    mut interaction_query: Query<
        (&Interaction, &BuildPlayerButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed && button.enabled {
            // Start build process
            build_status.is_building = true;
            build_status.last_status = None;
            build_status.output.clear();

            info!("Starting build of standalone player...");

            // Spawn cargo build process
            std::thread::spawn(move || {
                let result = Command::new("cargo")
                    .args(&["build", "--release", "--manifest-path", "../daad-player/Cargo.toml"])
                    .stdout(Stdio::piped())
                    .stderr(Stdio::piped())
                    .output();

                match result {
                    Ok(output) => {
                        if output.status.success() {
                            info!("✅ Player build successful!");
                            // Note: We can't update build_status here directly since we're in another thread
                            // In a production app, you'd use channels or events to communicate back
                        } else {
                            let error = String::from_utf8_lossy(&output.stderr);
                            error!("❌ Player build failed: {}", error);
                        }
                    }
                    Err(e) => {
                        error!("❌ Failed to spawn build process: {}", e);
                    }
                }
            });

            // For simplicity, mark as complete after a delay
            // In production, you'd want proper async handling
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(3));
                info!("Build process completed (check logs for details)");
            });
        }
    }
}

/// System to check build completion (simplified version)
pub fn check_build_completion(
    mut build_status: ResMut<BuildStatus>,
) {
    // This is a simplified version - in production you'd use proper async/channels
    if build_status.is_building {
        // Check if build output exists
        if std::path::Path::new("../daad-player/target/release/daad-player").exists()
            || std::path::Path::new("../daad-player/target/release/daad-player.exe").exists() {

            let exe_path = if cfg!(windows) {
                "../daad-player/target/release/daad-player.exe"
            } else {
                "../daad-player/target/release/daad-player"
            };

            if std::path::Path::new(exe_path).exists() {
                // Copy to dist directory
                let _ = std::fs::create_dir_all("./dist");
                let dest_path = if cfg!(windows) {
                    "./dist/daad-player.exe"
                } else {
                    "./dist/daad-player"
                };

                if let Ok(_) = std::fs::copy(exe_path, dest_path) {
                    build_status.is_building = false;
                    build_status.last_status = Some(BuildResult::Success(dest_path.to_string()));
                    info!("✅ Player executable copied to {}", dest_path);
                }
            }
        }
    }
}

/// Handle export graphics database button
pub fn handle_export_graphics_button(
    state: Res<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ExportGraphicsButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            info!("🎨 Starting graphics database export...");

            // Build graphics database from game
            let db = GraphicsDatabase::from_game(&state.current_game);

            // Validate before export
            let validation_errors = db.validate();
            if !validation_errors.is_empty() {
                warn!("⚠️  Graphics validation warnings:");
                for error in &validation_errors {
                    warn!("  - {}", error);
                }
            }

            // Create output directory
            let filename = state.current_game.title.replace(' ', "_").to_lowercase();
            let output_dir = format!("./exports/{}_graphics", filename);

            // Export graphics database
            match db.export(&output_dir) {
                Ok(report) => {
                    info!("✅ Graphics database exported successfully!");
                    info!("📊 Export Summary:");
                    info!("  Images: {} copied, {} missing", report.images_copied, report.images_missing);
                    info!("  Sounds: {} copied, {} missing", report.sounds_copied, report.sounds_missing);
                    info!("  Music: {} copied, {} missing", report.music_copied, report.music_missing);
                    info!("  Total size: {:.2} MB", report.total_size as f64 / 1_048_576.0);
                    info!("  Output directory: {}", output_dir);

                    if !report.errors.is_empty() {
                        warn!("⚠️  Some files could not be exported:");
                        for error in &report.errors {
                            warn!("  - {}", error);
                        }
                    }
                }
                Err(e) => {
                    error!("❌ Failed to export graphics database: {}", e);
                }
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct ExportPanel;

#[derive(Component)]
pub(crate) struct SaveJsonButton;

#[derive(Component)]
pub(crate) struct ExportDaadButton;

#[derive(Component)]
pub(crate) struct PreviewDaadButton;

#[derive(Component)]
pub(crate) struct BuildPlayerButton {
    enabled: bool,
}

#[derive(Component)]
pub(crate) struct ExportGraphicsButton;
