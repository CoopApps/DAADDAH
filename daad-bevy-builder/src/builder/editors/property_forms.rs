use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::builder::ui::text_input::{TextInput, TextInputLabel};

/// Render game info editor when GameInfo panel is active
pub fn render_game_info_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<GameInfoEditor>>,
) {
    // Only render when GameInfo panel is active
    if state.selected_panel != Panel::GameInfo {
        return;
    }

    // Clean up old editor
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create game info editor
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
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            GameInfoEditor,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "📋 Game Information",
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Edit your game's basic information",
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Title field
            parent.spawn(TextBundle::from_section(
                "\nGame Title:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Px(400.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new("game_title", "Enter game title")
                        .with_value(state.current_game.title.clone())
                        .with_max_length(100),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            state.current_game.title.clone(),
                            TextStyle {
                                font_size: 16.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: "game_title".to_string(),
                        },
                    ));
                });

            // Author field
            parent.spawn(TextBundle::from_section(
                "Author:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Px(400.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new("game_author", "Enter author name")
                        .with_value(state.current_game.author.clone())
                        .with_max_length(100),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            state.current_game.author.clone(),
                            TextStyle {
                                font_size: 16.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: "game_author".to_string(),
                        },
                    ));
                });

            // Version field
            parent.spawn(TextBundle::from_section(
                "Version:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Px(200.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new("game_version", "Enter version")
                        .with_value(state.current_game.version.clone())
                        .with_max_length(20),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            state.current_game.version.clone(),
                            TextStyle {
                                font_size: 16.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: "game_version".to_string(),
                        },
                    ));
                });

            // Starting location field
            parent.spawn(TextBundle::from_section(
                "\nStarting Location:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.9, 0.9),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "The location where the player begins the game",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.6, 0.6, 0.6),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Px(200.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new("game_starting_location", "Location ID")
                        .with_value(state.current_game.starting_location.to_string())
                        .with_max_length(3),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            state.current_game.starting_location.to_string(),
                            TextStyle {
                                font_size: 16.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: "game_starting_location".to_string(),
                        },
                    ));
                });

            // Show available locations
            if !state.current_game.locations.is_empty() {
                parent.spawn(TextBundle::from_section(
                    "\nAvailable Locations:",
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.7, 0.8, 0.9),
                        ..default()
                    },
                ));

                for loc in &state.current_game.locations {
                    parent.spawn(TextBundle::from_section(
                        format!("  {} - {}", loc.id, loc.name),
                        TextStyle {
                            font_size: 12.0,
                            color: Color::rgb(0.6, 0.7, 0.8),
                            ..default()
                        },
                    ));
                }
            }

            // Save button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(15.0)),
                            margin: UiRect::top(Val::Px(20.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    SaveGameInfoButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 Save Game Information",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Statistics
            parent.spawn(TextBundle::from_section(
                "\n📊 Statistics:",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.7, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("📍 Locations: {}", state.current_game.locations.len()),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("📦 Objects: {}", state.current_game.objects.len()),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("⚙️ Rules: {}", state.current_game.rules.len()),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("🚩 Flags: {}", state.current_game.flags.len()),
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.8, 0.8, 0.8),
                    ..default()
                },
            ));
        });
}

/// Render flags editor when Flags panel is active
pub fn render_flags_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<FlagsEditor>>,
) {
    // Only render when Flags panel is active
    if state.selected_panel != Panel::Flags {
        return;
    }

    // Clean up old editor
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create flags editor
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
                    row_gap: Val::Px(8.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            FlagsEditor,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "🚩 Flags (Game Variables)",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("DAAD supports 256 flags (0-255). Currently using {} flags.",
                    state.current_game.flags.len()),
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Add flag button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddFlagButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Flag",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List all flags
            for flag in &state.current_game.flags {
                let is_selected = matches!(state.editing, Some(EditMode::Flag(id)) if id == flag.id);

                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                flex_direction: FlexDirection::Row,
                                align_items: AlignItems::Center,
                                column_gap: Val::Px(15.0),
                                ..default()
                            },
                            background_color: if is_selected {
                                Color::rgb(0.4, 0.6, 0.9)
                            } else {
                                Color::rgb(0.2, 0.2, 0.25)
                            }.into(),
                            border_color: if is_selected {
                                Color::rgb(1.0, 1.0, 0.5)
                            } else {
                                Color::rgb(0.3, 0.3, 0.35)
                            }.into(),
                            ..default()
                        },
                        FlagCard {
                            flag_id: flag.id,
                        },
                    ))
                    .with_children(|parent| {
                        // Flag ID
                        parent.spawn(TextBundle::from_section(
                            format!("#{}", flag.id),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(0.5, 0.8, 1.0),
                                ..default()
                            },
                        ));

                        // Flag name
                        parent.spawn(TextBundle::from_section(
                            &flag.name,
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));

                        // Description
                        parent.spawn(TextBundle::from_section(
                            format!("- {}", flag.description),
                            TextStyle {
                                font_size: 12.0,
                                color: Color::rgb(0.7, 0.7, 0.7),
                                ..default()
                            },
                        ));

                        // Initial value
                        parent.spawn(TextBundle::from_section(
                            format!("(initial: {})", flag.initial_value),
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.6, 0.6, 0.6),
                                ..default()
                            },
                        ));

                        // Spacer
                        parent.spawn(NodeBundle {
                            style: Style {
                                flex_grow: 1.0,
                                ..default()
                            },
                            ..default()
                        });

                        // Delete button
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(5.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.6, 0.2, 0.2).into(),
                                    ..default()
                                },
                                DeleteFlagButton { flag_id: flag.id },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    "🗑️",
                                    TextStyle {
                                        font_size: 14.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                    });
            }
        });
}

