use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::builder::ui::text_input::{TextInput, TextInputLabel};

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
