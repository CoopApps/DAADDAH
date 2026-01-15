use bevy::prelude::*;
use serde::{Deserialize, Serialize};

/// Location with visual editor metadata
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,

    // Graphics support
    pub image_file: Option<String>,     // Path to image file (PNG, JPG, GIF)
    pub picture_id: Option<u8>,         // DAAD PICTURE command number (0-255)
    pub auto_show_picture: bool,        // Auto-show image when entering location

    // Sound support (Maluva extensions)
    pub sound_file: Option<String>,     // Path to sound effect file (WAV, MP3)
    pub sound_id: Option<u8>,           // DAAD SOUND command number (0-255)
    pub auto_play_sound: bool,          // Auto-play sound when entering location

    pub music_file: Option<String>,     // Path to music file (MP3, OGG)
    pub music_id: Option<u8>,           // DAAD MUSIC command number (0-255)
    pub auto_play_music: bool,          // Auto-play music when entering location

    // Visual editor metadata
    pub editor_position: Vec2,
    pub editor_color: Color,
}

/// Connection between locations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub direction: Direction,
    pub target_location: u8,
    pub condition: Option<usize>,  // Optional: only open if condition met
}

/// Compass directions for movement
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
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
}

/// Object with visual properties
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Object {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub noun: String,           // "key"
    pub adjective: String,      // "rusty"
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,

    // Advanced object states (for complex puzzles)
    pub is_openable: bool,      // Can be opened/closed
    pub is_open: bool,          // Current open state
    pub is_lockable: bool,      // Can be locked/unlocked
    pub is_locked: bool,        // Current locked state
    pub unlock_key_id: Option<u8>, // Object ID that unlocks this
    pub is_light_source: bool,  // Emits light
    pub is_lit: bool,           // Currently lit
    pub fuel_flag_id: Option<u8>, // Flag tracking remaining fuel
    pub is_vehicle: bool,       // Can be entered and driven
    pub can_contain_player: bool, // Player can be inside (vehicle/container)

    // Visual editor
    pub icon: String,           // Emoji or icon identifier
}

/// Where an object currently is
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ObjectLocation {
    Location(u8),       // At a specific location
    Carried,            // Player carrying it (252)
    Worn,              // Player wearing it (254)
    Inside(u8),        // Inside another object (container)
    Limbo,             // Not in game (253)
}

impl ObjectLocation {
    pub fn to_daad_location(&self) -> u8 {
        match self {
            ObjectLocation::Location(id) => *id,
            ObjectLocation::Carried => 252,
            ObjectLocation::Worn => 254,
            ObjectLocation::Limbo => 253,
            ObjectLocation::Inside(_) => 253, // Containers handled differently
        }
    }
}

/// Rule with visual flowchart data
#[derive(Debug, Clone, Serialize, Deserialize, Component)]
pub struct Rule {
    pub id: usize,
    pub name: String,           // User-friendly name
    pub process: ProcessTable,  // PRO 0-3
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,

    // Visual editor
    pub editor_position: Vec2,
    pub enabled: bool,          // Can disable rules visually
}

/// DAAD's 4 process tables
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ProcessTable {
    Parsing,      // PRO 0 - Intercept commands before parsing
    Response,     // PRO 1 - Respond to player commands
    AutoAction,   // PRO 2 - Automatic actions every turn
    Description,  // PRO 3 - Location descriptions
}

impl ProcessTable {
    pub fn as_num(&self) -> u8 {
        match self {
            ProcessTable::Parsing => 0,
            ProcessTable::Response => 1,
            ProcessTable::AutoAction => 2,
            ProcessTable::Description => 3,
        }
    }

    pub fn from_num(num: u8) -> Self {
        match num {
            0 => ProcessTable::Parsing,
            1 => ProcessTable::Response,
            2 => ProcessTable::AutoAction,
            3 => ProcessTable::Description,
            _ => ProcessTable::Response,
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            ProcessTable::Parsing => "Parsing (intercept commands)",
            ProcessTable::Response => "Response (handle player input)",
            ProcessTable::AutoAction => "Auto-Action (runs every turn)",
            ProcessTable::Description => "Description (location text)",
        }
    }
}

/// Condition (high-level, user-friendly)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Condition {
    pub id: usize,
    pub condition_type: ConditionType,
}

