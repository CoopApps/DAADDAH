use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode};
use crate::daad::types::*;

/// Ultra-beginner-friendly Flag Calculator
/// Every step is explained with tooltips, examples, and visual guides

/// Tutorial step tracking
#[derive(Resource, Default)]
pub struct FlagCalculatorTutorial {
    pub show_tutorial: bool,
    pub current_step: usize,
    pub completed_steps: Vec<bool>,
}

impl FlagCalculatorTutorial {
    pub fn new() -> Self {
        Self {
            show_tutorial: true, // Show tutorial by default for first-time users
            current_step: 0,
            completed_steps: vec![false; 5], // 5 tutorial steps
        }
    }
}

/// Formula being built in the calculator
#[derive(Clone, Debug)]
pub struct FormulaInProgress {
    pub left_var: Option<u8>,      // Left side variable (flag ID)
    pub operation: Option<MathOperation>,
    pub right_value: FormulaValue,
}

#[derive(Clone, Debug)]
pub enum FormulaValue {
    Number(i16),
    Variable(u8), // Another flag
}

#[derive(Clone, Debug, Copy, PartialEq)]
pub enum MathOperation {
    Set,        // =
    Add,        // +=
    Subtract,   // -=
    Multiply,   // *=
    Divide,     // /=
}

impl MathOperation {
    pub fn symbol(&self) -> &'static str {
        match self {
            MathOperation::Set => "=",
            MathOperation::Add => "+",
            MathOperation::Subtract => "-",
            MathOperation::Multiply => "×",
            MathOperation::Divide => "÷",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            MathOperation::Set => "Set to a value",
            MathOperation::Add => "Add to current value",
            MathOperation::Subtract => "Subtract from current value",
            MathOperation::Multiply => "Multiply current value",
            MathOperation::Divide => "Divide current value",
        }
    }

    pub fn example(&self) -> &'static str {
        match self {
            MathOperation::Set => "health = 100 (set health to exactly 100)",
            MathOperation::Add => "score = score + 10 (add 10 points)",
            MathOperation::Subtract => "health = health - 1 (lose 1 health)",
            MathOperation::Multiply => "score = score × 2 (double the score)",
            MathOperation::Divide => "gold = gold ÷ 2 (halve your gold)",
        }
    }
}