/// Render messages editor when Messages panel is active
pub fn render_messages_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<MessagesEditor>>,
) {
    // Only render when Messages panel is active
    if state.selected_panel != Panel::Messages {
        return;
    }

    // Clean up old editor
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create messages editor
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
                    row_gap: Val::Px(8.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.12, 0.12, 0.18, 0.95).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            MessagesEditor,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "💬 Messages",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Game messages and text responses. {} messages defined.",
                    state.current_game.messages.len()),
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Add message button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddMessageButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Message",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List all messages
            for (idx, message) in state.current_game.messages.iter().enumerate() {
                let is_selected = matches!(state.editing, Some(EditMode::Message(id)) if id == idx);

                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                flex_direction: FlexDirection::Row,
                                align_items: AlignItems::Center,
                                column_gap: Val::Px(15.0),
                                ..default()
                            },
                            background_color: if is_selected {
                                Color::rgb(0.4, 0.6, 0.9)
                            } else {
                                Color::rgb(0.2, 0.2, 0.25)
                            }.into(),
                            border_color: if is_selected {
                                Color::rgb(1.0, 1.0, 0.5)
                            } else {
                                Color::rgb(0.3, 0.3, 0.35)
                            }.into(),
                            ..default()
                        },
                        MessageCard {
                            message_index: idx,
                        },
                    ))
                    .with_children(|parent| {
                        // Message ID
                        parent.spawn(TextBundle::from_section(
                            format!("#{}", idx),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::rgb(0.5, 0.8, 1.0),
                                ..default()
                            },
                        ));

                        // Message text (truncated if too long)
                        let display_text = if message.len() > 80 {
                            format!("\"{}...\"", &message[..77])
                        } else {
                            format!("\"{}\"", message)
                        };

                        parent.spawn(TextBundle::from_section(
                            display_text,
                            TextStyle {
                                font_size: 13.0,
                                color: Color::rgb(0.9, 0.9, 0.9),
                                ..default()
                            },
                        ));

                        // Spacer
                        parent.spawn(NodeBundle {
                            style: Style {
                                flex_grow: 1.0,
                                ..default()
                            },
                            ..default()
                        });

                        // Delete button
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(5.0)),
                                        ..default()
                                    },
                                    background_color: Color::rgb(0.6, 0.2, 0.2).into(),
                                    ..default()
                                },
                                DeleteMessageButton { message_index: idx },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    "🗑️",
                                    TextStyle {
                                        font_size: 14.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                    });
            }
        });
}

/// Handle flag card clicks (select for editing)
pub fn handle_flag_card_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &FlagCard),
        Changed<Interaction>,
    >,
) {
    for (interaction, card) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = Some(EditMode::Flag(card.flag_id));
            info!("Selected flag {} for editing", card.flag_id);
        }
    }
}

/// Handle message card clicks (select for editing)
pub fn handle_message_card_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &MessageCard),
        Changed<Interaction>,
    >,
) {
    for (interaction, card) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = Some(EditMode::Message(card.message_index));
            info!("Selected message {} for editing", card.message_index);
        }
    }
}

/// Handle add flag button
pub fn handle_add_flag_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddFlagButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if state.current_game.flags.len() < 256 {
                // Find next available flag ID
                let next_id = state.current_game.flags.len() as u8;

                state.current_game.flags.push(crate::daad::types::Flag {
                    id: next_id,
                    name: format!("Flag {}", next_id),
                    description: "A new flag".to_string(),
                    initial_value: 0,
                });

                state.unsaved_changes = true;
                state.editing = Some(EditMode::Flag(next_id));
                info!("Created new flag {}", next_id);
            } else {
                warn!("Cannot create more than 256 flags");
            }
        }
    }
}

/// Handle add message button
pub fn handle_add_message_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddMessageButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            let new_idx = state.current_game.messages.len();
            state.current_game.messages.push("New message text".to_string());

            state.unsaved_changes = true;
            state.editing = Some(EditMode::Message(new_idx));
            info!("Created new message {}", new_idx);
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct FlagsEditor;

#[derive(Component)]
pub(crate) struct MessagesEditor;

