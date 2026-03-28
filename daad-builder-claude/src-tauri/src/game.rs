use serde::{Deserialize, Serialize};
use crate::types::*;

/// Complete DAAD game
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DaadGame {
    pub title: String,
    pub author: String,
    pub version: String,
    pub intro_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub walkthrough: Option<Vec<String>>,
    pub part_number: u8,
    pub music: Vec<Music>,
    pub locations: Vec<Location>,
    pub objects: Vec<Object>,
    pub rules: Vec<Rule>,
    pub flags: Vec<Flag>,
    pub messages: Vec<String>,
    pub vocabulary: Vec<VocabEntry>,
    /// Custom system messages (STX overrides).
    /// Sparse map: key = message index (0-64), value = custom text.
    /// Unset indices use default English text from blank_en.dsf.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub system_messages: Option<std::collections::HashMap<u8, String>>,
}

impl Default for DaadGame {
    fn default() -> Self {
        Self {
            title: "My Adventure".to_string(),
            author: "Anonymous".to_string(),
            version: "1.0".to_string(),
            intro_text: None,
            walkthrough: None,
            part_number: 0,
            music: vec![],
            locations: vec![Location {
                id: 0,
                name: "Start Room".to_string(),
                description: "You are in a small room. There is a door to the north.".to_string(),
                is_dark: false,
                connections: vec![],
                editor_x: 400.0,
                editor_y: 300.0,
                image: None,
            }],
            objects: vec![],
            rules: vec![],
            flags: vec![Flag {
                id: 0,
                name: "score".to_string(),
                description: "Player score".to_string(),
                initial_value: 0,
            }],
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
            system_messages: None,
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

    /// Save game to JSON string
    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    /// Load game from JSON string
    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}