/// Render the flag calculator modal
pub fn render_flag_calculator(
    mut commands: Commands,
    state: Res<BuilderState>,
    tutorial: Res<FlagCalculatorTutorial>,
    formula: Res<FormulaBuilder>,
    query: Query<Entity, With<FlagCalculatorModal>>,
) {
    let show = matches!(state.editing, Some(EditMode::FlagCalculator { .. }));

    if !show {
        // Clean up
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    let Some(EditMode::FlagCalculator { rule_id, action_idx }) = &state.editing else {
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
                    left: Val::Px(0.0),
                    top: Val::Px(0.0),
                    width: Val::Percent(100.0),
                    height: Val::Percent(100.0),
                    justify_content: JustifyContent::Center,
                    align_items: AlignItems::Center,
                    ..default()
                },
                background_color: Color::rgba(0.0, 0.0, 0.0, 0.7).into(),
                z_index: ZIndex::Global(100),
                ..default()
            },
            FlagCalculatorModal,
        ))
        .with_children(|parent| {
            // Main calculator panel
            parent
                .spawn(NodeBundle {
                    style: Style {
                        width: Val::Px(900.0),
                        height: Val::Px(700.0),
                        flex_direction: FlexDirection::Column,
                        padding: UiRect::all(Val::Px(25.0)),
                        row_gap: Val::Px(20.0),
                        border: UiRect::all(Val::Px(3.0)),
                        ..default()
                    },
                    background_color: Color::rgb(0.10, 0.12, 0.15).into(),
                    border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                    ..default()
                })
                .with_children(|parent| {
                    // Header with close button
                    parent
                        .spawn(NodeBundle {
                            style: Style {
                                flex_direction: FlexDirection::Row,
                                justify_content: JustifyContent::SpaceBetween,
                                align_items: AlignItems::Center,
                                margin: UiRect::bottom(Val::Px(10.0)),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "🧮 Flag Calculator - No Math Skills Required!",
                                TextStyle {
                                    font_size: 22.0,
                                    color: Color::rgb(0.9, 0.95, 1.0),
                                    ..default()
                                },
                            ));

                            // Close button
                            parent
                                .spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(8.0)),
                                            border: UiRect::all(Val::Px(1.0)),
                                            ..default()
                                        },
                                        background_color: Color::rgb(0.7, 0.2, 0.2).into(),
                                        border_color: Color::rgb(0.9, 0.3, 0.3).into(),
                                        ..default()
                                    },
                                    CloseFlagCalculatorButton,
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

                    // Tutorial banner (if enabled)
                    if tutorial.show_tutorial {
                        render_tutorial_banner(parent, tutorial.current_step);
                    }

                    // Main instruction text
                    parent.spawn(TextBundle::from_section(
                        "Build math operations by clicking buttons. No typing required!\nExample: Click 'health' → Click '-' → Type '5' → health loses 5 points!",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::rgb(0.7, 0.8, 0.9),
                            ..default()
                        },
                    ));

                    // Current formula display
                    render_formula_display(parent, &formula, &state);

                    // Step 1: Choose a variable
                    render_step_section(parent, "Step 1: What do you want to change?",
                        "Pick a variable (like health, score, keys). These are the numbers your game tracks.",
                        &state, &formula);

                    // Step 2: Choose operation
                    render_operation_buttons(parent, &formula);

                    // Step 3: Choose value
                    render_value_input(parent, &formula);

                    // Preview section
                    render_preview_section(parent, &formula, &state);

                    // Common patterns library
                    render_pattern_library(parent);

                    // Add to rule button
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(15.0)),
                                    margin: UiRect::top(Val::Px(10.0)),
                                    border: UiRect::all(Val::Px(2.0)),
                                    justify_content: JustifyContent::Center,
                                    ..default()
                                },
                                background_color: Color::rgb(0.2, 0.6, 0.2).into(),
                                border_color: Color::rgb(0.3, 0.8, 0.3).into(),
                                ..default()
                            },
                            AddFormulaToRuleButton {
                                rule_id: *rule_id,
                                action_idx: *action_idx,
                            },
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "✓ Add This to My Rule",
                                TextStyle {
                                    font_size: 16.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                });
        });
}

fn render_tutorial_banner(parent: &mut ChildBuilder, step: usize) {
    let tutorial_texts = [
        "Welcome! Let's learn how to change numbers in your game. Click through these 5 quick steps.",
        "Variables are like boxes that hold numbers. 'health' might hold 100, 'score' might hold 0.",
        "Operations are what you DO to the number. '+' means add, '-' means subtract.",
        "Values are the numbers you're working with. Want to lose 5 health? The value is 5.",
        "Preview shows what happens! If health=50 and you subtract 10, it becomes 40. Try it!",
    ];

    parent
        .spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(15.0)),
                margin: UiRect::bottom(Val::Px(10.0)),
                border: UiRect::all(Val::Px(2.0)),
                ..default()
            },
            background_color: Color::rgb(0.2, 0.4, 0.6).into(),
            border_color: Color::rgb(0.3, 0.5, 0.8).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("💡 Tutorial Step {}/5: {}", step + 1, tutorial_texts[step.min(4)]),
                TextStyle {
                    font_size: 13.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));

            // Next/Skip buttons
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(10.0),
                        margin: UiRect::top(Val::Px(10.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    // Next step button
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(6.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                                border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                                ..default()
                            },
                            NextTutorialStepButton,
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "Next Step →",
                                TextStyle {
                                    font_size: 11.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });

                    // Skip tutorial button
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(6.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.5, 0.5, 0.5).into(),
                                border_color: Color::rgb(0.6, 0.6, 0.6).into(),
                                ..default()
                            },
                            SkipTutorialButton,
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "Skip Tutorial",
                                TextStyle {
                                    font_size: 11.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                });
        });
}