#[derive(Component)]
pub(crate) struct FlagCard {
    flag_id: u8,
}

#[derive(Component)]
pub(crate) struct MessageCard {
    message_index: usize,
}

#[derive(Component)]
pub(crate) struct AddFlagButton;

#[derive(Component)]
pub(crate) struct AddMessageButton;

/// Render property editing panel when something is selected
pub fn render_property_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<PropertyEditorPanel>>,
) {
    // Clean up old property editor
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Only render if something is being edited
    if let Some(ref edit_mode) = state.editing {
        match edit_mode {
            EditMode::Flag(flag_id) => {
                if let Some(flag) = state.current_game.flags.iter().find(|f| f.id == *flag_id) {
                    render_flag_property_editor(&mut commands, flag_id, flag);
                }
            }
            EditMode::Message(msg_idx) => {
                if let Some(message) = state.current_game.messages.get(*msg_idx) {
                    render_message_property_editor(&mut commands, msg_idx, message);
                }
            }
            EditMode::Object(obj_id) => {
                if let Some(obj) = state.current_game.objects.iter().find(|o| o.id == *obj_id) {
                    render_object_property_editor(&mut commands, obj_id, obj);
                }
            }
            EditMode::Location(loc_id) => {
                if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *loc_id) {
                    render_location_property_editor(&mut commands, loc_id, loc);
                }
            }
            _ => {}
        }
    }
}

fn render_flag_property_editor(commands: &mut Commands, flag_id: &u8, flag: &crate::daad::types::Flag) {
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(350.0),
                    height: Val::Auto,
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.22, 0.98).into(),
                border_color: Color::rgb(0.5, 0.7, 1.0).into(),
                ..default()
            },
            PropertyEditorPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                format!("Edit Flag #{}", flag_id),
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Flag Name field
            parent.spawn(TextBundle::from_section(
                "Name:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Percent(100.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new(&format!("flag_{}_name", flag_id), "Enter flag name")
                        .with_value(flag.name.clone())
                        .with_max_length(50),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            flag.name.clone(),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: format!("flag_{}_name", flag_id),
                        },
                    ));
                });

            // Description field
            parent.spawn(TextBundle::from_section(
                "Description:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Percent(100.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new(&format!("flag_{}_desc", flag_id), "Enter description")
                        .with_value(flag.description.clone())
                        .with_max_length(200),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            flag.description.clone(),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: format!("flag_{}_desc", flag_id),
                        },
                    ));
                });

            // Initial Value field
            parent.spawn(TextBundle::from_section(
                "Initial Value:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Percent(100.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new(&format!("flag_{}_value", flag_id), "0-255")
                        .with_value(flag.initial_value.to_string())
                        .with_max_length(3),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            flag.initial_value.to_string(),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: format!("flag_{}_value", flag_id),
                        },
                    ));
                });

            // Save button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::top(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    SaveFlagButton { flag_id: *flag_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 Save Changes",
                        TextStyle {
                            font_size: 15.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Close button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                        ..default()
                    },
                    CloseEditorButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕ Close",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

fn render_message_property_editor(commands: &mut Commands, msg_idx: &usize, message: &str) {
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(350.0),
                    height: Val::Auto,
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.22, 0.98).into(),
                border_color: Color::rgb(0.5, 0.7, 1.0).into(),
                ..default()
            },
            PropertyEditorPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                format!("Edit Message #{}", msg_idx),
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Message text field
            parent.spawn(TextBundle::from_section(
                "Message Text:",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            width: Val::Percent(100.0),
                            min_height: Val::Px(60.0),
                            ..default()
                        },
                        background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                        border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                        ..default()
                    },
                    TextInput::new(&format!("message_{}", msg_idx), "Enter message text")
                        .with_value(message.to_string())
                        .with_max_length(500),
                ))
                .with_children(|parent| {
                    parent.spawn((
                        TextBundle::from_section(
                            message.to_string(),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ),
                        TextInputLabel {
                            for_field_id: format!("message_{}", msg_idx),
                        },
                    ));
                });

            // Save button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::top(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    SaveMessageButton { message_index: *msg_idx },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 Save Changes",
                        TextStyle {
                            font_size: 15.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Close button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                        ..default()
                    },
                    CloseEditorButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕ Close",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

/// Handle save flag button
pub fn handle_save_flag_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &SaveFlagButton),
        Changed<Interaction>,
    >,
    text_inputs: Query<&TextInput>,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if let Some(flag) = state.current_game.flags.iter_mut().find(|f| f.id == button.flag_id) {
                // Update flag from text inputs
                for input in text_inputs.iter() {
                    if input.field_id == format!("flag_{}_name", button.flag_id) {
                        flag.name = input.value.clone();
                    } else if input.field_id == format!("flag_{}_desc", button.flag_id) {
                        flag.description = input.value.clone();
                    } else if input.field_id == format!("flag_{}_value", button.flag_id) {
                        // Parse value as u8
                        if let Ok(value) = input.value.parse::<u8>() {
                            flag.initial_value = value;
                        }
                    }
                }

                state.unsaved_changes = true;
                state.editing = None;
                info!("Saved changes to flag {}", button.flag_id);
            }
        }
    }
}

