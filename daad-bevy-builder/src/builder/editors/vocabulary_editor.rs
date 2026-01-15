use bevy::prelude::*;
use crate::builder::state::{BuilderState, Panel};
use crate::daad::game::{VocabEntry, VocabType};

/// Render vocabulary/dictionary editor panel
pub fn render_vocabulary_editor(
    mut commands: Commands,
    state: Res<BuilderState>,
    query: Query<Entity, With<VocabularyPanel>>,
) {
    if state.selected_panel != Panel::Vocabulary {
        // Clean up
        for entity in query.iter() {
            commands.entity(entity).despawn_recursive();
        }
        return;
    }

    // Clean up old panel
    for entity in query.iter() {
        commands.entity(entity).despawn_recursive();
    }

    commands
        .spawn((
            NodeBundle {
                style: Style {
                    position_type: PositionType::Absolute,
                    left: Val::Px(270.0),
                    top: Val::Px(80.0),
                    width: Val::Px(900.0),
                    height: Val::Px(700.0),
                    flex_direction: FlexDirection::Column,
                    padding: UiRect::all(Val::Px(20.0)),
                    row_gap: Val::Px(15.0),
                    overflow: Overflow::clip_y(),
                    border: UiRect::all(Val::Px(2.0)),
                    ..default()
                },
                background_color: Color::rgba(0.10, 0.12, 0.15, 0.95).into(),
                border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                ..default()
            },
            VocabularyPanel,
        ))
        .with_children(|parent| {
            // Header
            parent.spawn(TextBundle::from_section(
                "📖 Vocabulary Dictionary",
                TextStyle {
                    font_size: 20.0,
                    color: Color::rgb(0.9, 0.95, 1.0),
                    ..default()
                },
            ));

            parent.spawn(TextBundle::from_section(
                "Define verbs, nouns, and adjectives for your parser. Add synonyms to make commands more flexible!",
                TextStyle {
                    font_size: 12.0,
                    color: Color::rgb(0.7, 0.7, 0.7),
                    ..default()
                },
            ));

            // Stats
            let verb_count = state.current_game.vocabulary.iter().filter(|v| v.word_type == VocabType::Verb).count();
            let noun_count = state.current_game.vocabulary.iter().filter(|v| v.word_type == VocabType::Noun).count();
            let adj_count = state.current_game.vocabulary.iter().filter(|v| v.word_type == VocabType::Adjective).count();

            parent.spawn(TextBundle::from_section(
                format!("📊 {} verbs | {} nouns | {} adjectives | Max: 255 per type",
                    verb_count, noun_count, adj_count),
                TextStyle {
                    font_size: 11.0,
                    color: Color::rgb(0.6, 0.8, 0.9),
                    ..default()
                },
            ));

            // Add word button
            parent
                .spawn((
                    ButtonBundle {
                        style: Style {
                            padding: UiRect::all(Val::Px(10.0)),
                            margin: UiRect::vertical(Val::Px(5.0)),
                            border: UiRect::all(Val::Px(1.0)),
                            ..default()
                        },
                        background_color: Color::rgb(0.3, 0.6, 0.3).into(),
                        border_color: Color::rgb(0.4, 0.8, 0.4).into(),
                        ..default()
                    },
                    AddVocabWordButton,
                ))
                .with_children(|parent| {
                    parent.spawn(TextBundle::from_section(
                        "+ Add Word",
                        TextStyle {
                            font_size: 13.0,
                            color: Color::WHITE,
                            ..default()
                        },
                    ));
                });

            // Section tabs
            parent
                .spawn(NodeBundle {
                    style: Style {
                        flex_direction: FlexDirection::Row,
                        column_gap: Val::Px(5.0),
                        ..default()
                    },
                    ..default()
                })
                .with_children(|parent| {
                    // Verbs tab
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                                border_color: Color::rgb(0.6, 0.7, 0.8).into(),
                                ..default()
                            },
                            VocabTabButton { vocab_type: VocabType::Verb },
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "Verbs (Actions)",
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });

                    // Nouns tab
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                                border_color: Color::rgb(0.6, 0.7, 0.8).into(),
                                ..default()
                            },
                            VocabTabButton { vocab_type: VocabType::Noun },
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "Nouns (Objects)",
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });

                    // Adjectives tab
                    parent
                        .spawn((
                            ButtonBundle {
                                style: Style {
                                    padding: UiRect::all(Val::Px(8.0)),
                                    border: UiRect::all(Val::Px(1.0)),
                                    ..default()
                                },
                                background_color: Color::rgb(0.4, 0.5, 0.6).into(),
                                border_color: Color::rgb(0.6, 0.7, 0.8).into(),
                                ..default()
                            },
                            VocabTabButton { vocab_type: VocabType::Adjective },
                        ))
                        .with_children(|parent| {
                            parent.spawn(TextBundle::from_section(
                                "Adjectives (Descriptors)",
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::WHITE,
                                    ..default()
                                },
                            ));
                        });
                });

            // Group words by ID to show synonyms
            render_vocabulary_list(parent, &state.current_game.vocabulary, VocabType::Verb);
        });
}