fn render_formula_display(parent: &mut ChildBuilder, formula: &FormulaBuilder, state: &BuilderState) {
    // Build formula string
    let mut formula_parts = Vec::new();

    // Left variable
    if let Some(var_id) = formula.left_var {
        if let Some(flag) = state.current_game.flags.iter().find(|f| f.id == var_id) {
            formula_parts.push(flag.name.clone());
        } else {
            formula_parts.push(format!("flag_{}", var_id));
        }
    } else {
        formula_parts.push("???".to_string());
    }

    // Operation
    if let Some(op) = formula.operation {
        formula_parts.push(op.symbol().to_string());
    } else {
        formula_parts.push("?".to_string());
    }

    // Right value
    if let Some(value) = formula.right_value {
        formula_parts.push(value.to_string());
    } else {
        formula_parts.push("???".to_string());
    }

    let formula_text = formula_parts.join(" ");
    let is_complete = formula.left_var.is_some() && formula.operation.is_some() && formula.right_value.is_some();

    parent
        .spawn(NodeBundle {
            style: Style {
                padding: UiRect::all(Val::Px(12.0)),
                margin: UiRect::vertical(Val::Px(10.0)),
                border: UiRect::all(Val::Px(2.0)),
                justify_content: JustifyContent::Center,
                ..default()
            },
            background_color: if is_complete {
                Color::rgb(0.15, 0.25, 0.15)
            } else {
                Color::rgb(0.18, 0.18, 0.18)
            }.into(),
            border_color: if is_complete {
                Color::rgb(0.3, 0.7, 0.3)
            } else {
                Color::rgb(0.3, 0.3, 0.3)
            }.into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                format!("📝 Current Formula: {}", formula_text),
                TextStyle {
                    font_size: 18.0,
                    color: if is_complete {
                        Color::rgb(0.7, 1.0, 0.7)
                    } else {
                        Color::rgb(0.7, 0.7, 0.7)
                    },
                    ..default()
                },
            ));

            if is_complete {
                parent.spawn(TextBundle::from_section(
                    "✓ Ready to add!",
                    TextStyle {
                        font_size: 12.0,
                        color: Color::rgb(0.6, 0.9, 0.6),
                        ..default()
                    },
                ));
            } else {
                parent.spawn(TextBundle::from_section(
                    "Complete all 3 steps to continue",
                    TextStyle {
                        font_size: 11.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }
        });
}

fn render_step_section(parent: &mut ChildBuilder, title: &str, explanation: &str, state: &BuilderState, formula: &FormulaBuilder) {
    parent
        .spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(12.0)),
                row_gap: Val::Px(8.0),
                border: UiRect::all(Val::Px(1.0)),
                ..default()
            },
            background_color: Color::rgb(0.12, 0.14, 0.18).into(),
            border_color: Color::rgb(0.3, 0.4, 0.5).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                title,
                TextStyle {
                    font_size: 15.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                explanation,
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));

            // Variable selection buttons
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        flex_wrap: FlexWrap::Wrap,
                        column_gap: Val::Px(8.0),
                        row_gap: Val::Px(8.0),
                        margin: UiRect::top(Val::Px(8.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    // Show available flags as friendly variable names
                    if state.current_game.flags.is_empty() {
                        parent.spawn(TextBundle::from_section(
                            "No variables yet. Create some in the Flags panel first!",
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.8, 0.6, 0.4),
                                ..default()
                            },
                        ));
                    } else {
                        for flag in state.current_game.flags.iter().take(10) {
                            let is_selected = formula.left_var == Some(flag.id);
                            parent
                                .spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(10.0)),
                                            border: UiRect::all(Val::Px(if is_selected { 3.0 } else { 1.0 })),
                                            ..default()
                                        },
                                        background_color: if is_selected {
                                            Color::rgb(0.4, 0.7, 0.9)
                                        } else {
                                            Color::rgb(0.3, 0.5, 0.7)
                                        }.into(),
                                        border_color: if is_selected {
                                            Color::rgb(0.6, 0.9, 1.0)
                                        } else {
                                            Color::rgb(0.4, 0.6, 0.8)
                                        }.into(),
                                        ..default()
                                    },
                                    SelectVariableButton { flag_id: flag.id },
                                ))
                                .with_children(|parent| {
                                    parent.spawn(TextBundle::from_section(
                                        if is_selected {
                                            format!("✓ {}", &flag.name)
                                        } else {
                                            flag.name.clone()
                                        },
                                        TextStyle {
                                            font_size: 12.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });
                        }
                    }
                });
        });
}

