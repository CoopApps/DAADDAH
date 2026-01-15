use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode};
use crate::builder::ui::text_input::{TextInput, TextInputLabel};
use crate::daad::types::{ActionType, ObjectLocation};

/// Render action type selector modal
pub fn render_action_type_selector(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ActionTypeSelectorModal>>,
) {
    // Only show when in selector mode
    let show = matches!(state.editing, Some(EditMode::ActionTypeSelector { .. }));

    if !show {
        // Clean up
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    let Some(EditMode::ActionTypeSelector { rule_id, action_idx }) = &state.editing else {
        return;
    };

    // Clean up old modal
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create modal overlay
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(250.0),
                    top: Val::Px(50.0),
                    width: Val::Px(700.0),
                    height: Val::Px(700.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.05, 0.08, 0.12, 0.98).into(),
                border_color: Color::rgb(0.9, 0.7, 0.5).into(),
                z_index: ZIndex::Global(100),
                ..default()
            },
            ActionTypeSelectorModal,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "Select Action Type",
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(1.0, 0.95, 0.9),
                    ..default()
                },
            ));

            // Close button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            position_type: PositionType::Absolute,
                            right: Val::Px(10.0),
                            top: Val::Px(10.0),
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.6, 0.2, 0.2).into(),
                        border_color: Color::rgb(0.8, 0.3, 0.3).into(),
                        ..default()
                    },
                    CloseActionSelectorButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕",
                        TextStyle {
                            font_size: 16.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Display actions
            render_action_category(parent, "💬 Display Actions", &[
                ("Show message...", ActionTypeOption::ShowMessage { rule_id: *rule_id, action_idx: *action_idx }),
                ("Show location description", ActionTypeOption::ShowLocationDescription { rule_id: *rule_id, action_idx: *action_idx }),
                ("Clear screen", ActionTypeOption::ClearScreen { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Object actions
            render_action_category(parent, "📦 Object Actions", &[
                ("Get object...", ActionTypeOption::GetObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Drop object...", ActionTypeOption::DropObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Wear object...", ActionTypeOption::WearObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Remove object...", ActionTypeOption::RemoveObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Move object...", ActionTypeOption::MoveObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Destroy object...", ActionTypeOption::DestroyObject { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Object state actions
            render_action_category(parent, "🔧 Object State Actions", &[
                ("Open object...", ActionTypeOption::OpenObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Close object...", ActionTypeOption::CloseObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Lock object...", ActionTypeOption::LockObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Unlock object...", ActionTypeOption::UnlockObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Light object...", ActionTypeOption::LightObject { rule_id: *rule_id, action_idx: *action_idx }),
                ("Extinguish object...", ActionTypeOption::ExtinguishObject { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Flag actions - Basic
            render_action_category(parent, "🚩 Flag Actions (Basic)", &[
                ("Set flag...", ActionTypeOption::SetFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Increment flag...", ActionTypeOption::IncrementFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Decrement flag...", ActionTypeOption::DecrementFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Toggle flag...", ActionTypeOption::ToggleFlag { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Flag actions - Advanced
            render_action_category(parent, "🚩 Flag Actions (Advanced)", &[
                ("Add to flag...", ActionTypeOption::AddToFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Subtract from flag...", ActionTypeOption::SubtractFromFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Copy flag...", ActionTypeOption::CopyFlag { rule_id: *rule_id, action_idx: *action_idx }),
                ("Set flag to random...", ActionTypeOption::SetFlagToRandom { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Movement actions
            render_action_category(parent, "🚶 Movement Actions", &[
                ("Go to location...", ActionTypeOption::GoToLocation { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Graphics & Media
            render_action_category(parent, "🎨 Graphics & Media", &[
                ("Show picture...", ActionTypeOption::ShowPicture { rule_id: *rule_id, action_idx: *action_idx }),
                ("Clear picture", ActionTypeOption::ClearPicture { rule_id: *rule_id, action_idx: *action_idx }),
                ("Play sound...", ActionTypeOption::PlaySound { rule_id: *rule_id, action_idx: *action_idx }),
                ("Play music...", ActionTypeOption::PlayMusic { rule_id: *rule_id, action_idx: *action_idx }),
                ("Stop sound/music", ActionTypeOption::StopSound { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Flow control
            render_action_category(parent, "⚡ Flow Control", &[
                ("End turn", ActionTypeOption::EndTurn { rule_id: *rule_id, action_idx: *action_idx }),
                ("Continue processing", ActionTypeOption::ContinueProcessing { rule_id: *rule_id, action_idx: *action_idx }),
            ]);

            // Score
            render_action_category(parent, "🏆 Score Actions", &[
                ("Add score...", ActionTypeOption::AddScore { rule_id: *rule_id, action_idx: *action_idx }),
                ("Subtract score...", ActionTypeOption::SubtractScore { rule_id: *rule_id, action_idx: *action_idx }),
            ]);
        });
}

fn render_action_category(parent: &mut ChildBuilder, title: &str, actions: &[(&str, ActionTypeOption)]) {
    parent.spawn(TextBundle::from_section(
        title,
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(1.0, 0.9, 0.7),
            ..default()
        },
    ));

    for (label, option) in actions {
        parent
            .spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(10.0)),
                        margin: UiRect::vertical(Val::Px(2.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.25, 0.25, 0.3).into(),
                    border_color: Color::rgb(0.4, 0.4, 0.45).into(),
                    ..default()
                },
                *option,
            ))
            .with_children(|parent| {
                parent.spawn(TextBundle::from_section(
                    *label,
                    TextStyle {
                        font_size: 14.0,
                        color: Color::WHITE,
                        ..default()
                    },
                ));
            });
    }
}

/// Handle action type selection
pub fn handle_action_type_selection(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ActionTypeOption),
        Changed<Interaction>,
    >,
) {
    for (interaction, option) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            match option {
                ActionTypeOption::ShowMessage { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "ShowMessage".to_string(),
                    });
                }
                ActionTypeOption::ShowLocationDescription { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::ShowLocationDescription);
                }
                ActionTypeOption::ClearScreen { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::ClearScreen);
                }
                ActionTypeOption::GetObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "GetObject".to_string(),
                    });
                }
                ActionTypeOption::DropObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "DropObject".to_string(),
                    });
                }
                ActionTypeOption::WearObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "WearObject".to_string(),
                    });
                }
                ActionTypeOption::RemoveObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "RemoveObject".to_string(),
                    });
                }
                ActionTypeOption::MoveObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "MoveObject".to_string(),
                    });
                }
                ActionTypeOption::DestroyObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "DestroyObject".to_string(),
                    });
                }
                ActionTypeOption::OpenObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "OpenObject".to_string(),
                    });
                }
                ActionTypeOption::CloseObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "CloseObject".to_string(),
                    });
                }
                ActionTypeOption::LockObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "LockObject".to_string(),
                    });
                }
                ActionTypeOption::UnlockObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "UnlockObject".to_string(),
                    });
                }
                ActionTypeOption::LightObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "LightObject".to_string(),
                    });
                }
                ActionTypeOption::ExtinguishObject { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "ExtinguishObject".to_string(),
                    });
                }
                ActionTypeOption::SetFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "SetFlag".to_string(),
                    });
                }
                ActionTypeOption::IncrementFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "IncrementFlag".to_string(),
                    });
                }
                ActionTypeOption::DecrementFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "DecrementFlag".to_string(),
                    });
                }
                ActionTypeOption::ToggleFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "ToggleFlag".to_string(),
                    });
                }
                ActionTypeOption::AddToFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "AddToFlag".to_string(),
                    });
                }
                ActionTypeOption::SubtractFromFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "SubtractFromFlag".to_string(),
                    });
                }
                ActionTypeOption::CopyFlag { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "CopyFlag".to_string(),
                    });
                }
                ActionTypeOption::SetFlagToRandom { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "SetFlagToRandom".to_string(),
                    });
                }
                ActionTypeOption::GoToLocation { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "GoToLocation".to_string(),
                    });
                }
                ActionTypeOption::ShowPicture { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "ShowPicture".to_string(),
                    });
                }
                ActionTypeOption::ClearPicture { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::ClearPicture);
                }
                ActionTypeOption::PlaySound { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "PlaySound".to_string(),
                    });
                }
                ActionTypeOption::PlayMusic { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "PlayMusic".to_string(),
                    });
                }
                ActionTypeOption::StopSound { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::StopSound);
                }
                ActionTypeOption::EndTurn { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::EndTurn);
                }
                ActionTypeOption::ContinueProcessing { rule_id, action_idx } => {
                    add_action(&mut state, *rule_id, *action_idx, ActionType::ContinueProcessing);
                }
                ActionTypeOption::AddScore { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "AddScore".to_string(),
                    });
                }
                ActionTypeOption::SubtractScore { rule_id, action_idx } => {
                    state.editing = Some(EditMode::ActionEditor {
                        rule_id: *rule_id,
                        action_idx: *action_idx,
                        action_type: "SubtractScore".to_string(),
                    });
                }
            }
        }
    }
}

