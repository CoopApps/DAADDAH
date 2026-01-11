use bevy::prelude::*;
use crate::builder::state::BuilderState;

/// Render the top menu bar
pub fn render_menu(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<MenuBar>>,
) {
    // Clean up old menu
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create new menu bar
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(100.0),
                    height: Val::Px(50.0),
                    flex_direction: FlexDirection::Row,
                    align_items: AlignItems::Center,
                    padding: UiRect::all(Val::Px(10.0)),
                    ..default()
                },
                background_color: Color::rgb(0.15, 0.15, 0.2).into(),
                ..default()
            },
            MenuBar,
        ))
        .with_children(|parent| {
            // Title
            parent.spawn(TextBundle::from_section(
                format!("🎮 DAAD Builder - {}", state.current_game.title),
                TextStyle {
                    font_size: 20.0,
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

            // Unsaved changes indicator
            if state.unsaved_changes {
                parent.spawn(TextBundle::from_section(
                    "● Unsaved Changes",
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(1.0, 0.7, 0.3),
                        ..default()
                    },
                ));
            }

            // File info
            if let Some(path) = &state.current_file_path {
                parent.spawn(TextBundle::from_section(
                    format!("📁 {}", path),
                    TextStyle {
                        font_size: 14.0,
                        color: Color::rgb(0.6, 0.6, 0.6),
                        ..default()
                    },
                ));
            }
        });
}

#[derive(Component)]
pub(crate) struct MenuBar;