fn render_operation_buttons(parent: &mut ChildBuilder, formula: &FormulaBuilder) {
    parent
        .spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(12.0)),
                row_gap: Val::Px(8.0),
                border: UiRect::all(Val::Px(1.0)),
                ..default()
            },
            background_color: Color::rgb(0.12, 0.14, 0.18).into(),
            border_color: Color::rgb(0.3, 0.4, 0.5).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "Step 2: What do you want to do?",
                TextStyle {
                    font_size: 15.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Choose how to change the number. Hover over each button to see examples!",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));

            // Operation buttons with descriptions
            let operations = [
                MathOperation::Set,
                MathOperation::Add,
                MathOperation::Subtract,
                MathOperation::Multiply,
                MathOperation::Divide,
            ];

            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Column,
                        row_gap: Val::Px(8.0),
                        margin: UiRect::top(Val::Px(8.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    for op in operations {
                        render_operation_card(parent, op, formula);
                    }
                });
        });
}

fn render_operation_card(parent: &mut ChildBuilder, op: MathOperation, formula: &FormulaBuilder) {
    let is_selected = formula.operation == Some(op);
    let (base_bg, base_border) = match op {
        MathOperation::Set => (Color::rgb(0.5, 0.4, 0.6), Color::rgb(0.7, 0.5, 0.8)),
        MathOperation::Add => (Color::rgb(0.3, 0.6, 0.3), Color::rgb(0.4, 0.8, 0.4)),
        MathOperation::Subtract => (Color::rgb(0.7, 0.4, 0.3), Color::rgb(0.9, 0.5, 0.4)),
        MathOperation::Multiply => (Color::rgb(0.4, 0.5, 0.7), Color::rgb(0.5, 0.6, 0.9)),
        MathOperation::Divide => (Color::rgb(0.6, 0.5, 0.4), Color::rgb(0.8, 0.7, 0.5)),
    };

    let (bg_color, border_color) = if is_selected {
        (Color::rgb(base_bg.r() * 1.3, base_bg.g() * 1.3, base_bg.b() * 1.3),
         Color::rgb(base_border.r() * 1.2, base_border.g() * 1.2, base_border.b() * 1.2))
    } else {
        (base_bg, base_border)
    };

    parent
        .spawn((
            ButtonBundle {
                style: Style {
                    padding: UiRect::all(Val::Px(12.0)),
                    border: UiRect::all(Val::Px(if is_selected { 4.0 } else { 2.0 })),
                    flex_direction: FlexDirection::Column,
                    row_gap: Val::Px(4.0),
                    ..default()
                },
                background_color: bg_color.into(),
                border_color: border_color.into(),
                ..default()
            },
            SelectOperationButton { operation: op },
        ))
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                if is_selected {
                    format!("✓ {} {}", op.symbol(), op.description())
                } else {
                    format!("{} {}", op.symbol(), op.description())
                },
                TextStyle {
                    font_size: 13.0,
                    color: Color::WHITE,
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                format!("Example: {}", op.example()),
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgba(1.0, 1.0, 1.0, 0.8),
                    ..default()
                },
            ));
        });
}

fn render_value_input(parent: &mut ChildBuilder, formula: &FormulaBuilder) {
    parent
        .spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(12.0)),
                row_gap: Val::Px(8.0),
                border: UiRect::all(Val::Px(1.0)),
                ..default()
            },
            background_color: Color::rgb(0.12, 0.14, 0.18).into(),
            border_color: Color::rgb(0.3, 0.4, 0.5).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "Step 3: By how much?",
                TextStyle {
                    font_size: 15.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Enter a number, or pick another variable to use its value.",
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.7, 0.8),
                    ..default()
                },
            ));

            // Quick number buttons
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(8.0),
                        margin: UiRect::top(Val::Px(8.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    for num in [1, 5, 10, 25, 50, 100] {
                        let is_selected = formula.right_value == Some(num);
                        parent
                            .spawn((
                                ButtonBundle {
                                    style: Style {
                                        padding: UiRect::all(Val::Px(10.0)),
                                        border: UiRect::all(Val::Px(if is_selected { 3.0 } else { 1.0 })),
                                        ..default()
                                    },
                                    background_color: if is_selected {
                                        Color::rgb(0.5, 0.7, 0.8)
                                    } else {
                                        Color::rgb(0.4, 0.5, 0.6)
                                    }.into(),
                                    border_color: if is_selected {
                                        Color::rgb(0.7, 0.9, 1.0)
                                    } else {
                                        Color::rgb(0.5, 0.6, 0.7)
                                    }.into(),
                                    ..default()
                                },
                                SelectValueButton { value: num },
                            ))
                            .with_children(|parent| {
                                parent.spawn(TextBundle::from_section(
                                    if is_selected {
                                        format!("✓ {}", num)
                                    } else {
                                        num.to_string()
                                    },
                                    TextStyle {
                                        font_size: 13.0,
                                        color: Color::WHITE,
                                        ..default()
                                    },
                                ));
                            });
                    }
                });
        });
}