impl Condition {
    pub fn description(&self) -> String {
        match &self.condition_type {
            ConditionType::PlayerAt { location_id } => {
                format!("Player is at location {}", location_id)
            }
            ConditionType::PlayerNotAt { location_id } => {
                format!("Player is NOT at location {}", location_id)
            }
            ConditionType::ObjectPresent { object_id } => {
                format!("Object {} is present", object_id)
            }
            ConditionType::ObjectNotPresent { object_id } => {
                format!("Object {} is NOT present", object_id)
            }
            ConditionType::ObjectCarried { object_id } => {
                format!("Player is carrying object {}", object_id)
            }
            ConditionType::ObjectNotCarried { object_id } => {
                format!("Player is NOT carrying object {}", object_id)
            }
            ConditionType::ObjectWorn { object_id } => {
                format!("Player is wearing object {}", object_id)
            }
            ConditionType::ObjectAt { object_id, location_id } => {
                format!("Object {} is at location {}", object_id, location_id)
            }
            ConditionType::ObjectIsOpen { object_id } => {
                format!("Object {} is open", object_id)
            }
            ConditionType::ObjectIsClosed { object_id } => {
                format!("Object {} is closed", object_id)
            }
            ConditionType::ObjectIsLocked { object_id } => {
                format!("Object {} is locked", object_id)
            }
            ConditionType::ObjectIsUnlocked { object_id } => {
                format!("Object {} is unlocked", object_id)
            }
            ConditionType::ObjectIsLit { object_id } => {
                format!("Object {} is lit", object_id)
            }
            ConditionType::PlayerInsideObject { object_id } => {
                format!("Player is inside object {}", object_id)
            }
            ConditionType::FlagEquals { flag_id, value } => {
                format!("Flag {} == {}", flag_id, value)
            }
            ConditionType::FlagNotEquals { flag_id, value } => {
                format!("Flag {} != {}", flag_id, value)
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                format!("Flag {} > {}", flag_id, value)
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                format!("Flag {} < {}", flag_id, value)
            }
            ConditionType::FlagGreaterOrEqual { flag_id, value } => {
                format!("Flag {} >= {}", flag_id, value)
            }
            ConditionType::FlagLessOrEqual { flag_id, value } => {
                format!("Flag {} <= {}", flag_id, value)
            }
            ConditionType::FlagZero { flag_id } => {
                format!("Flag {} is zero", flag_id)
            }
            ConditionType::FlagNotZero { flag_id } => {
                format!("Flag {} is not zero", flag_id)
            }
            ConditionType::FlagsEqual { flag_id_a, flag_id_b } => {
                format!("Flag {} equals Flag {}", flag_id_a, flag_id_b)
            }
            ConditionType::FlagInRange { flag_id, min, max } => {
                format!("Flag {} is between {} and {}", flag_id, min, max)
            }
            ConditionType::VerbIs { verb } => {
                format!("Command verb is '{}'", verb)
            }
            ConditionType::NounIs { noun } => {
                format!("Command noun is '{}'", noun)
            }
            ConditionType::AdjectiveIs { adjective } => {
                format!("Command adjective is '{}'", adjective)
            }
            ConditionType::IsFirstTurn => {
                "This is the first turn".to_string()
            }
            ConditionType::TurnCountGreaterThan { turns } => {
                format!("Turn count > {}", turns)
            }
            ConditionType::ScoreGreaterThan { score } => {
                format!("Score > {}", score)
            }
            ConditionType::IsDark => {
                "Current location is dark".to_string()
            }
            ConditionType::All { conditions } => {
                format!("ALL of {} conditions", conditions.len())
            }
            ConditionType::Any { conditions } => {
                format!("ANY of {} conditions", conditions.len())
            }
            ConditionType::Not { condition } => {
                format!("NOT ({})", condition.description())
            }
        }
    }
}

