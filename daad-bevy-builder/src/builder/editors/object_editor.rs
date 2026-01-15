use bevy::prelude::*;
use crate::builder::state::{BuilderState, EditMode, Panel};
use crate::daad::types::ObjectLocation;
use super::location_editor::LocationNode;

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

/// Handle object dragging to location nodes with mouse tracking
pub fn handle_object_to_location_drag(
    mut state: ResMut<BuilderState>,
    mouse_button: Res<Input<MouseButton>>,
    windows: Query<&Window>,
    mut drag_state: Local<Option<ObjectDragState>>,
    object_card_query: Query<(&ObjectCard, &Node, &GlobalTransform)>,
    location_query: Query<(&LocationNode, &Node, &GlobalTransform)>,
) {
    let window = windows.single();

    // Start drag on left-click
    if mouse_button.just_pressed(MouseButton::Left) {
        if let Some(cursor_pos) = window.cursor_position() {
            // Check if clicking on an object card
            for (card, ui_node, transform) in object_card_query.iter() {
                let node_pos = transform.translation().truncate();
                let size = ui_node.size();

                // Check if cursor is over this card
                let half_size = size / 2.0;
                if cursor_pos.x >= node_pos.x - half_size.x && cursor_pos.x <= node_pos.x + half_size.x &&
                   cursor_pos.y >= node_pos.y - half_size.y && cursor_pos.y <= node_pos.y + half_size.y {
                    // Start dragging this object
                    if let Some(object) = state.current_game.objects.iter().find(|o| o.id == card.object_id) {
                        *drag_state = Some(ObjectDragState {
                            object_id: card.object_id,
                            start_pos: cursor_pos,
                            object_name: object.name.clone(),
                            object_icon: object.icon.clone(),
                        });
                        info!("Started dragging object: {}", object.name);
                        break;
                    }
                }
            }
        }
    }

    // Handle drop on release
    if mouse_button.just_released(MouseButton::Left) {
        if let Some(drag) = &*drag_state {
            if let Some(cursor_pos) = window.cursor_position() {
                // Check if dropping on a location node
                let mut target_location_id: Option<u8> = None;
                let mut target_location_name: Option<String> = None;

                // First pass: find target location
                for (loc_node, _ui_node, _transform) in location_query.iter() {
                    if let Some(location) = state.current_game.locations.iter().find(|l| l.id == loc_node.location_id) {
                        let node_pos = location.editor_position;
                        let dx = cursor_pos.x - node_pos.x;
                        let dy = cursor_pos.y - node_pos.y;

                        // Check if cursor is over this location (hit box)
                        if dx.abs() < 60.0 && dy.abs() < 40.0 {
                            target_location_id = Some(loc_node.location_id);
                            target_location_name = Some(location.name.clone());
                            break;
                        }
                    }
                }

                // Second pass: update object if target found
                if let Some(target_id) = target_location_id {
                    let mut object_name = String::new();
                    if let Some(object) = state.current_game.objects.iter_mut().find(|o| o.id == drag.object_id) {
                        object.location = ObjectLocation::Location(target_id);
                        object_name = object.name.clone();
                    }

                    state.unsaved_changes = true;
                    if let Some(loc_name) = target_location_name {
                        info!("Moved object '{}' to location '{}'", object_name, loc_name);
                    }
                }
            }
        }
        *drag_state = None;
    }

    // Cancel drag on right-click or escape
    if mouse_button.just_pressed(MouseButton::Right) {
        *drag_state = None;
    }
}

/// Render visual feedback while dragging an object
pub fn render_object_drag_preview(
    mut commands: Commands,
    windows: Query<&Window>,
    drag_state: Local<Option<ObjectDragState>>,
    query: Query<Entity, With<ObjectDragPreview>>,
) {
    // Clean up old preview
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Only render if dragging
    if let Some(drag) = &*drag_state {
        let window = windows.single();
        if let Some(cursor_pos) = window.cursor_position() {
            // Create floating preview that follows cursor
            commands
                .spawn((
                    NodeBundle {
                        style: Style {
                            position_type: PositionType::Absolute,
                            left: Val::Px(cursor_pos.x + 10.0),
                            top: Val::Px(cursor_pos.y + 10.0),
                            padding: UiRect::all(Val::Px(8.0)),
                            border: UiRect::all(Val::Px(2.0)),
                            ..default()
                        },
                        background_color: Color::rgba(0.2, 0.4, 0.8, 0.9).into(),
                        border_color: Color::rgb(0.5, 0.7, 1.0).into(),
                        z_index: ZIndex::Global(1000),
                        ..default()
                    },
                    ObjectDragPreview,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        format!("{} {}", drag.object_icon, drag.object_name),
                        TextStyle {
                            font_size: 14.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                    parent.spawn(TextBundle::from_section(
                        "Drop on location to place",
                        TextStyle {
                            font_size: 10.0,
                            color: Color::rgb(0.8, 0.9, 1.0),
                            ..default()
                        },
                    ));
                });
        }
    }
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

#[derive(Component)]
pub(crate) struct ObjectDragPreview;

pub(crate) struct ObjectDragState {
    object_id: u8,
    start_pos: Vec2,
    object_name: String,
    object_icon: String,
}