fn add_action(state: &mut BuilderState, rule_id: usize, action_idx: usize, action_type: ActionType) {
    if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == rule_id) {
        if action_idx >= rule.actions.len() {
            rule.actions.push(crate::daad::types::Action {
                id: rule.actions.len(),
                action_type,
            });
        } else {
            rule.actions[action_idx].action_type = action_type;
        }
        state.unsaved_changes = true;
        state.editing = None;
        info!("Added/updated action in rule {}", rule_id);
    }
}

/// Handle close button
pub fn handle_close_action_selector(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CloseActionSelectorButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.editing = None;
        }
    }
}

#[derive(Component)]
pub(crate) struct ActionTypeSelectorModal;

#[derive(Component)]
pub(crate) struct CloseActionSelectorButton;

#[derive(Component, Clone, Copy)]
pub(crate) enum ActionTypeOption {
    ShowMessage { rule_id: usize, action_idx: usize },
    ShowLocationDescription { rule_id: usize, action_idx: usize },
    ClearScreen { rule_id: usize, action_idx: usize },
    GetObject { rule_id: usize, action_idx: usize },
    DropObject { rule_id: usize, action_idx: usize },
    WearObject { rule_id: usize, action_idx: usize },
    RemoveObject { rule_id: usize, action_idx: usize },
    MoveObject { rule_id: usize, action_idx: usize },
    DestroyObject { rule_id: usize, action_idx: usize },
    OpenObject { rule_id: usize, action_idx: usize },
    CloseObject { rule_id: usize, action_idx: usize },
    LockObject { rule_id: usize, action_idx: usize },
    UnlockObject { rule_id: usize, action_idx: usize },
    LightObject { rule_id: usize, action_idx: usize },
    ExtinguishObject { rule_id: usize, action_idx: usize },
    SetFlag { rule_id: usize, action_idx: usize },
    IncrementFlag { rule_id: usize, action_idx: usize },
    DecrementFlag { rule_id: usize, action_idx: usize },
    ToggleFlag { rule_id: usize, action_idx: usize },
    AddToFlag { rule_id: usize, action_idx: usize },
    SubtractFromFlag { rule_id: usize, action_idx: usize },
    CopyFlag { rule_id: usize, action_idx: usize },
    SetFlagToRandom { rule_id: usize, action_idx: usize },
    GoToLocation { rule_id: usize, action_idx: usize },
    ShowPicture { rule_id: usize, action_idx: usize },
    ClearPicture { rule_id: usize, action_idx: usize },
    PlaySound { rule_id: usize, action_idx: usize },
    PlayMusic { rule_id: usize, action_idx: usize },
    StopSound { rule_id: usize, action_idx: usize },
    EndTurn { rule_id: usize, action_idx: usize },
    ContinueProcessing { rule_id: usize, action_idx: usize },
    AddScore { rule_id: usize, action_idx: usize },
    SubtractScore { rule_id: usize, action_idx: usize },
}