/// Handle save message button
pub fn handle_save_message_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &SaveMessageButton),
        Changed<Interaction>,
    >,
    text_inputs: Query<&TextInput>,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if let Some(message) = state.current_game.messages.get_mut(button.message_index) {
                // Update message from text input
                for input in text_inputs.iter() {
                    if input.field_id == format!("message_{}", button.message_index) {
                        *message = input.value.clone();
                    }
                }

                state.unsaved_changes = true;
                state.editing = None;
                info!("Saved changes to message {}", button.message_index);
            }
        }
    }
}

/// Handle close editor button
pub fn handle_close_editor_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CloseEditorButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = None;
        }
    }
}

/// Handle apply container preset button
pub fn handle_apply_container_preset(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ApplyContainerPresetButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            use crate::builder::presets::apply_container_preset;

            let rule_ids = apply_container_preset(&mut state.current_game, button.object_id);
            state.unsaved_changes = true;

            info!("Applied container preset to object {}, created {} rules",
                button.object_id, rule_ids.len());
        }
    }
}

/// Handle apply light source preset button
pub fn handle_apply_light_source_preset(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ApplyLightSourcePresetButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            use crate::builder::presets::apply_light_source_preset;

            let rule_ids = apply_light_source_preset(&mut state.current_game, button.object_id, 20);
            state.unsaved_changes = true;

            info!("Applied light source preset to object {}, created {} rules",
                button.object_id, rule_ids.len());
        }
    }
}

/// Handle apply readable preset button
pub fn handle_apply_readable_preset(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ApplyReadablePresetButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            use crate::builder::presets::apply_readable_preset;

            let rule_ids = apply_readable_preset(
                &mut state.current_game,
                button.object_id,
                "The text reads: (edit this in the rule editor)"
            );
            state.unsaved_changes = true;

            info!("Applied readable preset to object {}, created {} rules",
                button.object_id, rule_ids.len());
        }
    }
}

