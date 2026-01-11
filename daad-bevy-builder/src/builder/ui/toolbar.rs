use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};

/// Render the toolbar with panel buttons
pub fn render_toolbar(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<Toolbar>>,
) {
    // Clean up old toolbar
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    let panels = [
        Panel::GameInfo,
        Panel::Locations,
        Panel::Objects,
        Panel::Rules,
        Panel::Flags,
        Panel::Messages,
        Panel::Preview,
        Panel::Export,
    ];

    // Create toolbar
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(60.0),
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    padding: UiRect::all(Val::Px(10.0)),
                    column_gap: Val::Px(5.0),
                    ..default()
                },
                background_color: Color::rgb(0.12, 0.12, 0.18).into(),
                ..default()
            },
            Toolbar,
        ))
        .with_children(|parent| {
            for panel in panels {
                let is_selected = state.selected_panel == panel;

                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(10.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                ..default()
                            },
                            background_color: if is_selected {
                                Color::rgb(0.3, 0.5, 0.7)
                            } else {
                                Color::rgb(0.2, 0.2, 0.25)
                            }
                            .into(),
                            border_color: if is_selected {
                                Color::rgb(0.4, 0.6, 0.8)
                            } else {
                                Color::rgb(0.3, 0.3, 0.35)
                            }
                            .into(),
                            ..default()
                        },
                        PanelButton { panel },
                    ))
                    .with_children(|parent| {
                        parent.spawn(TextBundle::from_section(
                            format!("{} {}", panel.icon(), panel.as_str()),
                            TextStyle {
                                font_size: 16.0,
                                color: if is_selected {
                                    Color::WHITE
                                } else {
                                    Color::rgb(0.7, 0.7, 0.7)
                                },
                                ..default()
                            },
                        ));
                    });
            }

            // Spacer
            parent.spawn(NodeBundle {
                style: Style {
                    flex_grow: 1.0,
                    ..default()
                },
                ..default()
            });

            // Keyboard shortcuts info
            parent.spawn(TextBundle::from_section(
                "F1: Code | F5: Preview | Ctrl+S: Save | Ctrl+E: Export",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

/// Handle panel button clicks
pub fn handle_toolbar_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &PanelButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.select_panel(button.panel);
        }
    }
}

#[derive(Component)]
pub(crate) struct Toolbar;

#[derive(Component, Clone, Copy)]
pub(crate) struct PanelButton {
    panel: Panel,
}
