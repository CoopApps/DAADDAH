use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};

/// Render the active panel content
pub fn render_active_panel(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<PanelContent>>,
) {
    // Clean up old panel content
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    // Create panel content area
    commands
        .spawn((
            NodeBundle {
                style: Style {
                    width: if state.show_code_viewer {
                        Val::Percent(60.0)
                    } else {
                        Val::Percent(100.0)
                    },
                    height: Val::Auto,
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    overflow: Overflow::clip_y(),
                    ..default()
                },
                background_color: Color::rgb(0.08, 0.08, 0.12).into(),
                ..default()
            },
            PanelContent,
        ))
        .with_children(|parent| {
            match state.selected_panel {
                Panel::GameInfo => render_game_info_panel(parent, &state),
                Panel::Locations => render_locations_panel(parent, &state),
                Panel::Objects => render_objects_panel(parent, &state),
                Panel::Rules => render_rules_panel(parent, &state),
                Panel::Flags => render_flags_panel(parent, &state),
                Panel::Messages => render_messages_panel(parent, &state),
                Panel::Graphics => render_graphics_panel(parent, &state),
                Panel::Preview => render_preview_panel(parent, &state),
                Panel::Export => render_export_panel(parent, &state),
            }
        });
}

fn render_game_info_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📋 Game Information",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Title: {}", state.current_game.title),
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Author: {}", state.current_game.author),
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Version: {}", state.current_game.version),
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 0.9),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nStatistics:",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("📍 Locations: {}", state.current_game.locations.len()),
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("📦 Objects: {}", state.current_game.objects.len()),
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("⚙️ Rules: {}", state.current_game.rules.len()),
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("🚩 Flags: {}", state.current_game.flags.len()),
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));
}

fn render_locations_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📍 Locations",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for location in &state.current_game.locations {
        parent.spawn(TextBundle::from_section(
            format!("\n{}: {}", location.id, location.name),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(0.8, 0.9, 1.0),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", location.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        if location.is_dark {
            parent.spawn(TextBundle::from_section(
                "  🌑 Dark Location",
                TextStyle {
                    font_size: 14.0,
                    color: Color::rgb(0.5, 0.5, 0.8),
                    ..default()
                },
            ));
        }
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Location (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_objects_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "📦 Objects",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for object in &state.current_game.objects {
        parent.spawn(TextBundle::from_section(
            format!(
                "\n{} {}: {} {}",
                object.icon, object.id, object.adjective, object.noun
            ),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(0.9, 0.9, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", object.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Location: {:?}", object.location),
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Object (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_rules_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "⚙️ Rules",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for rule in &state.current_game.rules {
        parent.spawn(TextBundle::from_section(
            format!("\n{}: {} [{:?}]", rule.id, rule.name, rule.process),
            TextStyle {
                font_size: 18.0,
                color: if rule.enabled {
                    Color::rgb(0.8, 1.0, 0.8)
                } else {
                    Color::rgb(0.5, 0.5, 0.5)
                },
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Conditions: {}", rule.conditions.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.8, 1.0),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Actions: {}", rule.actions.len()),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(1.0, 0.8, 0.7),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Rule (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_flags_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "🚩 Flags",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for flag in &state.current_game.flags {
        parent.spawn(TextBundle::from_section(
            format!("\nFlag {}: {}", flag.id, flag.name),
            TextStyle {
                font_size: 18.0,
                color: Color::rgb(1.0, 0.8, 0.6),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  {}", flag.description),
            TextStyle {
                font_size: 14.0,
                color: Color::rgb(0.7, 0.7, 0.7),
                ..default()
            },
        ));

        parent.spawn(TextBundle::from_section(
            format!("  Initial value: {}", flag.initial_value),
            TextStyle {
                font_size: 12.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Flag (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_messages_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "💬 Messages",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    for (i, message) in state.current_game.messages.iter().enumerate() {
        parent.spawn(TextBundle::from_section(
            format!("\nMessage {}: {}", i, message),
            TextStyle {
                font_size: 16.0,
                color: Color::rgb(0.9, 0.9, 0.9),
                ..default()
            },
        ));
    }

    parent.spawn(TextBundle::from_section(
        "\n[+] Add New Message (TODO: Button)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.4, 0.8, 0.4),
            ..default()
        },
    ));
}

fn render_preview_panel(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "▶️ Game Preview",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nLive game preview will appear here.",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nPress F5 to toggle preview mode.",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

fn render_export_panel(parent: &mut ChildBuilder, _state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "💾 Export Game",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nExport Options:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n• DAAD Source Code (.txt)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• DDB Database File (.ddb)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• JSON Project File (.json)",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n[Export] buttons coming soon...",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.5, 0.5, 0.5),
            ..default()
        },
    ));
}

fn render_graphics_panel(parent: &mut ChildBuilder, state: &BuilderState) {
    parent.spawn(TextBundle::from_section(
        "🎨 Graphics & Media",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nManage images, sounds, and multimedia for your game",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n📁 Image Library",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        format!("Total images: {} | Used: 0 | Unused: 0",
            state.current_game.locations.iter()
                .filter(|l| l.image_file.is_some())
                .count()),
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.7, 0.7, 0.7),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nℹ️ Graphics System Features:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• Drag & drop images onto locations to assign them\n\
         • Supports PNG, JPG, GIF formats\n\
         • Auto-generates PICTURE commands in DAAD export\n\
         • Each location can have one image\n\
         • Images are numbered 0-255 (DAAD limit)\n\
         • Click on locations to edit image properties",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\n🎵 Sound & Music (Maluva Extensions)",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "Sound effects and music will be added in a future update.\n\
         For now, you can manually add SOUND/MUSIC commands in exported code.",
        TextStyle {
            font_size: 14.0,
            color: Color::rgb(0.6, 0.6, 0.6),
            ..default()
        },
    ));
}

#[derive(Component)]
pub(crate) struct PanelContent;