fn render_object_property_editor(commands: &mut Commands, obj_id: &u8, obj: &crate::daad::types::Object) {
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(380.0),
                    height: Val::Auto,
                    max_height: Val::Percent(80.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(12.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.22, 0.98).into(),
                border_color: Color::rgb(0.9, 0.7, 0.5).into(),
                ..default()
            },
            PropertyEditorPanel,
        ))
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("Edit Object #{}", obj_id),
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(1.0, 0.9, 0.7),
                    ..default()
                },
            ));

            // Object Name
            add_text_field(parent, "Name:", &format!("object_{}_name", obj_id), &obj.name, 50);

            // Noun
            add_text_field(parent, "Noun:", &format!("object_{}_noun", obj_id), &obj.noun, 30);

            // Adjective
            add_text_field(parent, "Adjective:", &format!("object_{}_adj", obj_id), &obj.adjective, 30);

            // Description
            add_text_field(parent, "Description:", &format!("object_{}_desc", obj_id), &obj.description, 200);

            // Icon
            add_text_field(parent, "Icon:", &format!("object_{}_icon", obj_id), &obj.icon, 10);

            // Weight
            add_text_field(parent, "Weight:", &format!("object_{}_weight", obj_id), &obj.weight.to_string(), 3);

            // Initial Location Section
            parent.spawn(TextBundle::from_section(
                "\n📍 Initial Location",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            use crate::daad::types::ObjectLocation;
            let loc_display = match &obj.location {
                ObjectLocation::Limbo => "252 (Limbo - not in game)".to_string(),
                ObjectLocation::Carried => "254 (Carried by player)".to_string(),
                ObjectLocation::Worn => "253 (Worn by player)".to_string(),
                ObjectLocation::Location(id) => format!("{} (At location {})", id, id),
                ObjectLocation::Inside(container_id) => format!("Inside object {}", container_id),
            };

            parent.spawn(TextBundle::from_section(
                format!("Current: {}", loc_display),
                TextStyle {
                    font_size: 13.0,
                    color: Color::rgb(0.7, 0.8, 0.9),
                    ..default()
                },
            ));

            add_text_field(parent, "Location (0-255, 252=Limbo, 253=Worn, 254=Carried):",
                          &format!("object_{}_location", obj_id),
                          &obj.location.to_daad_location().to_string(), 3);

            // Object Properties Section
            parent.spawn(TextBundle::from_section(
                "\n⚙️ Object Properties",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Clickable property toggles
            add_property_toggle(parent, "Container", obj.is_container, ToggleObjectProperty::Container(*obj_id));
            add_property_toggle(parent, "Wearable", obj.is_wearable, ToggleObjectProperty::Wearable(*obj_id));
            add_property_toggle(parent, "Takeable", obj.is_takeable, ToggleObjectProperty::Takeable(*obj_id));
            add_property_toggle(parent, "Openable", obj.is_openable, ToggleObjectProperty::Openable(*obj_id));
            add_property_toggle(parent, "Currently Open", obj.is_open, ToggleObjectProperty::Open(*obj_id));
            add_property_toggle(parent, "Lockable", obj.is_lockable, ToggleObjectProperty::Lockable(*obj_id));
            add_property_toggle(parent, "Currently Locked", obj.is_locked, ToggleObjectProperty::Locked(*obj_id));
            add_property_toggle(parent, "Light Source", obj.is_light_source, ToggleObjectProperty::LightSource(*obj_id));
            add_property_toggle(parent, "Currently Lit", obj.is_lit, ToggleObjectProperty::Lit(*obj_id));
            add_property_toggle(parent, "Vehicle", obj.is_vehicle, ToggleObjectProperty::Vehicle(*obj_id));
            add_property_toggle(parent, "Can Contain Player", obj.can_contain_player, ToggleObjectProperty::CanContainPlayer(*obj_id));

            parent.spawn(TextBundle::from_section(
                "\nClick checkboxes to toggle properties",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.8, 0.6),
                    font: Default::default(),
                },
            ));

            // Behavior Presets Section
            parent.spawn(TextBundle::from_section(
                "🎭 Behavior Presets",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Click to auto-generate rules for common behaviors:",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Container preset button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(3.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.5, 0.7).into(),
                        border_color: Color::rgb(0.5, 0.6, 0.8).into(),
                        ..default()
                    },
                    ApplyContainerPresetButton { object_id: *obj_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "📦 Make Container (OPEN/CLOSE)",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Light source preset button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(3.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.8, 0.7, 0.4).into(),
                        ..default()
                    },
                    ApplyLightSourcePresetButton { object_id: *obj_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💡 Make Light Source (LIGHT/EXTINGUISH)",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Readable preset button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(3.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.5, 0.7, 0.5).into(),
                        border_color: Color::rgb(0.6, 0.8, 0.6).into(),
                        ..default()
                    },
                    ApplyReadablePresetButton { object_id: *obj_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "📄 Make Readable (READ)",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::top(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    SaveObjectButton { object_id: *obj_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 Save Changes",
                        TextStyle {
                            font_size: 15.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Delete button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.8, 0.2, 0.2).into(),
                        border_color: Color::rgb(1.0, 0.3, 0.3).into(),
                        ..default()
                    },
                    DeleteObjectButton { object_id: *obj_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "🗑️ Delete Object",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                        ..default()
                    },
                    CloseEditorButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕ Close",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

fn render_location_property_editor(commands: &mut Commands, loc_id: &u8, loc: &crate::daad::types::Location) {
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(380.0),
                    height: Val::Auto,
                    max_height: Val::Percent(80.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(12.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.15, 0.15, 0.22, 0.98).into(),
                border_color: Color::rgb(0.5, 0.9, 0.7).into(),
                ..default()
            },
            PropertyEditorPanel,
        ))
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("Edit Location #{}", loc_id),
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.7, 1.0, 0.9),
                    ..default()
                },
            ));

            // Location Name
            add_text_field(parent, "Name:", &format!("location_{}_name", loc_id), &loc.name, 50);

            // Description
            add_text_field(parent, "Description:", &format!("location_{}_desc", loc_id), &loc.description, 500);

            // Darkness checkbox
            parent.spawn(TextBundle::from_section(
                "\n🌑 Location Properties",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Clickable darkness toggle
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(5.0)),
                            margin: UiRect::vertical(Val::Px(2.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: if loc.is_dark {
                            Color::rgb(0.2, 0.2, 0.4)
                        } else {
                            Color::rgb(0.2, 0.2, 0.2)
                        }.into(),
                        border_color: if loc.is_dark {
                            Color::rgb(0.4, 0.4, 0.8)
                        } else {
                            Color::rgb(0.4, 0.4, 0.4)
                        }.into(),
                        ..default()
                    },
                    ToggleLocationDark { location_id: *loc_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        format!("  {} Dark (requires light source)", if loc.is_dark { "✓" } else { "✗" }),
                        TextStyle {
                            font_size: 13.0,
                            color: if loc.is_dark {
                                Color::rgb(0.6, 0.6, 1.0)
                            } else {
                                Color::rgb(0.6, 0.6, 0.6)
                            },
                            ..default()
                        },
                    ));
                });

            parent.spawn(TextBundle::from_section(
                "Click checkbox to toggle darkness",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.8, 0.6),
                    ..default()
                },
            ));

            // Graphics section
            parent.spawn(TextBundle::from_section(
                "\n🎨 Graphics:",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Image File
            add_text_field(parent, "Image File (path or filename):", &format!("location_{}_image", loc_id),
                &loc.image_file.as_deref().unwrap_or(""), 100);

            // Picture ID
            add_text_field(parent, "Picture ID (0-255):", &format!("location_{}_picid", loc_id),
                &loc.picture_id.map(|id| id.to_string()).unwrap_or_default(), 3);

            // Auto-show checkbox display
            parent.spawn(TextBundle::from_section(
                format!("Auto-show on entry: {}", if loc.auto_show_picture { "✓" } else { "✗" }),
                TextStyle {
                    font_size: 14.0,
                    color: if loc.auto_show_picture {
                        Color::rgb(0.3, 0.9, 0.3)
                    } else {
                        Color::rgb(0.6, 0.6, 0.6)
                    },
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "ℹ️ Tip: Use relative paths like 'images/forest.png'\n\
                 Images will be bundled with your game export",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.5, 0.6, 0.7),
                    ..default()
                },
            ));

            // Sound section
            parent.spawn(TextBundle::from_section(
                "\n🔊 Sound Effects:",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Sound File
            add_text_field(parent, "Sound File (WAV/MP3):", &format!("location_{}_sound", loc_id),
                &loc.sound_file.as_deref().unwrap_or(""), 100);

            // Sound ID
            add_text_field(parent, "Sound ID (0-255):", &format!("location_{}_soundid", loc_id),
                &loc.sound_id.map(|id| id.to_string()).unwrap_or_default(), 3);

            // Auto-play sound checkbox display
            parent.spawn(TextBundle::from_section(
                format!("Auto-play on entry: {}", if loc.auto_play_sound { "✓" } else { "✗" }),
                TextStyle {
                    font_size: 14.0,
                    color: if loc.auto_play_sound {
                        Color::rgb(0.3, 0.9, 0.3)
                    } else {
                        Color::rgb(0.6, 0.6, 0.6)
                    },
                    ..default()
                },
            ));

            // Music section
            parent.spawn(TextBundle::from_section(
                "\n🎵 Background Music:",
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Music File
            add_text_field(parent, "Music File (MP3/OGG):", &format!("location_{}_music", loc_id),
                &loc.music_file.as_deref().unwrap_or(""), 100);

            // Music ID
            add_text_field(parent, "Music ID (0-255):", &format!("location_{}_musicid", loc_id),
                &loc.music_id.map(|id| id.to_string()).unwrap_or_default(), 3);

            // Auto-play music checkbox display
            parent.spawn(TextBundle::from_section(
                format!("Auto-play on entry: {}", if loc.auto_play_music { "✓" } else { "✗" }),
                TextStyle {
                    font_size: 14.0,
                    color: if loc.auto_play_music {
                        Color::rgb(0.3, 0.9, 0.3)
                    } else {
                        Color::rgb(0.6, 0.6, 0.6)
                    },
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "ℹ️ Tip: Use relative paths like 'sounds/ambience.mp3'",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.5, 0.6, 0.7),
                    ..default()
                },
            ));

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(12.0)),
                            margin: UiRect::top(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.7, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.9, 0.4).into(),
                        ..default()
                    },
                    SaveLocationButton { location_id: *loc_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "💾 Save Changes",
                        TextStyle {
                            font_size: 15.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            justify_content: JustifyContent::Center,
                            ..default()
                        },
                        background_color: Color::rgb(0.4, 0.4, 0.4).into(),
                        border_color: Color::rgb(0.5, 0.5, 0.5).into(),
                        ..default()
                    },
                    CloseEditorButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕ Close",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

/// Handle save game info button
pub fn handle_save_game_info_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SaveGameInfoButton>),
    >,
    text_inputs: Query<&TextInput>,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            for input in text_inputs.iter() {
                if input.field_id == "game_title" {
                    state.current_game.title = input.value.clone();
                } else if input.field_id == "game_author" {
                    state.current_game.author = input.value.clone();
                } else if input.field_id == "game_version" {
                    state.current_game.version = input.value.clone();
                } else if input.field_id == "game_starting_location" {
                    if let Ok(loc) = input.value.parse::<u8>() {
                        state.current_game.starting_location = loc;
                    }
                }
            }

            state.unsaved_changes = true;
            info!("Saved game information");
        }
    }
}