/// All possible condition types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConditionType {
    // Location conditions
    PlayerAt { location_id: u8 },
    PlayerNotAt { location_id: u8 },

    // Object conditions
    ObjectPresent { object_id: u8 },
    ObjectNotPresent { object_id: u8 },
    ObjectCarried { object_id: u8 },
    ObjectNotCarried { object_id: u8 },
    ObjectWorn { object_id: u8 },
    ObjectAt { object_id: u8, location_id: u8 },

    // Object state conditions (for advanced puzzles)
    ObjectIsOpen { object_id: u8 },
    ObjectIsClosed { object_id: u8 },
    ObjectIsLocked { object_id: u8 },
    ObjectIsUnlocked { object_id: u8 },
    ObjectIsLit { object_id: u8 },
    PlayerInsideObject { object_id: u8 }, // Player in vehicle/container

    // Flag conditions (basic)
    FlagEquals { flag_id: u8, value: u8 },
    FlagNotEquals { flag_id: u8, value: u8 },
    FlagGreaterThan { flag_id: u8, value: u8 },
    FlagLessThan { flag_id: u8, value: u8 },
    FlagGreaterOrEqual { flag_id: u8, value: u8 },
    FlagLessOrEqual { flag_id: u8, value: u8 },
    FlagZero { flag_id: u8 },
    FlagNotZero { flag_id: u8 },

    // Flag comparison (advanced)
    FlagsEqual { flag_id_a: u8, flag_id_b: u8 },  // Compare two flags
    FlagInRange { flag_id: u8, min: u8, max: u8 }, // flag between min and max

    // Parser conditions
    VerbIs { verb: String },
    NounIs { noun: String },
    AdjectiveIs { adjective: String },

    // State conditions
    IsFirstTurn,
    TurnCountGreaterThan { turns: u32 },
    ScoreGreaterThan { score: u16 },
    IsDark, // Current location is dark

    // Logical combinations
    All { conditions: Vec<Condition> },  // AND - all must be true
    Any { conditions: Vec<Condition> },  // OR - at least one true
    Not { condition: Box<Condition> },   // NOT - invert condition
}

/// Action (high-level, user-friendly)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Action {
    pub id: usize,
    pub action_type: ActionType,
}

impl Action {
    pub fn description(&self) -> String {
        match &self.action_type {
            ActionType::ShowMessage { text } => {
                format!("Display: \"{}\"", text)
            }
            ActionType::ShowLocationDescription => {
                "Show location description".to_string()
            }
            ActionType::ClearScreen => {
                "Clear screen".to_string()
            }
            ActionType::GetObject { object_id } => {
                format!("Pick up object {}", object_id)
            }
            ActionType::DropObject { object_id } => {
                format!("Drop object {}", object_id)
            }
            ActionType::WearObject { object_id } => {
                format!("Wear object {}", object_id)
            }
            ActionType::RemoveObject { object_id } => {
                format!("Remove object {}", object_id)
            }
            ActionType::MoveObject { object_id, to_location } => {
                format!("Move object {} to {:?}", object_id, to_location)
            }
            ActionType::SwapObjects { object_a_id, object_b_id } => {
                format!("Swap locations of objects {} and {}", object_a_id, object_b_id)
            }
            ActionType::DestroyObject { object_id } => {
                format!("Destroy object {} (send to limbo)", object_id)
            }
            ActionType::OpenObject { object_id } => {
                format!("Open object {}", object_id)
            }
            ActionType::CloseObject { object_id } => {
                format!("Close object {}", object_id)
            }
            ActionType::LockObject { object_id } => {
                format!("Lock object {}", object_id)
            }
            ActionType::UnlockObject { object_id } => {
                format!("Unlock object {}", object_id)
            }
            ActionType::LightObject { object_id } => {
                format!("Light object {}", object_id)
            }
            ActionType::ExtinguishObject { object_id } => {
                format!("Extinguish object {}", object_id)
            }
            ActionType::EnterObject { object_id } => {
                format!("Enter object {} (vehicle/container)", object_id)
            }
            ActionType::ExitObject { object_id } => {
                format!("Exit object {}", object_id)
            }
            ActionType::SetFlag { flag_id, value } => {
                format!("Set flag {} = {}", flag_id, value)
            }
            ActionType::IncrementFlag { flag_id } => {
                format!("Increment flag {}", flag_id)
            }
            ActionType::DecrementFlag { flag_id } => {
                format!("Decrement flag {}", flag_id)
            }
            ActionType::AddToFlag { flag_id, amount } => {
                format!("Add {} to flag {}", amount, flag_id)
            }
            ActionType::SubtractFromFlag { flag_id, amount } => {
                format!("Subtract {} from flag {}", amount, flag_id)
            }
            ActionType::ToggleFlag { flag_id } => {
                format!("Toggle flag {} (0<->1)", flag_id)
            }
            ActionType::CopyFlag { from_flag_id, to_flag_id } => {
                format!("Copy flag {} to flag {}", from_flag_id, to_flag_id)
            }
            ActionType::SetFlagToRandom { flag_id, max } => {
                format!("Set flag {} to random value (0-{})", flag_id, max)
            }
            ActionType::MinFlag { flag_id, min_value } => {
                format!("Set flag {} to minimum of {}", flag_id, min_value)
            }
            ActionType::MaxFlag { flag_id, max_value } => {
                format!("Set flag {} to maximum of {}", flag_id, max_value)
            }
            ActionType::GoToLocation { location_id } => {
                format!("Go to location {}", location_id)
            }
            ActionType::ShowPicture { picture_id } => {
                format!("Show picture {}", picture_id)
            }
            ActionType::ClearPicture => {
                "Clear picture".to_string()
            }
            ActionType::PlaySound { sound_id } => {
                format!("Play sound {}", sound_id)
            }
            ActionType::PlayMusic { music_id } => {
                format!("Play music {}", music_id)
            }
            ActionType::StopSound => {
                "Stop sound/music".to_string()
            }
            ActionType::EndTurn => {
                "End turn (DONE)".to_string()
            }
            ActionType::ContinueProcessing => {
                "Continue processing (NOTDONE)".to_string()
            }
            ActionType::SkipRules { count } => {
                format!("Skip {} rules", count)
            }
            ActionType::AddScore { points } => {
                format!("Add {} points to score", points)
            }
            ActionType::SubtractScore { points } => {
                format!("Subtract {} points from score", points)
            }
        }
    }
}

