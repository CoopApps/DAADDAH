use serde::{Deserialize, Serialize};

/// Location with visual editor metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    #[serde(default, alias = "exits")]
    pub connections: Vec<Connection>,
    /// Visual editor X position
    #[serde(alias = "x")]
    pub editor_x: f32,
    /// Visual editor Y position
    #[serde(alias = "y")]
    pub editor_y: f32,
    /// Optional image for this location
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image: Option<LocationImage>,
}

/// Image data for a location
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocationImage {
    /// Base64-encoded source image data
    #[serde(default)]
    pub source_data: String,
    /// Y position offset in pixels
    #[serde(default)]
    pub y_position: u16,
    /// Height in pixels
    #[serde(default)]
    pub height: u16,
    /// Platform-specific converted images
    #[serde(skip_serializing_if = "Option::is_none")]
    pub platform_images: Option<std::collections::HashMap<String, PlatformImage>>,
}

/// Platform-specific image format
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformImage {
    /// Base64-encoded image data in platform format
    pub image_data: String,
    /// Platform-specific color mode
    #[serde(skip_serializing_if = "Option::is_none")]
    pub color_mode: Option<String>,
    /// Palette indices if applicable
    #[serde(skip_serializing_if = "Option::is_none")]
    pub palette_indices: Option<Vec<u8>>,
}

/// Connection between locations
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Connection {
    pub direction: Direction,
    pub target_location: u8,
    /// Optional: only open if condition met
    pub condition: Option<usize>,
}

/// Compass directions for movement
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Direction {
    North,
    South,
    East,
    West,
    Up,
    Down,
    Northeast,
    Northwest,
    Southeast,
    Southwest,
    In,
    Out,
}

impl Direction {
    pub fn as_str(&self) -> &'static str {
        match self {
            Direction::North => "NORTH",
            Direction::South => "SOUTH",
            Direction::East => "EAST",
            Direction::West => "WEST",
            Direction::Up => "UP",
            Direction::Down => "DOWN",
            Direction::Northeast => "NORTHEAST",
            Direction::Northwest => "NORTHWEST",
            Direction::Southeast => "SOUTHEAST",
            Direction::Southwest => "SOUTHWEST",
            Direction::In => "IN",
            Direction::Out => "OUT",
        }
    }

    pub fn short(&self) -> &'static str {
        match self {
            Direction::North => "N",
            Direction::South => "S",
            Direction::East => "E",
            Direction::West => "W",
            Direction::Up => "U",
            Direction::Down => "D",
            Direction::Northeast => "NE",
            Direction::Northwest => "NW",
            Direction::Southeast => "SE",
            Direction::Southwest => "SW",
            Direction::In => "IN",
            Direction::Out => "OUT",
        }
    }

    /// Alias for as_str() - returns long direction name
    pub fn long(&self) -> &'static str {
        self.as_str()
    }
}

/// Object with visual properties
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Object {
    pub id: u8,
    #[serde(default = "default_object_name")]
    pub name: String,
    #[serde(default)]
    pub description: String,
    /// "key"
    pub noun: String,
    /// "rusty"
    pub adjective: String,
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,
    pub is_light_source: bool,
    #[serde(rename = "isPSI")]
    pub is_psi: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_capacity: Option<u8>,
    /// Emoji or icon identifier
    #[serde(default)]
    pub icon: String,
    /// Short display text for LISTOBJ ("I can also see: ...")
    /// e.g. "a wooden ruler", "the priest", "Louis Carlyle"
    /// If absent, codegen generates "a [adjective] [noun]" automatically.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub otx_text: Option<String>,
    /// User-defined attribute bit indices (0-15) set for this object.
    /// Maps to the 16 attribute flags in the DAAD OBJ section.
    /// Tested with HASAT/HASNAT condacts.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<u8>>,
}

/// Where an object currently is
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum ObjectLocation {
    /// At a specific location
    #[serde(rename = "at", rename_all = "camelCase")]
    At { location_id: u8 },
    /// Player carrying it (254 in DAAD spec)
    Carried,
    /// Player wearing it (253 in DAAD spec)
    Worn,
    /// Inside another object (container)
    #[serde(rename_all = "camelCase")]
    Inside { container_id: u8 },
    /// Not in game / not created (252 in DAAD spec)
    Limbo,
}

impl ObjectLocation {
    pub fn to_daad_location(&self) -> u8 {
        match self {
            ObjectLocation::At { location_id } => *location_id,
            ObjectLocation::Carried => 254,
            ObjectLocation::Worn => 253,
            ObjectLocation::Limbo => 252,
            ObjectLocation::Inside { .. } => 252,
        }
    }
}