// Helper function to display checkbox state
fn add_checkbox_display(parent: &mut ChildBuilder, label: &str, checked: bool) {
    parent.spawn(TextBundle::from_section(
        format!("  {} {}", if checked { "✓" } else { "✗" }, label),
        TextStyle {
            font_size: 13.0,
            color: if checked {
                Color::rgb(0.4, 0.9, 0.4)
            } else {
                Color::rgb(0.5, 0.5, 0.5)
            },
            ..default()
        },
    ));
}

// Helper function to create clickable property toggle
fn add_property_toggle(parent: &mut ChildBuilder, label: &str, checked: bool, toggle_component: ToggleObjectProperty) {
    parent
        .spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(5.0)),
                    margin: UiRect::vertical(Val::Px(2.0)),
                    border: UiRect::all(Val::Px(1.0)),
                    ..default()
                },
                background_color: if checked {
                    Color::rgb(0.2, 0.4, 0.2)
                } else {
                    Color::rgb(0.2, 0.2, 0.2)
                }.into(),
                border_color: if checked {
                    Color::rgb(0.4, 0.8, 0.4)
                } else {
                    Color::rgb(0.4, 0.4, 0.4)
                }.into(),
                ..default()
            },
            toggle_component,
        ))
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("  {} {}", if checked { "✓" } else { "✗" }, label),
                TextStyle {
                    font_size: 13.0,
                    color: if checked {
                        Color::rgb(0.4, 0.9, 0.4)
                    } else {
                        Color::rgb(0.6, 0.6, 0.6)
                    },
                    ..default()
                },
            ));
        });
}