fn render_preview_section(parent: &mut ChildBuilder, formula: &FormulaBuilder, state: &BuilderState) {
    // Calculate preview text based on current formula
    let mut preview_text = String::from("Select all 3 steps to see preview");

    if let (Some(var_id), Some(op), Some(value)) = (formula.left_var, formula.operation, formula.right_value) {
        let var_name = state.current_game.flags
            .iter()
            .find(|f| f.id == var_id)
            .map(|f| f.name.as_str())
            .unwrap_or("variable");

        let formula_str = format!("{} {} {}", var_name, op.symbol(), value);

        // Calculate examples
        let examples = vec![50, 100, 10];
        let mut results = Vec::new();

        for start_val in examples {
            let result = match op {
                MathOperation::Set => value,
                MathOperation::Add => start_val + value,
                MathOperation::Subtract => (start_val - value).max(0),
                MathOperation::Multiply => start_val * value,
                MathOperation::Divide => if value != 0 { start_val / value } else { start_val },
            };

            results.push(format!("If {} = {} → After: {}", var_name, start_val, result));
        }

        preview_text = format!(
            "Formula: {}\n\n{}",
            formula_str,
            results.join("\n")
        );
    }

    parent
        .spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(15.0)),
                row_gap: Val::Px(8.0),
                border: UiRect::all(Val::Px(2.0)),
                ..default()
            },
            background_color: Color::rgb(0.15, 0.25, 0.15).into(),
            border_color: Color::rgb(0.3, 0.6, 0.3).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "👁️ Preview - See What Happens",
                TextStyle {
                    font_size: 15.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                preview_text,
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.9, 0.7),
                    ..default()
                },
            ));
        });
}

fn render_pattern_library(parent: &mut ChildBuilder) {
    parent
        .spawn(NodeBundle {
            style: Style {
                flex_direction: FlexDirection::Column,
                padding: UiRect::all(Val::Px(12.0)),
                row_gap: Val::Px(8.0),
                border: UiRect::all(Val::Px(1.0)),
                max_height: Val::Px(150.0),
                overflow: Overflow::clip_y(),
                ..default()
            },
            background_color: Color::rgb(0.18, 0.15, 0.12).into(),
            border_color: Color::rgb(0.6, 0.5, 0.4).into(),
            ..default()
        })
        .with_children(|parent| {
            parent.spawn(TextBundle::from_section(
                "📚 Common Patterns - Click to Use",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            let patterns = [
                ("Lose 1 health per turn", "health = health - 1"),
                ("Gain 10 points for action", "score = score + 10"),
                ("Double the score", "score = score × 2"),
                ("Set health to full", "health = 100"),
                ("Items collected × 10 = score", "score = items × 10"),
            ];

            for (desc, formula) in patterns {
                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(8.0)),
                                border: UiRect::all(Val::Px(1.0)),
                                flex_direction: FlexDirection::Column,
                                align_items: AlignItems::Start,
                                ..default()
                            },
                            background_color: Color::rgb(0.25, 0.20, 0.18).into(),
                            border_color: Color::rgb(0.4, 0.35, 0.3).into(),
                            ..default()
                        },
                        UsePatternButton {
                            pattern: formula.to_string(),
                        },
                    ))
                    .with_children(|parent| {
                        parent.spawn(TextBundle::from_section(
                            desc,
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.9, 0.85, 0.8),
                                ..default()
                            },
                        ));
                        parent.spawn(TextBundle::from_section(
                            formula,
                            TextStyle {
                                font_size: 10.0,
                                color: Color::rgb(0.7, 0.65, 0.6),
                                ..default()
                            },
                        ));
                    });
            }
        });
}