/// Rule / response table entry
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: usize,
    /// User-friendly name
    pub name: String,
    /// Which process table this belongs to.
    /// "PRO0" = location loop events (_ _)
    /// "PRO1"/"PRO5" = response table (verb noun)
    /// "PRO4" = auto-events before input
    pub process: String,
    /// Explicit verb for this rule's verb/noun line in the DSF.
    /// If absent, codegen extracts it from the rule name.
    /// Use "_" to match any verb.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub verb: Option<String>,
    /// Explicit noun for this rule's verb/noun line in the DSF.
    /// If absent, codegen extracts it from the rule name.
    /// Use "_" to match any noun.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub noun: Option<String>,
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,
    /// Can disable rules without deleting them
    pub enabled: bool,
    /// Additional verb/noun triggers sharing the same conditions+actions.
    /// Emitted as stacked ">" headers in DSF (Rabenstein pattern).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub additional_triggers: Option<Vec<VerbNounTrigger>>,
}

/// A verb/noun pair for stacked triggers
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerbNounTrigger {
    pub verb: String,
    pub noun: String,
}

/// Status bar configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatusBarConfig {
    pub paper_color: u8,
    pub ink_color: u8,
    pub show_turns: bool,
    pub show_location_name: bool,
}

/// DAAD's process tables
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProcessTable {
    /// PRO 0 - Location loop (before description)
    Parsing,
    /// PRO 1 - Response to player commands
    Response,
    /// PRO 2 - Parse error handler
    AutoAction,
    /// PRO 3 - Post-description events
    Description,
    /// PRO 4 - Auto-events before input
    PreInput,
    /// PRO 5 - Extended response table
    Extended,
}

impl ProcessTable {
    pub fn as_num(&self) -> u8 {
        match self {
            ProcessTable::Parsing => 0,
            ProcessTable::Response => 1,
            ProcessTable::AutoAction => 2,
            ProcessTable::Description => 3,
            ProcessTable::PreInput => 4,
            ProcessTable::Extended => 5,
        }
    }

    pub fn from_num(num: u8) -> Self {
        match num {
            0 => ProcessTable::Parsing,
            1 => ProcessTable::Response,
            2 => ProcessTable::AutoAction,
            3 => ProcessTable::Description,
            4 => ProcessTable::PreInput,
            5 => ProcessTable::Extended,
            _ => ProcessTable::Response,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            ProcessTable::Parsing => "PRO0 - Location loop events",
            ProcessTable::Response => "PRO1 - Response table",
            ProcessTable::AutoAction => "PRO2 - Parse error handler",
            ProcessTable::Description => "PRO3 - Post-description events",
            ProcessTable::PreInput => "PRO4 - Auto-events before input",
            ProcessTable::Extended => "PRO5 - Extended response table",
        }
    }
}

/// Condition (generic DAAD format)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    #[serde(rename = "type")]
    pub r#type: String,
    pub params: std::collections::HashMap<String, serde_json::Value>,
    /// When true, the first parameter uses DAAD indirection (@).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub indirect: Option<bool>,
}

/// Action (generic DAAD format)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    #[serde(rename = "type")]
    pub r#type: String,
    pub params: std::collections::HashMap<String, serde_json::Value>,
    /// When true, the first parameter uses DAAD indirection (@).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub indirect: Option<bool>,
    /// Inline message text for MESSAGE/MES actions.
    /// When set, codegen emits MESSAGE "text" instead of MESSAGE <index>.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub text: Option<String>,
}

/// Flag (game variable)
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Flag {
    pub id: u8,
    #[serde(default = "default_flag_name")]
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub initial_value: u8,
}

fn default_flag_name() -> String {
    "Unnamed Flag".to_string()
}

fn default_object_name() -> String {
    "Unnamed Object".to_string()
}

impl Default for Flag {
    fn default() -> Self {
        Self {
            id: 0,
            name: "flag_0".to_string(),
            description: "Unnamed flag".to_string(),
            initial_value: 0,
        }
    }
}

/// Vocabulary entry
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VocabEntry {
    pub word: String,
    pub word_type: VocabType,
    pub id: u8,
}

/// Word types supported by DAAD's vocabulary parser.
/// Note: Pronoun and Conjugation are hardcoded by codegen from blank_en.dsf
/// and should not appear in the game's JSON vocabulary array.
/// They are included here for completeness and future tooling support.
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum VocabType {
    Verb,
    Noun,
    Adjective,
    Adverb,
    Preposition,
    Pronoun,
    Conjugation,
}

/// A single music note
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct MusicNote {
    pub note: String,
    pub octave: u8,
    pub duration: u8,
    pub dotted: bool,
}

/// Music track
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Music {
    pub id: u8,
    #[serde(default = "default_music_name")]
    pub name: String,
    pub tempo: u8,
    pub shape: u8,
    pub volume: u16,
    pub notes: Vec<MusicNote>,
}

fn default_music_name() -> String {
    "Unnamed Music".to_string()
}