// Helper function to create text input fields
fn add_text_field(parent: &mut ChildBuilder, label: &str, field_id: &str, value: &str, max_length: usize) {
    parent.spawn(TextBundle::from_section(
        label,
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent
        .spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    border: UiRect::all(Val::Px(2.0)),
                    width: Val::Percent(100.0),
                    ..default()
                },
                background_color: Color::rgb(0.2, 0.2, 0.25).into(),
                border_color: Color::rgb(0.4, 0.6, 0.9).into(),
                ..default()
            },
            TextInput::new(field_id, label)
                .with_value(value.to_string())
                .with_max_length(max_length),
        ))
        .with_children(|p| {
            p.spawn((
                TextBundle::from_section(
                    value.to_string(),
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ),
                TextInputLabel {
                    for_field_id: field_id.to_string(),
                },
            ));
        });
}

/// Handle save object button
pub fn handle_save_object_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &SaveObjectButton),
        Changed<Interaction>,
    >,
    text_inputs: Query<&TextInput>,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == button.object_id) {
                for input in text_inputs.iter() {
                    if input.field_id == format!("object_{}_name", button.object_id) {
                        obj.name = input.value.clone();
                    } else if input.field_id == format!("object_{}_noun", button.object_id) {
                        obj.noun = input.value.clone();
                    } else if input.field_id == format!("object_{}_adj", button.object_id) {
                        obj.adjective = input.value.clone();
                    } else if input.field_id == format!("object_{}_desc", button.object_id) {
                        obj.description = input.value.clone();
                    } else if input.field_id == format!("object_{}_icon", button.object_id) {
                        obj.icon = input.value.clone();
                    } else if input.field_id == format!("object_{}_weight", button.object_id) {
                        if let Ok(weight) = input.value.parse::<u8>() {
                            obj.weight = weight;
                        }
                    } else if input.field_id == format!("object_{}_location", button.object_id) {
                        if let Ok(loc_code) = input.value.parse::<u8>() {
                            use crate::daad::types::ObjectLocation;
                            obj.location = match loc_code {
                                252 => ObjectLocation::Limbo,
                                253 => ObjectLocation::Worn,
                                254 => ObjectLocation::Carried,
                                id => ObjectLocation::Location(id),
                            };
                        }
                    }
                }

                state.unsaved_changes = true;
                state.editing = None;
                info!("Saved changes to object {}", button.object_id);
            }
        }
    }
}

/// Handle save location button
pub fn handle_save_location_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &SaveLocationButton),
        Changed<Interaction>,
    >,
    text_inputs: Query<&TextInput>,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            if let Some(loc) = state.current_game.locations.iter_mut().find(|l| l.id == button.location_id) {
                for input in text_inputs.iter() {
                    if input.field_id == format!("location_{}_name", button.location_id) {
                        loc.name = input.value.clone();
                    } else if input.field_id == format!("location_{}_desc", button.location_id) {
                        loc.description = input.value.clone();
                    } else if input.field_id == format!("location_{}_image", button.location_id) {
                        loc.image_file = if input.value.is_empty() {
                            None
                        } else {
                            Some(input.value.clone())
                        };
                    } else if input.field_id == format!("location_{}_picid", button.location_id) {
                        loc.picture_id = input.value.parse::<u8>().ok();
                    } else if input.field_id == format!("location_{}_sound", button.location_id) {
                        loc.sound_file = if input.value.is_empty() {
                            None
                        } else {
                            Some(input.value.clone())
                        };
                    } else if input.field_id == format!("location_{}_soundid", button.location_id) {
                        loc.sound_id = input.value.parse::<u8>().ok();
                    } else if input.field_id == format!("location_{}_music", button.location_id) {
                        loc.music_file = if input.value.is_empty() {
                            None
                        } else {
                            Some(input.value.clone())
                        };
                    } else if input.field_id == format!("location_{}_musicid", button.location_id) {
                        loc.music_id = input.value.parse::<u8>().ok();
                    }
                }

                state.unsaved_changes = true;
                state.editing = None;
                info!("Saved changes to location {}", button.location_id);
            }
        }
    }
}