/// All possible action types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ActionType {
    // Display actions
    ShowMessage { text: String },
    ShowLocationDescription,
    ClearScreen,

    // Object actions
    GetObject { object_id: u8 },
    DropObject { object_id: u8 },
    WearObject { object_id: u8 },
    RemoveObject { object_id: u8 },
    MoveObject { object_id: u8, to_location: ObjectLocation },
    SwapObjects { object_a_id: u8, object_b_id: u8 }, // Exchange locations
    DestroyObject { object_id: u8 }, // Send to limbo

    // Object state actions (for complex puzzles)
    OpenObject { object_id: u8 },
    CloseObject { object_id: u8 },
    LockObject { object_id: u8 },
    UnlockObject { object_id: u8 },
    LightObject { object_id: u8 },      // Light a lamp/torch
    ExtinguishObject { object_id: u8 }, // Put out light
    EnterObject { object_id: u8 },      // Get inside vehicle/container
    ExitObject { object_id: u8 },       // Get out of vehicle/container

    // Flag actions (basic)
    SetFlag { flag_id: u8, value: u8 },
    IncrementFlag { flag_id: u8 },
    DecrementFlag { flag_id: u8 },

    // Flag actions (advanced)
    AddToFlag { flag_id: u8, amount: u8 },      // flag += amount
    SubtractFromFlag { flag_id: u8, amount: u8 }, // flag -= amount
    ToggleFlag { flag_id: u8 },                 // flag = !flag (0<->1)
    CopyFlag { from_flag_id: u8, to_flag_id: u8 }, // to = from
    SetFlagToRandom { flag_id: u8, max: u8 },   // flag = random(0..max)
    MinFlag { flag_id: u8, min_value: u8 },     // flag = max(flag, min)
    MaxFlag { flag_id: u8, max_value: u8 },     // flag = min(flag, max)

    // Movement actions
    GoToLocation { location_id: u8 },

    // Graphics & Media
    ShowPicture { picture_id: u8 },      // PICTURE command
    ClearPicture,                         // Clear current image
    PlaySound { sound_id: u8 },          // Maluva sound effect
    PlayMusic { music_id: u8 },          // Maluva background music
    StopSound,                            // Stop current sound/music

    // Flow control
    EndTurn,
    ContinueProcessing,
    SkipRules { count: u8 },

    // Score
    AddScore { points: u16 },
    SubtractScore { points: u16 },
}

/// Flag (game variable)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flag {
    pub id: u8,
    pub name: String,           // User-friendly name
    pub description: String,    // What it represents
    pub initial_value: u8,
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
