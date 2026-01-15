use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode};
use crate::daad::types::ConditionType;

/// Render condition type selector modal
pub fn render_condition_type_selector(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ConditionTypeSelectorModal>>,
) {
    // Only show when in selector mode
    let show = matches!(state.editing, Some(EditMode::ConditionTypeSelector { .. }));

    if !show {
        // Clean up
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    let Some(EditMode::ConditionTypeSelector { rule_id, condition_idx }) = &state.editing else {
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
                    left: Val::Px(300.0),
                    top: Val::Px(100.0),
                    width: Val::Px(650.0),
                    height: Val::Px(650.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(3.0)),
                    ..default()
                },
                background_color: Color::rgba(0.05, 0.08, 0.12, 0.98).into(),
                border_color: Color::rgb(0.5, 0.7, 0.9).into(),
                z_index: ZIndex::Global(100),
                ..default()
            },
            ConditionTypeSelectorModal,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "Select Condition Type",
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
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
                    CloseConditionSelectorButton,
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

            // Location conditions
            render_condition_category(parent, "📍 Location Conditions", &[
                ("Player is at location...", ConditionTypeOption::PlayerAt { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Player NOT at location...", ConditionTypeOption::PlayerNotAt { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Location is dark", ConditionTypeOption::IsDark { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);

            // Object conditions
            render_condition_category(parent, "📦 Object Conditions", &[
                ("Object is present", ConditionTypeOption::ObjectPresent { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object NOT present", ConditionTypeOption::ObjectNotPresent { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Player carrying object", ConditionTypeOption::ObjectCarried { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Player NOT carrying object", ConditionTypeOption::ObjectNotCarried { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Player wearing object", ConditionTypeOption::ObjectWorn { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object at location", ConditionTypeOption::ObjectAt { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);

            // Object state conditions
            render_condition_category(parent, "🔓 Object State Conditions", &[
                ("Object is open", ConditionTypeOption::ObjectIsOpen { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object is closed", ConditionTypeOption::ObjectIsClosed { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object is locked", ConditionTypeOption::ObjectIsLocked { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object is unlocked", ConditionTypeOption::ObjectIsUnlocked { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Object is lit", ConditionTypeOption::ObjectIsLit { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Player inside object", ConditionTypeOption::PlayerInsideObject { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);

            // Flag conditions
            render_condition_category(parent, "🚩 Flag Conditions", &[
                ("Flag equals value", ConditionTypeOption::FlagEquals { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag NOT equals value", ConditionTypeOption::FlagNotEquals { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag > value", ConditionTypeOption::FlagGreaterThan { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag < value", ConditionTypeOption::FlagLessThan { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag >= value", ConditionTypeOption::FlagGreaterOrEqual { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag <= value", ConditionTypeOption::FlagLessOrEqual { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag is zero", ConditionTypeOption::FlagZero { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Flag is NOT zero", ConditionTypeOption::FlagNotZero { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);

            // Parser conditions
            render_condition_category(parent, "💬 Parser Conditions", &[
                ("Command verb is...", ConditionTypeOption::VerbIs { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Command noun is...", ConditionTypeOption::NounIs { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Command adjective is...", ConditionTypeOption::AdjectiveIs { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);

            // Game state conditions
            render_condition_category(parent, "⏱️ Game State Conditions", &[
                ("Is first turn", ConditionTypeOption::IsFirstTurn { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Turn count > value", ConditionTypeOption::TurnCountGreaterThan { rule_id: *rule_id, condition_idx: *condition_idx }),
                ("Score > value", ConditionTypeOption::ScoreGreaterThan { rule_id: *rule_id, condition_idx: *condition_idx }),
            ]);
        });
}

fn render_condition_category(
    parent: &mut ChildBuilder,
    title: &str,
    options: &[(&str, ConditionTypeOption)],
) {
    parent.spawn(TextBundle::from_section(
        title,
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.9, 1.0),
            ..default()
        },
    ));

    for (label, option) in options {
        parent
            .spawn((
                ButtonBundle {
                    style: Style {
                        padding: UiRect::all(Val::Px(8.0)),
                        margin: UiRect::new(Val::Px(10.0), Val::Px(0.0), Val::Px(2.0), Val::Px(2.0)),
                        border: UiRect::all(Val::Px(1.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.2, 0.25, 0.3).into(),
                    border_color: Color::rgb(0.4, 0.5, 0.6).into(),
                    ..default()
                },
                *option,
            ))
            .with_children(|parent| {
                parent.spawn(TextBundle::from_section(
                    *label,
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.9, 0.9, 0.9),
                        ..default()
                    },
                ));
            });
    }
}

/// Handle condition type selection
pub fn handle_condition_type_selection(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ConditionTypeOption),
        Changed<Interaction>,
    >,
) {
    for (interaction, option) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            let (rule_id, condition_idx, condition_type) = match option {
                ConditionTypeOption::PlayerAt { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::PlayerAt { location_id: 0 })
                }
                ConditionTypeOption::PlayerNotAt { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::PlayerNotAt { location_id: 0 })
                }
                ConditionTypeOption::IsDark { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::IsDark)
                }
                ConditionTypeOption::ObjectPresent { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectPresent { object_id: 0 })
                }
                ConditionTypeOption::ObjectNotPresent { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectNotPresent { object_id: 0 })
                }
                ConditionTypeOption::ObjectCarried { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectCarried { object_id: 0 })
                }
                ConditionTypeOption::ObjectNotCarried { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectNotCarried { object_id: 0 })
                }
                ConditionTypeOption::ObjectWorn { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectWorn { object_id: 0 })
                }
                ConditionTypeOption::ObjectAt { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectAt { object_id: 0, location_id: 0 })
                }
                ConditionTypeOption::ObjectIsOpen { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectIsOpen { object_id: 0 })
                }
                ConditionTypeOption::ObjectIsClosed { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectIsClosed { object_id: 0 })
                }
                ConditionTypeOption::ObjectIsLocked { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectIsLocked { object_id: 0 })
                }
                ConditionTypeOption::ObjectIsUnlocked { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectIsUnlocked { object_id: 0 })
                }
                ConditionTypeOption::ObjectIsLit { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ObjectIsLit { object_id: 0 })
                }
                ConditionTypeOption::PlayerInsideObject { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::PlayerInsideObject { object_id: 0 })
                }
                ConditionTypeOption::FlagEquals { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagEquals { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagNotEquals { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagNotEquals { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagGreaterThan { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagGreaterThan { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagLessThan { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagLessThan { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagGreaterOrEqual { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagGreaterOrEqual { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagLessOrEqual { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagLessOrEqual { flag_id: 0, value: 0 })
                }
                ConditionTypeOption::FlagZero { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagZero { flag_id: 0 })
                }
                ConditionTypeOption::FlagNotZero { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::FlagNotZero { flag_id: 0 })
                }
                ConditionTypeOption::VerbIs { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::VerbIs { verb: String::new() })
                }
                ConditionTypeOption::NounIs { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::NounIs { noun: String::new() })
                }
                ConditionTypeOption::AdjectiveIs { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::AdjectiveIs { adjective: String::new() })
                }
                ConditionTypeOption::IsFirstTurn { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::IsFirstTurn)
                }
                ConditionTypeOption::TurnCountGreaterThan { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::TurnCountGreaterThan { turns: 0 })
                }
                ConditionTypeOption::ScoreGreaterThan { rule_id, condition_idx } => {
                    (*rule_id, *condition_idx, ConditionType::ScoreGreaterThan { score: 0 })
                }
            };

            // Update the condition
            if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == rule_id) {
                if condition_idx < rule.conditions.len() {
                    rule.conditions[condition_idx].condition_type = condition_type;
                    state.unsaved_changes = true;
                    info!("Updated condition {} in rule {}", condition_idx, rule_id);
                }
            }

            // Close selector
            state.editing = Some(EditMode::Rule(rule_id));
        }
    }
}

/// Handle close selector button
pub fn handle_close_condition_selector(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CloseConditionSelectorButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Go back to rule editing
            if let Some(EditMode::ConditionTypeSelector { rule_id, .. }) = state.editing {
                state.editing = Some(EditMode::Rule(rule_id));
            }
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct ConditionTypeSelectorModal;

#[derive(Component)]
pub(crate) struct CloseConditionSelectorButton;

#[derive(Component, Copy, Clone)]
pub(crate) enum ConditionTypeOption {
    PlayerAt { rule_id: usize, condition_idx: usize },
    PlayerNotAt { rule_id: usize, condition_idx: usize },
    IsDark { rule_id: usize, condition_idx: usize },
    ObjectPresent { rule_id: usize, condition_idx: usize },
    ObjectNotPresent { rule_id: usize, condition_idx: usize },
    ObjectCarried { rule_id: usize, condition_idx: usize },
    ObjectNotCarried { rule_id: usize, condition_idx: usize },
    ObjectWorn { rule_id: usize, condition_idx: usize },
    ObjectAt { rule_id: usize, condition_idx: usize },
    ObjectIsOpen { rule_id: usize, condition_idx: usize },
    ObjectIsClosed { rule_id: usize, condition_idx: usize },
    ObjectIsLocked { rule_id: usize, condition_idx: usize },
    ObjectIsUnlocked { rule_id: usize, condition_idx: usize },
    ObjectIsLit { rule_id: usize, condition_idx: usize },
    PlayerInsideObject { rule_id: usize, condition_idx: usize },
    FlagEquals { rule_id: usize, condition_idx: usize },
    FlagNotEquals { rule_id: usize, condition_idx: usize },
    FlagGreaterThan { rule_id: usize, condition_idx: usize },
    FlagLessThan { rule_id: usize, condition_idx: usize },
    FlagGreaterOrEqual { rule_id: usize, condition_idx: usize },
    FlagLessOrEqual { rule_id: usize, condition_idx: usize },
    FlagZero { rule_id: usize, condition_idx: usize },
    FlagNotZero { rule_id: usize, condition_idx: usize },
    VerbIs { rule_id: usize, condition_idx: usize },
    NounIs { rule_id: usize, condition_idx: usize },
    AdjectiveIs { rule_id: usize, condition_idx: usize },
    IsFirstTurn { rule_id: usize, condition_idx: usize },
    TurnCountGreaterThan { rule_id: usize, condition_idx: usize },
    ScoreGreaterThan { rule_id: usize, condition_idx: usize },
}
