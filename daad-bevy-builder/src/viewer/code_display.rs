use bevy::prelude::*;
use crate::builder::state::BuilderState;
use crate::daad::codegen::DaadCodeGenerator;

/// Render the code viewer panel (right side)
pub fn render_code_viewer(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<CodeViewer>>,
) {
    // Clean up old code viewer
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Only render if code viewer is enabled
    if !state.show_code_viewer {
        return;
    }

    // Generate DAAD code from current game
    let daad_code = DaadCodeGenerator::generate(&state.current_game);
    let line_count = daad_code.lines().count();

    // Create code viewer panel
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: Val::Percent(40.0),
                    height: Val::Auto,
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(15.0)),
                    overflow: Overflow::clip_y(),
                    border: UiRect::left(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgb(0.05, 0.05, 0.08).into(),
                border_color: Color::rgb(0.3, 0.3, 0.35).into(),
                ..default()
            },
            CodeViewer,
        ))
        .with_children(|parent| {
            // Header
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        justify_content: JustifyContent::SpaceBetween,
                        margin: UiRect::bottom(Val::Px(10.0)),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "📝 Generated DAAD Code",
                        TextStyle {
                            font_size: 20.0,
                            color: Color::rgb(0.8, 0.9, 1.0),
                            ..default()
                        },
                    ));

                    parent.spawn(TextBundle::from_section(
                        "F1 to toggle",
                        TextStyle {
                            font_size: 12.0,
                            color: Color::rgb(0.5, 0.5, 0.5),
                            ..default()
                        },
                    ));
                });

            // Code display
            parent.spawn(
                TextBundle::from_section(
                    daad_code,
                    TextStyle {
                        font_size: 13.0,
                        color: Color::rgb(0.85, 0.95, 0.85),
                        ..default()
                    },
                )
                .with_style(Style {
                    overflow: Overflow::clip(),
                    ..default()
                }),
            );

            // Footer info
            parent.spawn(TextBundle::from_section(
                format!(
                    "\n{} lines | Live updating",
                    line_count
                ),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.4, 0.4, 0.4),
                    ..default()
                },
            ));
        });
}

#[derive(Component)]
pub(crate) struct CodeViewer;