#[derive(Component)]
pub(crate) struct PropertyEditorPanel;

#[derive(Component)]
pub(crate) struct GameInfoEditor;

#[derive(Component)]
pub(crate) struct SaveGameInfoButton;

#[derive(Component)]
pub(crate) struct SaveFlagButton {
    flag_id: u8,
}

#[derive(Component)]
pub(crate) struct SaveMessageButton {
    message_index: usize,
}

#[derive(Component)]
pub(crate) struct SaveObjectButton {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct SaveLocationButton {
    location_id: u8,
}

#[derive(Component)]
pub(crate) struct CloseEditorButton;

#[derive(Component)]
pub(crate) struct ApplyContainerPresetButton {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct ApplyLightSourcePresetButton {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct ApplyReadablePresetButton {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct DeleteObjectButton {
    pub object_id: u8,
}

#[derive(Component)]
pub(crate) struct DeleteFlagButton {
    pub flag_id: u8,
}

#[derive(Component)]
pub(crate) struct DeleteMessageButton {
    pub message_index: usize,
}

#[derive(Component)]
pub(crate) struct DeleteRuleButton {
    pub rule_index: usize,
}

#[derive(Component)]
pub(crate) struct DeleteActionButton {
    pub rule_index: usize,
    pub action_index: usize,
}

#[derive(Component, Clone, Copy)]
pub(crate) enum ToggleObjectProperty {
    Container(u8),
    Wearable(u8),
    Takeable(u8),
    Openable(u8),
    Open(u8),
    Lockable(u8),
    Locked(u8),
    LightSource(u8),
    Lit(u8),
    Vehicle(u8),
    CanContainPlayer(u8),
}

#[derive(Component)]
pub(crate) struct ToggleLocationDark {
    pub location_id: u8,
}

/// Handle property toggle buttons
pub fn handle_toggle_object_property(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleObjectProperty),
        Changed<Interaction>,
    >,
) {
    for (interaction, toggle) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            match toggle {
                ToggleObjectProperty::Container(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_container = !obj.is_container;
                        state.unsaved_changes = true;
                        info!("Toggled is_container for object {}", id);
                    }
                }
                ToggleObjectProperty::Wearable(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_wearable = !obj.is_wearable;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Takeable(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_takeable = !obj.is_takeable;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Openable(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_openable = !obj.is_openable;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Open(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_open = !obj.is_open;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Lockable(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_lockable = !obj.is_lockable;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Locked(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_locked = !obj.is_locked;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::LightSource(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_light_source = !obj.is_light_source;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Lit(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_lit = !obj.is_lit;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::Vehicle(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.is_vehicle = !obj.is_vehicle;
                        state.unsaved_changes = true;
                    }
                }
                ToggleObjectProperty::CanContainPlayer(id) => {
                    if let Some(obj) = state.current_game.objects.iter_mut().find(|o| o.id == *id) {
                        obj.can_contain_player = !obj.can_contain_player;
                        state.unsaved_changes = true;
                    }
                }
            }
        }
    }
}

/// Handle location darkness toggle
pub fn handle_toggle_location_dark(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ToggleLocationDark),
        Changed<Interaction>,
    >,
) {
    for (interaction, toggle) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(loc) = state.current_game.locations.iter_mut().find(|l| l.id == toggle.location_id) {
                loc.is_dark = !loc.is_dark;
                state.unsaved_changes = true;
                info!("Toggled is_dark for location {}", toggle.location_id);
            }
        }
    }
}

/// Handle delete object button
pub fn handle_delete_object_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteObjectButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.current_game.objects.retain(|obj| obj.id != button.object_id);
            state.unsaved_changes = true;
            state.editing = None;
            info!("Deleted object {}", button.object_id);
        }
    }
}

/// Handle delete flag button
pub fn handle_delete_flag_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteFlagButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.current_game.flags.retain(|flag| flag.id != button.flag_id);
            state.unsaved_changes = true;
            state.editing = None;
            info!("Deleted flag {}", button.flag_id);
        }
    }
}

/// Handle delete message button
pub fn handle_delete_message_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteMessageButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if button.message_index < state.current_game.messages.len() {
                state.current_game.messages.remove(button.message_index);
                state.unsaved_changes = true;
                state.editing = None;
                info!("Deleted message {}", button.message_index);
            }
        }
    }
}

/// Handle delete rule button
pub fn handle_delete_rule_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteRuleButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.current_game.rules.retain(|rule| rule.id != button.rule_index);
            state.unsaved_changes = true;
            state.editing = None;
            info!("Deleted rule {}", button.rule_index);
        }
    }
}

/// Handle delete action button
pub fn handle_delete_action_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteActionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == button.rule_index) {
                if button.action_index < rule.actions.len() {
                    rule.actions.remove(button.action_index);
                    state.unsaved_changes = true;
                    info!("Deleted action {} from rule {}", button.action_index, button.rule_index);
                }
            }
        }
    }
}
