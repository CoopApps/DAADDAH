use bevy::prelude::*;
use serde::{Deserialize, Serialize};
use super::types::*;

/// Complete DAAD game
#[derive(Debug, Clone, Serialize, Deserialize, Resource)]
pub struct DaadGame {
    pub title: String,
    pub author: String,
    pub version: String,
    pub locations: Vec<Location>,
    pub objects: Vec<Object>,
    pub rules: Vec<Rule>,
    pub flags: Vec<Flag>,
    pub messages: Vec<String>,
    pub vocabulary: Vec<VocabEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VocabEntry {
    pub word: String,
    pub word_type: VocabType,
    pub id: u8,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum VocabType {
    Verb,
    Noun,
    Adjective,
}

impl Default for DaadGame {
    fn default() -> Self {
        Self {
            title: "My Adventure".to_string(),
            author: "Anonymous".to_string(),
            version: "1.0".to_string(),
            locations: vec![
                Location {
                    id: 0,
                    name: "Start Room".to_string(),
                    description: "You are in a small room. There is a door to the north.".to_string(),
                    is_dark: false,
                    connections: vec![],
                    editor_position: Vec2::new(400.0, 300.0),
                    editor_color: Color::rgb(0.3, 0.5, 0.7),
                }
            ],
            objects: vec![],
            rules: vec![],
            flags: vec![
                Flag {
                    id: 0,
                    name: "score".to_string(),
                    description: "Player score".to_string(),
                    initial_value: 0,
                },
            ],
            messages: vec![
                "OK.".to_string(),
                "You can't see that here.".to_string(),
                "You can't do that.".to_string(),
            ],
            vocabulary: vec![
                VocabEntry {
                    word: "get".to_string(),
                    word_type: VocabType::Verb,
                    id: 10,
                },
                VocabEntry {
                    word: "take".to_string(),
                    word_type: VocabType::Verb,
                    id: 10,
                },
                VocabEntry {
                    word: "drop".to_string(),
                    word_type: VocabType::Verb,
                    id: 18,
                },
            ],
        }
    }
}

impl DaadGame {
    /// Create a new empty game
    pub fn new(title: &str, author: &str) -> Self {
        let mut game = Self::default();
        game.title = title.to_string();
        game.author = author.to_string();
        game
    }

    /// Add a new location
    pub fn add_location(&mut self, name: &str, description: &str) -> u8 {
        let id = self.locations.len() as u8;
        self.locations.push(Location {
            id,
            name: name.to_string(),
            description: description.to_string(),
            is_dark: false,
            connections: vec![],
            editor_position: Vec2::new(400.0 + (id as f32 * 100.0), 300.0),
            editor_color: Color::rgb(0.3, 0.5, 0.7),
        });
        id
    }

    /// Add a new object
    pub fn add_object(&mut self, name: &str, noun: &str, description: &str) -> u8 {
        let id = self.objects.len() as u8;
        self.objects.push(Object {
            id,
            name: name.to_string(),
            description: description.to_string(),
            noun: noun.to_string(),
            adjective: String::new(),
            location: ObjectLocation::Limbo,
            weight: 1,
            is_container: false,
            is_wearable: false,
            is_takeable: true,
            icon: "📦".to_string(),
        });
        id
    }

    /// Add a new rule
    pub fn add_rule(&mut self, name: &str, process: ProcessTable) -> usize {
        let id = self.rules.len();
        self.rules.push(Rule {
            id,
            name: name.to_string(),
            process,
            conditions: vec![],
            actions: vec![],
            editor_position: Vec2::new(100.0, 100.0 + (id as f32 * 80.0)),
            enabled: true,
        });
        id
    }

    /// Add a new flag
    pub fn add_flag(&mut self, name: &str, description: &str) -> u8 {
        let id = self.flags.len() as u8;
        self.flags.push(Flag {
            id,
            name: name.to_string(),
            description: description.to_string(),
            initial_value: 0,
        });
        id
    }

    /// Get location by ID
    pub fn get_location(&self, id: u8) -> Option<&Location> {
        self.locations.iter().find(|l| l.id == id)
    }

    /// Get object by ID
    pub fn get_object(&self, id: u8) -> Option<&Object> {
        self.objects.iter().find(|o| o.id == id)
    }

    /// Get rule by ID
    pub fn get_rule(&self, id: usize) -> Option<&Rule> {
        self.rules.iter().find(|r| r.id == id)
    }

    /// Get flag by ID
    pub fn get_flag(&self, id: u8) -> Option<&Flag> {
        self.flags.iter().find(|f| f.id == id)
    }

    /// Save game to JSON file
    pub fn save_to_file(&self, path: &str) -> Result<(), std::io::Error> {
        let json = serde_json::to_string_pretty(self)?;
        std::fs::write(path, json)?;
        Ok(())
    }

    /// Load game from JSON file
    pub fn load_from_file(path: &str) -> Result<Self, std::io::Error> {
        let json = std::fs::read_to_string(path)?;
        let game: DaadGame = serde_json::from_str(&json)?;
        Ok(game)
    }
}
