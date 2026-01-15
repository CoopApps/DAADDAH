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
                Panel::Vocabulary => {} // Handled by vocabulary_editor.rs
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
        "🎨 Graphics & Media Manager",
        TextStyle {
            font_size: 24.0,
            color: Color::WHITE,
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "\nManage all images, sounds, and music for your adventure game",
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.8, 0.8, 0.8),
            ..default()
        },
    ));

    // Statistics
    let images_count = state.current_game.locations.iter()
        .filter(|l| l.image_file.is_some())
        .count();
    let sounds_count = state.current_game.locations.iter()
        .filter(|l| l.sound_file.is_some())
        .count();
    let music_count = state.current_game.locations.iter()
        .filter(|l| l.music_file.is_some())
        .count();

    parent.spawn(TextBundle::from_section(
        format!("\n📊 Asset Summary: {} images • {} sounds • {} music tracks",
            images_count, sounds_count, music_count),
        TextStyle {
            font_size: 16.0,
            color: Color::rgb(0.5, 0.9, 0.7),
            ..default()
        },
    ));

    // Image Library
    parent.spawn(TextBundle::from_section(
        "\n\n🖼️ Images by Location:",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    if images_count == 0 {
        parent.spawn(TextBundle::from_section(
            "No images assigned yet. Click on a location in the Locations panel\n\
             to add an image file.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for location in state.current_game.locations.iter().filter(|l| l.image_file.is_some()) {
            let image_path = location.image_file.as_ref().unwrap();
            let file_exists = std::path::Path::new(image_path).exists();
            let status_icon = if file_exists { "✅" } else { "❌" };
            let status_color = if file_exists {
                Color::rgb(0.3, 0.9, 0.3)
            } else {
                Color::rgb(0.9, 0.3, 0.3)
            };

            parent.spawn(TextBundle::from_section(
                format!("{} Location {}: {} → {} (PIC #{})",
                    status_icon,
                    location.id,
                    location.name,
                    image_path,
                    location.picture_id.unwrap_or(0)),
                TextStyle {
                    font_size: 13.0,
                    color: status_color,
                    ..default()
                },
            ));
        }
    }

    // Sound Library
    parent.spawn(TextBundle::from_section(
        "\n🔊 Sound Effects by Location:",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    if sounds_count == 0 {
        parent.spawn(TextBundle::from_section(
            "No sound effects assigned yet. Edit a location to add sound files.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for location in state.current_game.locations.iter().filter(|l| l.sound_file.is_some()) {
            let sound_path = location.sound_file.as_ref().unwrap();
            let file_exists = std::path::Path::new(sound_path).exists();
            let status_icon = if file_exists { "✅" } else { "❌" };
            let status_color = if file_exists {
                Color::rgb(0.3, 0.9, 0.3)
            } else {
                Color::rgb(0.9, 0.3, 0.3)
            };
            let auto_play = if location.auto_play_sound { " [AUTO]" } else { "" };

            parent.spawn(TextBundle::from_section(
                format!("{} Location {}: {} → {}{} (SND #{})",
                    status_icon,
                    location.id,
                    location.name,
                    sound_path,
                    auto_play,
                    location.sound_id.unwrap_or(0)),
                TextStyle {
                    font_size: 13.0,
                    color: status_color,
                    ..default()
                },
            ));
        }
    }

    // Music Library
    parent.spawn(TextBundle::from_section(
        "\n🎵 Background Music by Location:",
        TextStyle {
            font_size: 20.0,
            color: Color::rgb(0.7, 0.9, 1.0),
            ..default()
        },
    ));

    if music_count == 0 {
        parent.spawn(TextBundle::from_section(
            "No music tracks assigned yet. Edit a location to add music files.",
            TextStyle {
                font_size: 13.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
    } else {
        for location in state.current_game.locations.iter().filter(|l| l.music_file.is_some()) {
            let music_path = location.music_file.as_ref().unwrap();
            let file_exists = std::path::Path::new(music_path).exists();
            let status_icon = if file_exists { "✅" } else { "❌" };
            let status_color = if file_exists {
                Color::rgb(0.3, 0.9, 0.3)
            } else {
                Color::rgb(0.9, 0.3, 0.3)
            };
            let auto_play = if location.auto_play_music { " [AUTO]" } else { "" };

            parent.spawn(TextBundle::from_section(
                format!("{} Location {}: {} → {}{} (MUS #{})",
                    status_icon,
                    location.id,
                    location.name,
                    music_path,
                    auto_play,
                    location.music_id.unwrap_or(0)),
                TextStyle {
                    font_size: 13.0,
                    color: status_color,
                    ..default()
                },
            ));
        }
    }

    // Tips section
    parent.spawn(TextBundle::from_section(
        "\n\nℹ️ Tips:",
        TextStyle {
            font_size: 18.0,
            color: Color::rgb(0.9, 0.9, 1.0),
            ..default()
        },
    ));

    parent.spawn(TextBundle::from_section(
        "• Use relative paths like 'images/forest.png' or 'sounds/ambient.mp3'\n\
         • Supported formats: PNG, JPG, GIF (images) | WAV, MP3 (audio)\n\
         • Click locations in the Locations panel to edit media properties\n\
         • Green ✅ = file found | Red ❌ = file missing\n\
         • [AUTO] = plays automatically when entering location\n\
         • Use Export → Graphics Database to bundle all media files",
        TextStyle {
            font_size: 13.0,
            color: Color::rgb(0.7, 0.7, 0.8),
            ..default()
        },
    ));
}

#[derive(Component)]
pub(crate) struct PanelContent;
