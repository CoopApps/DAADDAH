use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};

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
