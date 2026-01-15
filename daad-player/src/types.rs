// DAAD Types - simplified for standalone player (no Bevy dependencies)
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DaadGame {
    pub title: String,
    pub author: String,
    pub version: String,
    pub locations: Vec<Location>,
    pub objects: Vec<Object>,
    pub rules: Vec<Rule>,
    pub flags: Vec<Flag>,
    pub messages: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Location {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub is_dark: bool,
    pub connections: Vec<Connection>,
    #[serde(default)]
    pub editor_position: EditorPosition,
    #[serde(default)]
    pub editor_color: EditorColor,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EditorPosition {
    pub x: f32,
    pub y: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct EditorColor {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub direction: Direction,
    pub target_location: u8,
    pub condition: Option<usize>,
}

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
            Direction::North => "north",
            Direction::South => "south",
            Direction::East => "east",
            Direction::West => "west",
            Direction::Up => "up",
            Direction::Down => "down",
            Direction::Northeast => "northeast",
            Direction::Northwest => "northwest",
            Direction::Southeast => "southeast",
            Direction::Southwest => "southwest",
            Direction::In => "in",
            Direction::Out => "out",
        }
    }

    pub fn from_str(s: &str) -> Option<Direction> {
        match s.to_uppercase().as_str() {
            "NORTH" | "N" => Some(Direction::North),
            "SOUTH" | "S" => Some(Direction::South),
            "EAST" | "E" => Some(Direction::East),
            "WEST" | "W" => Some(Direction::West),
            "UP" | "U" => Some(Direction::Up),
            "DOWN" | "D" => Some(Direction::Down),
            "NORTHEAST" | "NE" => Some(Direction::Northeast),
            "NORTHWEST" | "NW" => Some(Direction::Northwest),
            "SOUTHEAST" | "SE" => Some(Direction::Southeast),
            "SOUTHWEST" | "SW" => Some(Direction::Southwest),
            "IN" => Some(Direction::In),
            "OUT" => Some(Direction::Out),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Object {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub noun: String,
    pub adjective: String,
    pub location: ObjectLocation,
    pub weight: u8,
    pub is_container: bool,
    pub is_wearable: bool,
    pub is_takeable: bool,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ObjectLocation {
    Location(u8),
    Carried,
    Worn,
    Inside(u8),
    Limbo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub id: usize,
    pub name: String,
    pub process: ProcessTable,
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,
    pub enabled: bool,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum ProcessTable {
    PRO0,
    PRO1,
    PRO2,
    PRO3,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Condition {
    PlayerAt { location_id: u8 },
    ObjectAt { object_id: u8, location_id: u8 },
    FlagEquals { flag_id: u8, value: u8 },
    FlagGreaterThan { flag_id: u8, value: u8 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Action {
    DisplayMessage { message_index: usize },
    MovePlayer { to_location: u8 },
    MoveObject { object_id: u8, to_location: u8 },
    SetFlag { flag_id: u8, value: u8 },
    IncrementFlag { flag_id: u8 },
    DecrementFlag { flag_id: u8 },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Flag {
    pub id: u8,
    pub name: String,
    pub description: String,
    pub initial_value: u8,
}
