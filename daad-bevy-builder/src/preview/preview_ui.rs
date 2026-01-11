use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};
use crate::preview::interpreter::GameRuntime;

/// Render the game preview panel
pub fn render_preview_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<PreviewPanel>>,
    runtime: Option<ResMut<GameRuntime>>,
) {
    // Only render when Preview panel is active
    if state.selected_panel != Panel::Preview {
        // Clean up preview panel when not active
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create preview panel
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
                    padding: UiRect::all(Val::Px(15.0)),
                    row_gap: Val::Px(10.0),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.05, 0.05, 0.1, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            PreviewPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "▶️ Game Preview - Live Playtest",
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            if let Some(runtime) = runtime {
                // Game title and status
                parent.spawn(TextBundle::from_section(
                    format!("Playing: {} by {}",
                        state.current_game.title,
                        state.current_game.author),
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));

                // Current location info
                if let Some(current_loc) = state.current_game.locations.iter()
                    .find(|l| l.id == runtime.current_location) {
                    parent.spawn(TextBundle::from_section(
                        format!("📍 {}", current_loc.name),
                        TextStyle {
                            font_size: 16.0,
                            color: Color::rgb(0.9, 0.9, 1.0),
                            ..default()
                        },
                    ));

                    parent.spawn(TextBundle::from_section(
                        &current_loc.description,
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.8, 0.8, 0.8),
                            ..default()
                        },
                    ));
                }

                // Separator
                parent.spawn(NodeBundle {
                    style: Style {
                        width: Val::Percent(100.0),
                        height: Val::Px(2.0),
                        margin: UiRect::vertical(Val::Px(5.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.3, 0.3, 0.35).into(),
                    ..default()
                });

                // Game output area (scrollable text)
                parent
                    .spawn(NodeBundle {
                        style: Style {
                            width: Val::Percent(100.0),
                            height: Val::Percent(50.0),
                            padding: UiRect::all(Val::Px(10.0)),
                            flex_direction: FlexDirection::Column,
                            overflow: Overflow::clip_y(),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgba(0.0, 0.0, 0.0, 0.4).into(),
                        border_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        ..default()
                    })
                    .with_children(|parent| {
                        // Display game output history
                        for line in &runtime.output_history {
                            parent.spawn(TextBundle::from_section(
                                line,
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::rgb(0.9, 0.9, 0.9),
                                    ..default()
                                },
                            ));
                        }
                    });

                // Inventory display
                let inventory_items: Vec<&crate::daad::types::Object> = state.current_game.objects.iter()
                    .filter(|obj| matches!(obj.location, crate::daad::types::ObjectLocation::Carried))
                    .collect();

                if !inventory_items.is_empty() {
                    parent.spawn(TextBundle::from_section(
                        format!("🎒 Inventory ({} items):", inventory_items.len()),
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.8, 0.9, 1.0),
                            ..default()
                        },
                    ));

                    for obj in inventory_items {
                        parent.spawn(TextBundle::from_section(
                            format!("  {} {}", obj.icon, obj.name),
                            TextStyle {
                                font_size: 12.0,
                                color: Color::rgb(0.7, 0.7, 0.7),
                                ..default()
                            },
                        ));
                    }
                }

                // Command input area (simplified - showing available commands)
                parent.spawn(TextBundle::from_section(
                    "💡 Available commands: LOOK, INVENTORY, GO [direction], GET [object], DROP [object], EXAMINE [object]",
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.5, 0.6, 0.7),
                        ..default()
                    },
                ));

                parent.spawn(TextBundle::from_section(
                    "⚠️  Note: Full text input not yet implemented. Use buttons for common commands.",
                    TextStyle {
                        font_size: 10.0,
                        color: Color::rgb(0.6, 0.5, 0.4),
                        ..default()
                    },
                ));

                // Command buttons
                parent
                    .spawn(NodeBundle {
                        style: Style {
                            flex_direction: FlexDirection::Row,
                            column_gap: Val::Px(8.0),
                            margin: UiRect::top(Val::Px(10.0)),
                            ..default()
                        },
                        ..default()
                    })
                    .with_children(|parent| {
                        // Look button
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(8.0)),
                                        border: UiRect::all(Val::Px(1.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                                    ..default()
                                },
                                PreviewCommandButton {
                                    command: "LOOK".to_string(),
                                },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    "👁️ LOOK",
                                    TextStyle {
                                        font_size: 12.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });

                        // Inventory button
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(8.0)),
                                        border: UiRect::all(Val::Px(1.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                                    ..default()
                                },
                                PreviewCommandButton {
                                    command: "INVENTORY".to_string(),
                                },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    "🎒 INVENTORY",
                                    TextStyle {
                                        font_size: 12.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });

                        // Reset button
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(8.0)),
                                        border: UiRect::all(Val::Px(1.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.7, 0.3, 0.3).into(),
                                    border_color: Color::rgb(0.8, 0.4, 0.4).into(),
                                    ..default()
                                },
                                ResetGameButton,
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    "🔄 RESTART",
                                    TextStyle {
                                        font_size: 12.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                    });
            } else {
                // No runtime initialized yet
                parent.spawn(TextBundle::from_section(
                    "🎮 Game not started",
                    TextStyle {
                        font_size: 16.0,
                        color: Color::rgb(0.7, 0.7, 0.7),
                        ..default()
                    },
                ));

                parent.spawn(TextBundle::from_section(
                    "Click 'Start Game' to begin playtest",
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));

                // Start game button
                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(12.0)),
                                margin: UiRect::top(Val::Px(20.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                            border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                            ..default()
                        },
                        StartGameButton,
                    ))
                    .with_children(|parent| {
                        parent.spawn(TextBundle::from_section(
                            "▶️ START GAME",
                            TextStyle {
                                font_size: 15.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));
                    });
            }
        });
}

/// Handle start game button
pub fn handle_start_game_button(
    mut commands: Commands,
    state: Res<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<StartGameButton>),
    >,
    existing_runtime: Option<ResMut<GameRuntime>>,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if existing_runtime.is_none() {
                // Initialize game runtime
                let runtime = GameRuntime::new(&state.current_game);
                commands.insert_resource(runtime);
                info!("Game runtime initialized");
            }
        }
    }
}

/// Handle preview command buttons
pub fn handle_preview_command_buttons(
    mut runtime: Option<ResMut<GameRuntime>>,
    state: Res<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &PreviewCommandButton),
        Changed<Interaction>,
    >,
) {
    if let Some(ref mut runtime) = runtime {
        for (interaction, button) in interaction_query.iter_mut() {
            if *interaction == Interaction::Pressed {
                runtime.execute_command(&button.command, &state.current_game);
                info!("Executed command: {}", button.command);
            }
        }
    }
}

/// Handle reset game button
pub fn handle_reset_game_button(
    mut commands: Commands,
    state: Res<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<ResetGameButton>),
    >,
    existing_runtime: Option<ResMut<GameRuntime>>,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if existing_runtime.is_some() {
                // Remove old runtime and create new one
                commands.remove_resource::<GameRuntime>();
                let runtime = GameRuntime::new(&state.current_game);
                commands.insert_resource(runtime);
                info!("Game restarted");
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct PreviewPanel;

#[derive(Component)]
pub(crate) struct StartGameButton;

#[derive(Component)]
pub(crate) struct PreviewCommandButton {
    command: String,
}

#[derive(Component)]
pub(crate) struct ResetGameButton;
