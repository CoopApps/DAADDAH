use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode};
use crate::daad::types::{Condition, ConditionType};

/// Visual condition builder panel for rules
pub fn render_condition_builder(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ConditionBuilderPanel>>,
) {
    // Only show when editing a rule
    if !matches!(state.editing, Some(EditMode::Rule(_))) {
        // Clean up if not editing a rule
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    let Some(EditMode::Rule(rule_id)) = &state.editing else {
        return;
    };

    let Some(rule) = state.current_game.rules.iter().find(|r| r.id == *rule_id) else {
        return;
    };

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create condition builder panel
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(270.0),
                    top: Val::Px(150.0),
                    width: Val::Px(450.0),
                    height: Val::Px(500.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(15.0)),
                    row_gap: Val::Px(10.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.10, 0.12, 0.15, 0.95).into(),
                border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                ..default()
            },
            ConditionBuilderPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                format!("⚙️ Conditions for: {}", rule.name),
                TextStyle {
                    font_size: 16.0,
                    color: Color::rgb(0.9, 0.9, 1.0),
                    ..default()
                },
            ));

            // Instruction text
            parent.spawn(TextBundle::from_section(
                "Build IF conditions (all must be true):",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Add condition button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::vertical(Val::Px(5.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddConditionBuilderButton { rule_id: *rule_id },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Condition",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List existing conditions
            for (idx, condition) in rule.conditions.iter().enumerate() {
                render_condition_card(parent, condition, idx, *rule_id);
            }

            if rule.conditions.is_empty() {
                parent.spawn(TextBundle::from_section(
                    "No conditions (rule always fires)",
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }
        });
}

/// Render a single condition card
fn render_condition_card(
    parent: &mut ChildBuilder,
    condition: &Condition,
    idx: usize,
    rule_id: usize,
) {
    parent
        .spawn((
            NodeBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(10.0)),
                    margin: UiRect::vertical(Val::Px(3.0)),
                    border: UiRect::all(Val::Px(1.0)),
                    flex_direction: FlexDirection::Row,
                    justify_content: JustifyContent::SpaceBetween,
                    align_items: AlignItems::Center,
                    ..default()
                },
                background_color: Color::rgb(0.15, 0.18, 0.22).into(),
                border_color: Color::rgb(0.3, 0.4, 0.5).into(),
                ..default()
            },
            ConditionCard {
                condition_idx: idx,
                rule_id,
            },
        ))
        .with_children(|parent| {
            // Condition description
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Column,
                        flex_grow: 1.0,
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        format!("{}. {}", idx + 1, condition.description()),
                        TextStyle {
                            font_size: 12.0,
                            color: Color::rgb(0.9, 0.95, 1.0),
                            ..default()
                        },
                    ));

                    // Show DAAD code hint
                    parent.spawn(TextBundle::from_section(
                        format_condition_hint(&condition.condition_type),
                        TextStyle {
                            font_size: 10.0,
                            color: Color::rgb(0.5, 0.6, 0.7),
                            ..default()
                        },
                    ));
                });

            // Delete button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(5.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.7, 0.2, 0.2).into(),
                        border_color: Color::rgb(0.9, 0.3, 0.3).into(),
                        ..default()
                    },
                    DeleteConditionButton {
                        condition_idx: idx,
                        rule_id,
                    },
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "✕",
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });
        });
}

/// Format a hint showing what DAAD code will be generated
fn format_condition_hint(condition_type: &ConditionType) -> String {
    match condition_type {
        ConditionType::PlayerAt { location_id } => format!("DAAD: AT {}", location_id),
        ConditionType::ObjectCarried { object_id } => format!("DAAD: CARRIED {}", object_id),
        ConditionType::FlagEquals { flag_id, value } => format!("DAAD: EQ {} {}", flag_id, value),
        ConditionType::FlagGreaterThan { flag_id, value } => format!("DAAD: GT {} {}", flag_id, value),
        ConditionType::ObjectPresent { object_id } => format!("DAAD: PRESENT {}", object_id),
        _ => "DAAD: (complex condition)".to_string(),
    }
}

/// Handle add condition button clicks from condition builder
pub fn handle_add_condition_builder_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &AddConditionBuilderButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Add a simple default condition
            if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == button.rule_id) {
                let new_id = rule.conditions.len();
                rule.conditions.push(Condition {
                    id: new_id,
                    condition_type: ConditionType::IsFirstTurn, // Default condition
                });
                state.unsaved_changes = true;
                info!("Added condition to rule {}", button.rule_id);

                // Open condition type selector
                state.editing = Some(EditMode::ConditionTypeSelector {
                    rule_id: button.rule_id,
                    condition_idx: new_id,
                });
            }
        }
    }
}

/// Handle delete condition button clicks
pub fn handle_delete_condition_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteConditionButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == button.rule_id) {
                if button.condition_idx < rule.conditions.len() {
                    rule.conditions.remove(button.condition_idx);
                    state.unsaved_changes = true;
                    info!("Deleted condition {} from rule {}", button.condition_idx, button.rule_id);
                }
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct ConditionBuilderPanel;

#[derive(Component)]
pub(crate) struct AddConditionBuilderButton {
    rule_id: usize,
}

#[derive(Component)]
pub(crate) struct DeleteConditionButton {
    condition_idx: usize,
    rule_id: usize,
}

#[derive(Component)]
struct ConditionCard {
    condition_idx: usize,
    rule_id: usize,
}