/// State for current formula being built
#[derive(Resource, Default)]
pub struct FormulaBuilder {
    pub left_var: Option<u8>,
    pub operation: Option<MathOperation>,
    pub right_value: Option<i16>,
    pub right_var: Option<u8>,
}

// Button handlers
pub fn handle_close_flag_calculator(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<CloseFlagCalculatorButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            state.editing = None;
        }
    }
}

pub fn handle_next_tutorial_step(
    mut tutorial: ResMut<FlagCalculatorTutorial>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<NextTutorialStepButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            let current = tutorial.current_step;
            if current < tutorial.completed_steps.len() - 1 {
                tutorial.completed_steps[current] = true;
                tutorial.current_step += 1;
            } else {
                tutorial.show_tutorial = false;
            }
        }
    }
}

pub fn handle_skip_tutorial(
    mut tutorial: ResMut<FlagCalculatorTutorial>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<SkipTutorialButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            tutorial.show_tutorial = false;
        }
    }
}

pub fn handle_select_variable(
    mut formula: ResMut<FormulaBuilder>,
    mut interaction_query: Query<
        (&Interaction, &SelectVariableButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            formula.left_var = Some(button.flag_id);
            info!("Selected variable: flag {}", button.flag_id);
        }
    }
}

pub fn handle_select_operation(
    mut formula: ResMut<FormulaBuilder>,
    mut interaction_query: Query<
        (&Interaction, &SelectOperationButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            formula.operation = Some(button.operation);
            info!("Selected operation: {:?}", button.operation);
        }
    }
}

pub fn handle_select_value(
    mut formula: ResMut<FormulaBuilder>,
    mut interaction_query: Query<
        (&Interaction, &SelectValueButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            formula.right_value = Some(button.value);
            formula.right_var = None; // Clear variable if number selected
            info!("Selected value: {}", button.value);
        }
    }
}

pub fn handle_add_formula_to_rule(
    mut state: ResMut<BuilderState>,
    formula: Res<FormulaBuilder>,
    mut interaction_query: Query<
        (&Interaction, &AddFormulaToRuleButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Validate formula is complete
            if formula.left_var.is_none() {
                warn!("Cannot add formula: no variable selected");
                continue;
            }
            if formula.operation.is_none() {
                warn!("Cannot add formula: no operation selected");
                continue;
            }
            if formula.right_value.is_none() && formula.right_var.is_none() {
                warn!("Cannot add formula: no value selected");
                continue;
            }

            // Create action(s) based on formula
            if let Some(rule) = state.current_game.rules.iter_mut().find(|r| r.id == button.rule_id) {
                match formula.operation.unwrap() {
                    MathOperation::Set => {
                        if let Some(value) = formula.right_value {
                            let action = Action {
                                id: rule.actions.len(),
                                action_type: ActionType::SetFlag {
                                    flag_id: formula.left_var.unwrap(),
                                    value: value as u8,
                                },
                            };
                            rule.actions.push(action);
                            info!("Added SET formula to rule {}", button.rule_id);
                        }
                    }
                    MathOperation::Add => {
                        // Add multiple increment actions based on value
                        if let Some(value) = formula.right_value {
                            for _ in 0..value.max(1).min(255) {
                                let action = Action {
                                    id: rule.actions.len(),
                                    action_type: ActionType::IncrementFlag {
                                        flag_id: formula.left_var.unwrap(),
                                    },
                                };
                                rule.actions.push(action);
                            }
                            info!("Added ADD formula ({} increments) to rule {}", value, button.rule_id);
                        }
                    }
                    MathOperation::Subtract => {
                        // Add multiple decrement actions based on value
                        if let Some(value) = formula.right_value {
                            for _ in 0..value.max(1).min(255) {
                                let action = Action {
                                    id: rule.actions.len(),
                                    action_type: ActionType::DecrementFlag {
                                        flag_id: formula.left_var.unwrap(),
                                    },
                                };
                                rule.actions.push(action);
                            }
                            info!("Added SUBTRACT formula ({} decrements) to rule {}", value, button.rule_id);
                        }
                    }
                    MathOperation::Multiply | MathOperation::Divide => {
                        // For multiply/divide, add a comment action explaining complex flag math
                        let op_name = if formula.operation.unwrap() == MathOperation::Multiply { "multiply" } else { "divide" };
                        let message = format!(
                            "⚠️ Complex operation: {} flag {} by {} (requires custom flag math implementation)",
                            op_name,
                            formula.left_var.unwrap(),
                            formula.right_value.unwrap_or(1)
                        );

                        let action = Action {
                            id: rule.actions.len(),
                            action_type: ActionType::ShowMessage { text: message },
                        };
                        rule.actions.push(action);

                        warn!("Multiply/Divide requires complex flag math - added comment action");
                        info!("Added {op_name} placeholder to rule {}", button.rule_id);
                    }
                }

                state.mark_dirty();
                state.editing = None;
            }
        }
    }
}

