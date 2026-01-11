use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::daad::types::ObjectLocation;

/// Render object sidebar when Objects panel is active
pub fn render_object_sidebar(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<ObjectSidebar>>,
) {
    // Only render when Objects panel is active
    if state.selected_panel != Panel::Objects {
        return;
    }

    // Clean up old sidebar
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create object sidebar
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    right: Val::Px(10.0),
                    top: Val::Px(100.0),
                    width: Val::Px(250.0),
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
            ObjectSidebar,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "📦 Objects",
                TextStyle {
                    font_size: 18.0,
                    color: Color::rgb(0.8, 0.9, 1.0),
                    ..default()
                },
            ));

            // Add new object button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(8.0)),
                            margin: UiRect::bottom(Val::Px(10.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddObjectButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Object",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // List all objects
            for object in &state.current_game.objects {
                let is_selected = matches!(state.editing, Some(EditMode::Object(id)) if id == object.id);

                parent
                    .spawn((
                        ButtonBundle {
                            style: Style {
                                padding: UiRect::all(Val::Px(8.0)),
                                border: UiRect::all(Val::Px(2.0)),
                                flex_direction: FlexDirection::Column,
                                align_items: AlignItems::FlexStart,
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
                        ObjectCard {
                            object_id: object.id,
                        },
                    ))
                    .with_children(|parent| {
                        // Object icon and name
                        parent.spawn(TextBundle::from_section(
                            format!("{} {}", object.icon, object.name),
                            TextStyle {
                                font_size: 14.0,
                                color: Color::WHITE,
                                ..default()
                            },
                        ));

                        // Adjective and noun
                        parent.spawn(TextBundle::from_section(
                            format!("{} {}", object.adjective, object.noun),
                            TextStyle {
                                font_size: 11.0,
                                color: Color::rgb(0.8, 0.9, 1.0),
                                ..default()
                            },
                        ));

                        // Location info
                        let location_text = match &object.location {
                            ObjectLocation::Location(loc_id) => {
                                if let Some(loc) = state.current_game.locations.iter().find(|l| l.id == *loc_id) {
                                    format!("📍 {}", loc.name)
                                } else {
                                    format!("📍 Location {}", loc_id)
                                }
                            }
                            ObjectLocation::Carried => "👤 Carried".to_string(),
                            ObjectLocation::Worn => "👕 Worn".to_string(),
                            ObjectLocation::Limbo => "🌫️ Limbo".to_string(),
                            ObjectLocation::Inside(container_id) => {
                                if let Some(container) = state.current_game.objects.iter().find(|o| o.id == *container_id) {
                                    format!("📦 Inside {}", container.name)
                                } else {
                                    format!("📦 Inside #{}", container_id)
                                }
                            }
                        };

                        parent.spawn(TextBundle::from_section(
                            location_text,
                            TextStyle {
                                font_size: 10.0,
                                color: Color::rgb(0.6, 0.6, 0.6),
                                ..default()
                            },
                        ));
                    });
            }

            // Instructions
            parent.spawn(TextBundle::from_section(
                "\nDrag objects to locations\nClick to edit properties",
                TextStyle {
                    font_size: 10.0,
                    color: Color::rgb(0.5, 0.5, 0.5),
                    ..default()
                },
            ));
        });
}

/// Handle object card clicks (select for editing)
pub fn handle_object_card_clicks(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &ObjectCard),
        Changed<Interaction>,
    >,
) {
    for (interaction, card) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            state.editing = Some(EditMode::Object(card.object_id));
            info!("Selected object {} for editing", card.object_id);
        }
    }
}

/// Handle add object button
pub fn handle_add_object_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddObjectButton>),
    >,
) {
    for interaction in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Add new object
            let object_count = state.current_game.objects.len();
            let new_id = state.current_game.add_object(
                &format!("Object {}", object_count + 1),
                "thing",
                &format!("A newly created object."),
            );

            state.unsaved_changes = true;
            state.editing = Some(EditMode::Object(new_id));
            info!("Created new object {}", new_id);
        }
    }
}

/// Handle object dragging to location nodes (simplified for now)
/// TODO: Implement proper drag-and-drop with mouse position tracking
pub fn handle_object_to_location_drag(
    _state: ResMut<BuilderState>,
    _mouse_button: Res<Input<MouseButton>>,
) {
    // This will be implemented when we add proper drag-and-drop interaction
    // For now, objects can be moved by editing their properties directly
}

// Components
#[derive(Component)]
pub(crate) struct ObjectSidebar;

#[derive(Component)]
pub(crate) struct ObjectCard {
    object_id: u8,
}

#[derive(Component)]
pub(crate) struct AddObjectButton;
