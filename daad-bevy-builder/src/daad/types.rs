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
            ConditionType::ObjectCarried { object_id } => {
                format!("Player is carrying object {}", object_id)
            }
            ConditionType::ObjectWorn { object_id } => {
                format!("Player is wearing object {}", object_id)
            }
            ConditionType::ObjectAt { object_id, location_id } => {
                format!("Object {} is at location {}", object_id, location_id)
            }
            ConditionType::FlagEquals { flag_id, value } => {
                format!("Flag {} equals {}", flag_id, value)
            }
            ConditionType::FlagGreaterThan { flag_id, value } => {
                format!("Flag {} > {}", flag_id, value)
            }
            ConditionType::FlagLessThan { flag_id, value } => {
                format!("Flag {} < {}", flag_id, value)
            }
            ConditionType::FlagZero { flag_id } => {
                format!("Flag {} is zero", flag_id)
            }
            ConditionType::VerbIs { verb } => {
                format!("Command verb is '{}'", verb)
            }
            ConditionType::NounIs { noun } => {
                format!("Command noun is '{}'", noun)
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
    ObjectCarried { object_id: u8 },
    ObjectWorn { object_id: u8 },
    ObjectAt { object_id: u8, location_id: u8 },

    // Flag conditions
    FlagEquals { flag_id: u8, value: u8 },
    FlagGreaterThan { flag_id: u8, value: u8 },
    FlagLessThan { flag_id: u8, value: u8 },
    FlagZero { flag_id: u8 },

    // Parser conditions
    VerbIs { verb: String },
    NounIs { noun: String },

    // State conditions
    IsFirstTurn,
    TurnCountGreaterThan { turns: u32 },
    ScoreGreaterThan { score: u16 },
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
            ActionType::SetFlag { flag_id, value } => {
                format!("Set flag {} = {}", flag_id, value)
            }
            ActionType::IncrementFlag { flag_id } => {
                format!("Increment flag {}", flag_id)
            }
            ActionType::DecrementFlag { flag_id } => {
                format!("Decrement flag {}", flag_id)
            }
            ActionType::GoToLocation { location_id } => {
                format!("Go to location {}", location_id)
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

    // Flag actions
    SetFlag { flag_id: u8, value: u8 },
    IncrementFlag { flag_id: u8 },
    DecrementFlag { flag_id: u8 },

    // Movement actions
    GoToLocation { location_id: u8 },

    // Flow control
    EndTurn,
    ContinueProcessing,
    SkipRules { count: u8 },

    // Score
    AddScore { points: u16 },
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