/// Handle pattern library button clicks
pub fn handle_use_pattern(
    mut formula: ResMut<FormulaBuilder>,
    state: Res<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &UsePatternButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Parse pattern string to extract formula
            // Patterns like "health = health - 1" or "score = score + 10"
            let pattern = &button.pattern;

            // Simple pattern parser
            if let Some((var_part, rest)) = pattern.split_once('=') {
                let var_name = var_part.trim();

                // Find flag by name
                if let Some(flag) = state.current_game.flags.iter().find(|f| f.name == var_name) {
                    formula.left_var = Some(flag.id);

                    // Parse operation and value
                    if rest.contains('+') {
                        formula.operation = Some(MathOperation::Add);
                        if let Some(value_str) = rest.split('+').last() {
                            if let Ok(value) = value_str.trim().parse::<i16>() {
                                formula.right_value = Some(value);
                            }
                        }
                    } else if rest.contains('-') {
                        formula.operation = Some(MathOperation::Subtract);
                        if let Some(value_str) = rest.split('-').last() {
                            if let Ok(value) = value_str.trim().parse::<i16>() {
                                formula.right_value = Some(value);
                            }
                        }
                    } else if rest.contains('×') || rest.contains('*') {
                        formula.operation = Some(MathOperation::Multiply);
                        let value_str = rest.replace('×', "").replace('*', "").trim().to_string();
                        if let Ok(value) = value_str.parse::<i16>() {
                            formula.right_value = Some(value);
                        }
                    } else if !rest.contains(var_name) {
                        // Simple set operation (no variable on right side)
                        formula.operation = Some(MathOperation::Set);
                        if let Ok(value) = rest.trim().parse::<i16>() {
                            formula.right_value = Some(value);
                        }
                    }

                    info!("Applied pattern: {}", pattern);
                }
            }
        }
    }
}

/// Clear formula builder when closing calculator
pub fn clear_formula_on_close(
    mut formula: ResMut<FormulaBuilder>,
    state: Res<BuilderState>,
) {
    // Clear formula when calculator is not open
    if !matches!(state.editing, Some(crate::builder::state::EditMode::FlagCalculator { .. })) {
        if formula.left_var.is_some() || formula.operation.is_some() || formula.right_value.is_some() {
            *formula = FormulaBuilder::default();
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct FlagCalculatorModal;

#[derive(Component)]
pub(crate) struct CloseFlagCalculatorButton;

#[derive(Component)]
pub(crate) struct NextTutorialStepButton;

#[derive(Component)]
pub(crate) struct SkipTutorialButton;

#[derive(Component)]
pub(crate) struct SelectVariableButton {
    flag_id: u8,
}

#[derive(Component)]
pub(crate) struct SelectOperationButton {
    operation: MathOperation,
}

#[derive(Component)]
pub(crate) struct SelectValueButton {
    value: i16,
}

#[derive(Component)]
pub(crate) struct AddFormulaToRuleButton {
    rule_id: usize,
    action_idx: usize,
}

#[derive(Component)]
pub(crate) struct UsePatternButton {
    pattern: String,
}