/// Render vocabulary list grouped by word ID (showing synonyms)
fn render_vocabulary_list(
    parent: &mut ChildBuilder,
    vocabulary: &[VocabEntry],
    filter_type: VocabType,
) {
    // Group by ID
    use std::collections::HashMap;
    let mut groups: HashMap<u8, Vec<String>> = HashMap::new();

    for entry in vocabulary.iter().filter(|v| v.word_type == filter_type) {
        groups.entry(entry.id)
            .or_insert_with(Vec::new)
            .push(entry.word.clone());
    }

    // Sort by ID
    let mut sorted_ids: Vec<u8> = groups.keys().copied().collect();
    sorted_ids.sort();

    if sorted_ids.is_empty() {
        parent.spawn(TextBundle::from_section(
            format!("No {} defined yet. Click '+ Add Word' to start.",
                match filter_type {
                    VocabType::Verb => "verbs",
                    VocabType::Noun => "nouns",
                    VocabType::Adjective => "adjectives",
                }),
            TextStyle {
                font_size: 11.0,
                color: Color::rgb(0.6, 0.6, 0.6),
                ..default()
            },
        ));
        return;
    }

    for id in sorted_ids {
        if let Some(words) = groups.get(&id) {
            let primary_word = &words[0];
            let synonyms = if words.len() > 1 {
                format!(" (synonyms: {})", words[1..].join(", "))
            } else {
                String::new()
            };

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
                    VocabCard {
                        word_id: id,
                        word_type: filter_type,
                    },
                ))
                .with_children(|parent| {
                    // Word info
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
                                format!("[ID {}] {}{}", id, primary_word, synonyms),
                                TextStyle {
                                    font_size: 12.0,
                                    color: Color::rgb(0.9, 0.95, 1.0),
                                    ..default()
                                },
                            ));

                            parent.spawn(TextBundle::from_section(
                                format!("DAAD: {} {}", primary_word.to_uppercase(), id),
                                TextStyle {
                                    font_size: 10.0,
                                    color: Color::rgb(0.5, 0.6, 0.7),
                                    ..default()
                                },
                            ));
                        });

                    // Action buttons
                    parent
                        .spawn(NodeBundle {
                            style: Style {
                                flex_direction: FlexDirection::Row,
                                column_gap: Val::Px(5.0),
                                ..default()
                            },
                            ..default()
                        })
                        .with_children(|parent| {
                            // Add synonym button
                            parent
                                .spawn((
                                    ButtonBundle {
                                        style: Style {
                                            padding: UiRect::all(Val::Px(5.0)),
                                            border: UiRect::all(Val::Px(1.0)),
                                            ..default()
                                        },
                                        background_color: Color::rgb(0.3, 0.5, 0.7).into(),
                                        border_color: Color::rgb(0.4, 0.6, 0.8).into(),
                                        ..default()
                                    },
                                    AddSynonymButton {
                                        word_id: id,
                                        word_type: filter_type,
                                    },
                                ))
                                .with_children(|parent| {
                                    parent.spawn(TextBundle::from_section(
                                        "+syn",
                                        TextStyle {
                                            font_size: 10.0,
                                            color: Color::WHITE,
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
                                    DeleteVocabGroupButton {
                                        word_id: id,
                                        word_type: filter_type,
                                    },
                                ))
                                .with_children(|parent| {
                                    parent.spawn(TextBundle::from_section(
                                        "✕",
                                        TextStyle {
                                            font_size: 12.0,
                                            color: Color::WHITE,
                                            ..default()
                                        },
                                    ));
                                });
                        });
                });
        }
    }
}

/// Handle add word button
pub fn handle_add_vocab_word_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        &Interaction,
        (Changed<Interaction>, With<AddVocabWordButton>),
    >,
) {
    for interaction in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Find next available ID
            let verb_ids: Vec<u8> = state.current_game.vocabulary
                .iter()
                .filter(|v| v.word_type == VocabType::Verb)
                .map(|v| v.id)
                .collect();

            let mut next_id = 10u8; // Start at 10 (0-9 reserved for system)
            while verb_ids.contains(&next_id) {
                next_id += 1;
            }

            // Add default verb
            state.current_game.vocabulary.push(VocabEntry {
                word: format!("verb{}", next_id),
                word_type: VocabType::Verb,
                id: next_id,
            });

            state.unsaved_changes = true;
            info!("Added new vocabulary word with ID {}", next_id);
        }
    }
}

/// Handle delete vocab group button
pub fn handle_delete_vocab_group_button(
    mut state: ResMut<BuilderState>,
    mut interaction_query: Query<
        (&Interaction, &DeleteVocabGroupButton),
        Changed<Interaction>,
    >,
) {
    for (interaction, button) in interaction_query.iter() {
        if *interaction == Interaction::Pressed {
            // Remove all words with this ID and type
            state.current_game.vocabulary.retain(|v| {
                !(v.id == button.word_id && v.word_type == button.word_type)
            });

            state.unsaved_changes = true;
            info!("Deleted vocabulary group ID {} ({:?})", button.word_id, button.word_type);
        }
    }
}

// Components
#[derive(Component)]
pub(crate) struct VocabularyPanel;

#[derive(Component)]
pub(crate) struct AddVocabWordButton;

#[derive(Component)]
pub(crate) struct VocabTabButton {
    vocab_type: VocabType,
}

#[derive(Component)]
pub(crate) struct VocabCard {
    word_id: u8,
    word_type: VocabType,
}

#[derive(Component)]
pub(crate) struct AddSynonymButton {
    word_id: u8,
    word_type: VocabType,
}

#[derive(Component)]
pub(crate) struct DeleteVocabGroupButton {
    word_id: u8,
    word_type: VocabType,
}
