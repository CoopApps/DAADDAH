use crate::game::DaadGame;
use crate::types::*;
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use warp::Filter;

/// Shared game state between Tauri and HTTP API
pub type SharedGameState = Arc<Mutex<Option<DaadGame>>>;

/// Standard API response
#[derive(Debug, Serialize, Deserialize)]
pub struct ApiResponse {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
}

/// List response wrapper - matches MCP server expectations
#[derive(Debug, Serialize, Deserialize)]
pub struct ListResponse<T> {
    pub success: bool,
    pub data: Vec<T>,
}

// ============================================================================
// REQUEST STRUCTS
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct LocationRequest {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub is_dark: bool,
    pub editor_x: f32,
    pub editor_y: f32,
}

#[derive(Debug, Deserialize)]
pub struct UpdateLocationRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_dark: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub editor_x: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub editor_y: Option<f32>,
}

#[derive(Debug, Deserialize)]
pub struct ObjectRequest {
    pub name: String,
    pub description: String,
    pub noun: String,
    pub adjective: String,
    pub location: String, // "carried", "worn", "limbo", or location ID
    #[serde(default)]
    pub weight: u8,
    #[serde(default)]
    pub is_container: bool,
    #[serde(default)]
    pub is_wearable: bool,
    #[serde(default = "default_true")]
    pub is_takeable: bool,
    #[serde(default)]
    pub is_light_source: bool,
    #[serde(default)]
    pub is_psi: bool,
    pub container_capacity: Option<u8>,
    #[serde(default = "default_icon")]
    pub icon: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub otx_text: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub attributes: Option<Vec<u8>>,
}

fn default_true() -> bool {
    true
}

fn default_icon() -> String {
    "📦".to_string()
}

#[derive(Debug, Deserialize)]
pub struct UpdateObjectRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub noun: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub adjective: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub weight: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_container: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_wearable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_takeable: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_light_source: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub is_psi: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub container_capacity: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct MoveObjectRequest {
    pub location: String, // "carried", "worn", "limbo", or location ID
}

#[derive(Debug, Deserialize)]
pub struct ConnectionRequest {
    pub from_location: i32,
    pub direction: String,
    pub to_location: i32,
    pub condition: Option<usize>,
}

#[derive(Debug, Deserialize)]
pub struct DeleteConnectionRequest {
    pub from_location: i32,
    pub direction: String,
}

#[derive(Debug, Deserialize)]
pub struct VocabularyRequest {
    pub word: String,
    pub word_type: String, // "verb", "noun", "adjective"
    pub id: i32,
}

#[derive(Debug, Deserialize)]
pub struct FlagRequest {
    pub name: String,
    pub description: String,
    #[serde(default)]
    pub initial_value: u8,
}

#[derive(Debug, Deserialize)]
pub struct UpdateFlagRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub initial_value: Option<u8>,
}

#[derive(Debug, Deserialize)]
pub struct RuleRequest {
    pub name: String,
    pub process: String,
    #[serde(default)]
    pub verb: Option<String>,
    #[serde(default)]
    pub noun: Option<String>,
    pub conditions: Vec<Condition>,
    pub actions: Vec<Action>,
    #[serde(default = "default_true")]
    pub enabled: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub additional_triggers: Option<Vec<crate::types::VerbNounTrigger>>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRuleRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub process: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub conditions: Option<Vec<Condition>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub actions: Option<Vec<Action>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct MessageRequest {
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct MusicRequest {
    pub name: String,
    #[serde(default = "default_tempo")]
    pub tempo: u8,
    #[serde(default)]
    pub shape: u8,
    #[serde(default = "default_volume")]
    pub volume: u16,
    #[serde(default)]
    pub notes: Vec<MusicNote>,
}

fn default_tempo() -> u8 {
    120
}

fn default_volume() -> u16 {
    10000
}

#[derive(Debug, Deserialize)]
pub struct UpdateMusicRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tempo: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub shape: Option<u8>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub volume: Option<u16>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<Vec<MusicNote>>,
}

#[derive(Debug, Deserialize)]
pub struct GameSettingsRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub intro_text: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub part_number: Option<u8>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub system_messages: Option<std::collections::HashMap<u8, String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub status_bar_config: Option<crate::types::StatusBarConfig>,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/// Parse direction string to Direction enum
fn parse_direction(dir: &str) -> Result<Direction, String> {
    match dir.to_lowercase().as_str() {
        "north" | "n" => Ok(Direction::North),
        "south" | "s" => Ok(Direction::South),
        "east" | "e" => Ok(Direction::East),
        "west" | "w" => Ok(Direction::West),
        "up" | "u" => Ok(Direction::Up),
        "down" | "d" => Ok(Direction::Down),
        "northeast" | "ne" => Ok(Direction::Northeast),
        "northwest" | "nw" => Ok(Direction::Northwest),
        "southeast" | "se" => Ok(Direction::Southeast),
        "southwest" | "sw" => Ok(Direction::Southwest),
        "in" => Ok(Direction::In),
        "out" => Ok(Direction::Out),
        _ => Err(format!("Invalid direction: {}", dir)),
    }
}

/// Parse vocab type string to VocabType enum
fn parse_vocab_type(vtype: &str) -> Result<VocabType, String> {
    match vtype.to_lowercase().as_str() {
        "verb" => Ok(VocabType::Verb),
        "noun" => Ok(VocabType::Noun),
        "adjective" | "adj" => Ok(VocabType::Adjective),
        "adverb" | "adv" => Ok(VocabType::Adverb),
        "preposition" | "prep" => Ok(VocabType::Preposition),
        _ => Err(format!("Invalid vocab type: {}", vtype)),
    }
}

/// Parse location string to ObjectLocation
fn parse_object_location(loc: &str) -> Result<ObjectLocation, String> {
    match loc.to_lowercase().as_str() {
        "carried" => Ok(ObjectLocation::Carried),
        "worn" => Ok(ObjectLocation::Worn),
        "limbo" => Ok(ObjectLocation::Limbo),
        _ => {
            // Try to parse as location ID
            loc.parse::<u8>()
                .map(|location_id| ObjectLocation::At { location_id })
                .map_err(|_| format!("Invalid object location: {}", loc))
        }
    }
}

/// Emit game-updated event - UI should fetch fresh game state via API
fn emit_game_updated(app_handle: &AppHandle, _game: &DaadGame) {
    // Emit a simple signal - the UI will fetch the full game state via /api/game
    let _ = app_handle.emit("mcp-game-changed", ());
}

// ============================================================================
// LOCATION ENDPOINTS
// ============================================================================

async fn create_location(
    req: LocationRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        // Find next available ID (starts at 0 for first location)
        let next_id = game.locations.iter().map(|l| l.id).max().map(|m| m + 1).unwrap_or(0);

        let location = Location {
            id: next_id,
            name: req.name,
            description: req.description,
            is_dark: req.is_dark,
            connections: vec![],
            editor_x: req.editor_x,
            editor_y: req.editor_y,
            image: None,
        };

        game.locations.push(location);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Location created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_location(
    id: u8,
    req: UpdateLocationRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(location) = game.locations.iter_mut().find(|l| l.id == id) {
            if let Some(name) = req.name {
                location.name = name;
            }
            if let Some(description) = req.description {
                location.description = description;
            }
            if let Some(is_dark) = req.is_dark {
                location.is_dark = is_dark;
            }
            if let Some(x) = req.editor_x {
                location.editor_x = x;
            }
            if let Some(y) = req.editor_y {
                location.editor_y = y;
            }

            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Location {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Location {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_location(
    id: u8,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.locations.len();
        game.locations.retain(|l| l.id != id);

        if game.locations.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Location {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Location {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn get_location(
    id: u8,
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        if let Some(location) = game.locations.iter().find(|l| l.id == id) {
            Ok(warp::reply::json(location))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Location {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_locations(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.locations.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<Location> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// OBJECT ENDPOINTS
// ============================================================================

async fn create_object(
    req: ObjectRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let location = match parse_object_location(&req.location) {
            Ok(loc) => loc,
            Err(e) => {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: e,
                    id: None,
                }));
            }
        };

        // Find next available ID
        let next_id = game.objects.iter().map(|o| o.id).max().unwrap_or(0) + 1;

        let object = Object {
    id: next_id,
    name: req.name,
    description: req.description,
    noun: req.noun,
    adjective: req.adjective,
    location,
    weight: req.weight,
    is_container: req.is_container,
    is_wearable: req.is_wearable,
    is_takeable: req.is_takeable,
    is_light_source: req.is_light_source,
    is_psi: req.is_psi,
    container_capacity: req.container_capacity,
    icon: req.icon,
    otx_text: req.otx_text,
    attributes: req.attributes,
};

        game.objects.push(object);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Object created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_object(
    id: u8,
    req: UpdateObjectRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(object) = game.objects.iter_mut().find(|o| o.id == id) {
            if let Some(name) = req.name {
                object.name = name;
            }
            if let Some(description) = req.description {
                object.description = description;
            }
            if let Some(noun) = req.noun {
                object.noun = noun;
            }
            if let Some(adjective) = req.adjective {
                object.adjective = adjective;
            }
            if let Some(weight) = req.weight {
                object.weight = weight;
            }
            if let Some(is_container) = req.is_container {
                object.is_container = is_container;
            }
            if let Some(is_wearable) = req.is_wearable {
                object.is_wearable = is_wearable;
            }
            if let Some(is_takeable) = req.is_takeable {
                object.is_takeable = is_takeable;
            }
            if let Some(is_light_source) = req.is_light_source {
                object.is_light_source = is_light_source;
            }
            if let Some(is_psi) = req.is_psi {
                object.is_psi = is_psi;
            }
            if let Some(capacity) = req.container_capacity {
                object.container_capacity = Some(capacity);
            }
            if let Some(icon) = req.icon {
                object.icon = icon;
            }

            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Object {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Object {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_object(
    id: u8,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.objects.len();
        game.objects.retain(|o| o.id != id);

        if game.objects.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Object {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Object {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn move_object(
    id: u8,
    req: MoveObjectRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let location = match parse_object_location(&req.location) {
            Ok(loc) => loc,
            Err(e) => {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: e,
                    id: None,
                }));
            }
        };

        if let Some(object) = game.objects.iter_mut().find(|o| o.id == id) {
            object.location = location;
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Object {} moved", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Object {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn get_object(
    id: u8,
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        if let Some(object) = game.objects.iter().find(|o| o.id == id) {
            Ok(warp::reply::json(object))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Object {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_objects(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.objects.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<Object> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// CONNECTION ENDPOINTS
// ============================================================================

async fn create_connection(
    req: ConnectionRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let direction = match parse_direction(&req.direction) {
            Ok(dir) => dir,
            Err(e) => {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: e,
                    id: None,
                }));
            }
        };

        let from_id = req.from_location as u8;
        let to_id = req.to_location as u8;

        if let Some(location) = game.locations.iter_mut().find(|l| l.id == from_id) {
            // Check if connection already exists
            if location.connections.iter().any(|c| c.direction == direction) {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: format!("Connection already exists in direction {:?}", direction),
                    id: None,
                }));
            }

            let connection = Connection {
                direction,
                target_location: to_id,
                condition: req.condition,
            };

            location.connections.push(connection);
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: "Connection created".to_string(),
                id: Some(from_id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Location {} not found", from_id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_connection(
    req: DeleteConnectionRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let direction = match parse_direction(&req.direction) {
            Ok(dir) => dir,
            Err(e) => {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: e,
                    id: None,
                }));
            }
        };

        let from_id = req.from_location as u8;

        if let Some(location) = game.locations.iter_mut().find(|l| l.id == from_id) {
            let initial_count = location.connections.len();
            location.connections.retain(|c| c.direction != direction);

            if location.connections.len() < initial_count {
                emit_game_updated(&app_handle, game);

                Ok(warp::reply::json(&ApiResponse {
                    success: true,
                    message: format!("Connection deleted from location {}", from_id),
                    id: Some(from_id as u32),
                }))
            } else {
                Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: format!("Connection not found in direction {:?}", direction),
                    id: None,
                }))
            }
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Location {} not found", from_id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

// ============================================================================
// VOCABULARY ENDPOINTS
// ============================================================================

async fn create_vocabulary(
    req: VocabularyRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let word_type = match parse_vocab_type(&req.word_type) {
            Ok(vtype) => vtype,
            Err(e) => {
                return Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: e,
                    id: None,
                }));
            }
        };

        // Check if word already exists
        if game.vocabulary.iter().any(|v| v.word == req.word) {
            return Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Vocabulary word '{}' already exists", req.word),
                id: None,
            }));
        }

        let vocab = VocabEntry {
            word: req.word,
            word_type,
            id: req.id as u8,
        };

        game.vocabulary.push(vocab);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Vocabulary entry created".to_string(),
            id: Some(req.id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_vocabulary(
    word: String,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.vocabulary.len();
        game.vocabulary.retain(|v| v.word != word);

        if game.vocabulary.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Vocabulary word '{}' deleted", word),
                id: None,
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Vocabulary word '{}' not found", word),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_vocabulary(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.vocabulary.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<VocabEntry> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// FLAG ENDPOINTS
// ============================================================================

async fn create_flag(
    req: FlagRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        // Find next available ID
        let next_id = game.flags.iter().map(|f| f.id).max().unwrap_or(0) + 1;

        let flag = Flag {
            id: next_id,
            name: req.name,
            description: req.description,
            initial_value: req.initial_value,
        };

        game.flags.push(flag);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Flag created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_flag(
    id: u8,
    req: UpdateFlagRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(flag) = game.flags.iter_mut().find(|f| f.id == id) {
            if let Some(name) = req.name {
                flag.name = name;
            }
            if let Some(description) = req.description {
                flag.description = description;
            }
            if let Some(initial_value) = req.initial_value {
                flag.initial_value = initial_value;
            }

            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Flag {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Flag {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_flag(
    id: u8,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.flags.len();
        game.flags.retain(|f| f.id != id);

        if game.flags.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Flag {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Flag {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_flags(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.flags.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<Flag> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// RULE ENDPOINTS
// ============================================================================

async fn create_rule(
    req: RuleRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        // Find next available ID
        let next_id = game.rules.iter().map(|r| r.id).max().unwrap_or(0) + 1;

        let rule = Rule {
            id: next_id,
            name: req.name,
            process: req.process,
            verb: req.verb,
            noun: req.noun,
            conditions: req.conditions,
            actions: req.actions,
            enabled: req.enabled,
            additional_triggers: None,
        };

        game.rules.push(rule);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Rule created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_rule(
    id: usize,
    req: UpdateRuleRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(rule) = game.rules.iter_mut().find(|r| r.id == id) {
            if let Some(name) = req.name {
                rule.name = name;
            }
            if let Some(process) = req.process {
                rule.process = process;
            }
            if let Some(conditions) = req.conditions {
                rule.conditions = conditions;
            }
            if let Some(actions) = req.actions {
                rule.actions = actions;
            }
            if let Some(enabled) = req.enabled {
                rule.enabled = enabled;
            }

            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Rule {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Rule {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_rule(
    id: usize,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.rules.len();
        game.rules.retain(|r| r.id != id);

        if game.rules.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Rule {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Rule {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn get_rule(
    id: usize,
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        if let Some(rule) = game.rules.iter().find(|r| r.id == id) {
            Ok(warp::reply::json(rule))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Rule {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_rules(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.rules.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<Rule> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// MESSAGE ENDPOINTS
// ============================================================================

async fn create_message(
    req: MessageRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let next_id = game.messages.len();
        game.messages.push(req.text);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Message created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_message(
    id: usize,
    req: MessageRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if id < game.messages.len() {
            game.messages[id] = req.text;
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Message {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Message {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_message(
    id: usize,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if id < game.messages.len() {
            game.messages.remove(id);
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Message {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Message {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_messages(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.messages.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<String> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// MUSIC ENDPOINTS
// ============================================================================

async fn create_music(
    req: MusicRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        // Find next available ID
        let next_id = game.music.iter().map(|m| m.id).max().unwrap_or(0) + 1;

        let music = Music {
            id: next_id,
            name: req.name,
            tempo: req.tempo,
            shape: req.shape,
            volume: req.volume,
            notes: req.notes,
        };

        game.music.push(music);
        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Music track created".to_string(),
            id: Some(next_id as u32),
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_music(
    id: u8,
    req: UpdateMusicRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(music) = game.music.iter_mut().find(|m| m.id == id) {
            if let Some(name) = req.name {
                music.name = name;
            }
            if let Some(tempo) = req.tempo {
                music.tempo = tempo;
            }
            if let Some(shape) = req.shape {
                music.shape = shape;
            }
            if let Some(volume) = req.volume {
                music.volume = volume;
            }
            if let Some(notes) = req.notes {
                music.notes = notes;
            }

            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Music track {} updated", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Music track {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn delete_music(
    id: u8,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        let initial_count = game.music.len();
        game.music.retain(|m| m.id != id);

        if game.music.len() < initial_count {
            emit_game_updated(&app_handle, game);

            Ok(warp::reply::json(&ApiResponse {
                success: true,
                message: format!("Music track {} deleted", id),
                id: Some(id as u32),
            }))
        } else {
            Ok(warp::reply::json(&ApiResponse {
                success: false,
                message: format!("Music track {} not found", id),
                id: None,
            }))
        }
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn list_music(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(&ListResponse {
            success: true,
            data: game.music.clone(),
        }))
    } else {
        Ok(warp::reply::json(&ListResponse::<Music> {
            success: true,
            data: vec![],
        }))
    }
}

// ============================================================================
// GAME ENDPOINTS
// ============================================================================

async fn get_game(
    state: SharedGameState,
) -> Result<impl warp::Reply, Infallible> {
    let game_lock = state.lock();

    if let Some(game) = game_lock.as_ref() {
        Ok(warp::reply::json(game))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn update_game_settings(
    req: GameSettingsRequest,
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<impl warp::Reply, Infallible> {
    let mut game_lock = state.lock();

    if let Some(game) = game_lock.as_mut() {
        if let Some(title) = req.title {
            game.title = title;
        }
        if let Some(author) = req.author {
            game.author = author;
        }
        if let Some(version) = req.version {
            game.version = version;
        }
        if let Some(intro_text) = req.intro_text {
            game.intro_text = Some(intro_text);
        }
        if let Some(part_number) = req.part_number {
            game.part_number = part_number;
        }
        if let Some(system_messages) = req.system_messages {
            game.system_messages = Some(system_messages);
        }
        if let Some(status_bar_config) = req.status_bar_config {
            game.status_bar_config = Some(status_bar_config);
        }

        emit_game_updated(&app_handle, game);

        Ok(warp::reply::json(&ApiResponse {
            success: true,
            message: "Game settings updated".to_string(),
            id: None,
        }))
    } else {
        Ok(warp::reply::json(&ApiResponse {
            success: false,
            message: "No game loaded".to_string(),
            id: None,
        }))
    }
}

async fn health_check() -> Result<impl warp::Reply, Infallible> {
    Ok(warp::reply::json(&ApiResponse {
        success: true,
        message: "DAAD Builder API is running".to_string(),
        id: None,
    }))
}

// ============================================================================
// WARP FILTER HELPERS
// ============================================================================

fn with_state(
    state: SharedGameState,
) -> impl Filter<Extract = (SharedGameState,), Error = Infallible> + Clone {
    warp::any().map(move || state.clone())
}

fn with_app_handle(
    app_handle: AppHandle,
) -> impl Filter<Extract = (AppHandle,), Error = Infallible> + Clone {
    warp::any().map(move || app_handle.clone())
}

// ============================================================================
// API SERVER
// ============================================================================

pub async fn start_api_server(
    state: SharedGameState,
    app_handle: AppHandle,
) -> Result<(), Box<dyn std::error::Error>> {
    // CORS configuration
    let cors = warp::cors()
        .allow_any_origin()
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE"])
        .allow_headers(vec!["Content-Type"]);

    // Health check
    let health = warp::path("health")
        .and(warp::get())
        .and_then(health_check);

    // Location endpoints
    let create_location_route = warp::path!("api" / "location")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_location);

    let update_location_route = warp::path!("api" / "location" / u8)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_location);

    let delete_location_route = warp::path!("api" / "location" / u8)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_location);

    let get_location_route = warp::path!("api" / "location" / u8)
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(get_location);

    let list_locations_route = warp::path!("api" / "locations")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_locations);

    // Object endpoints
    let create_object_route = warp::path!("api" / "object")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_object);

    let update_object_route = warp::path!("api" / "object" / u8)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_object);

    let delete_object_route = warp::path!("api" / "object" / u8)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_object);

    let move_object_route = warp::path!("api" / "object" / u8 / "move")
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(move_object);

    let get_object_route = warp::path!("api" / "object" / u8)
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(get_object);

    let list_objects_route = warp::path!("api" / "objects")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_objects);

    // Connection endpoints
    let create_connection_route = warp::path!("api" / "connection")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_connection);

    let delete_connection_route = warp::path!("api" / "connection")
        .and(warp::delete())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_connection);

    // Vocabulary endpoints
    let create_vocabulary_route = warp::path!("api" / "vocabulary")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_vocabulary);

    let delete_vocabulary_route = warp::path!("api" / "vocabulary" / String)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_vocabulary);

    let list_vocabulary_route = warp::path!("api" / "vocabulary")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_vocabulary);

    // Flag endpoints
    let create_flag_route = warp::path!("api" / "flag")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_flag);

    let update_flag_route = warp::path!("api" / "flag" / u8)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_flag);

    let delete_flag_route = warp::path!("api" / "flag" / u8)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_flag);

    let list_flags_route = warp::path!("api" / "flags")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_flags);

    // Rule endpoints
    let create_rule_route = warp::path!("api" / "rule")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_rule);

    let update_rule_route = warp::path!("api" / "rule" / usize)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_rule);

    let delete_rule_route = warp::path!("api" / "rule" / usize)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_rule);

    let get_rule_route = warp::path!("api" / "rule" / usize)
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(get_rule);

    let list_rules_route = warp::path!("api" / "rules")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_rules);

    // Message endpoints
    let create_message_route = warp::path!("api" / "message")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_message);

    let update_message_route = warp::path!("api" / "message" / usize)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_message);

    let delete_message_route = warp::path!("api" / "message" / usize)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_message);

    let list_messages_route = warp::path!("api" / "messages")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_messages);

    // Music endpoints
    let create_music_route = warp::path!("api" / "music")
        .and(warp::post())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(create_music);

    let update_music_route = warp::path!("api" / "music" / u8)
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_music);

    let delete_music_route = warp::path!("api" / "music" / u8)
        .and(warp::delete())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(delete_music);

    let list_music_route = warp::path!("api" / "music")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(list_music);

    // Game endpoints
    let get_game_route = warp::path!("api" / "game")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(get_game);

    let update_game_settings_route = warp::path!("api" / "game" / "settings")
        .and(warp::put())
        .and(warp::body::json())
        .and(with_state(state.clone()))
        .and(with_app_handle(app_handle.clone()))
        .and_then(update_game_settings);

    // Export DSF endpoint
    let export_dsf_route = warp::path!("api" / "export" / "dsf")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(|state: SharedGameState| async move {
            let game_lock = state.lock();
            if let Some(game) = game_lock.as_ref() {
                let (dsf, logs) = crate::codegen::DaadCodeGenerator::generate_verbose(game);
                let errors = crate::codegen::DaadCodeGenerator::validate_dsf(&dsf);
                Ok::<_, Infallible>(warp::reply::json(&serde_json::json!({
                    "success": true,
                    "dsf": dsf,
                    "lines": dsf.lines().count(),
                    "errors": errors,
                    "logs": logs,
                })))
            } else {
                Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: "No game loaded".to_string(),
                    id: None,
                }))
            }
        });

    // Validate game endpoint
    let validate_game_route = warp::path!("api" / "validate")
        .and(warp::get())
        .and(with_state(state.clone()))
        .and_then(|state: SharedGameState| async move {
            let game_lock = state.lock();
            if let Some(game) = game_lock.as_ref() {
                let (dsf, _) = crate::codegen::DaadCodeGenerator::generate_verbose(game);
                let dsf_errors = crate::codegen::DaadCodeGenerator::validate_dsf(&dsf);
                let mut issues = Vec::new();
                // Basic game validation
                if game.locations.is_empty() {
                    issues.push("No locations defined".to_string());
                }
                if game.objects.is_empty() {
                    issues.push("No objects defined".to_string());
                }
                if game.rules.is_empty() {
                    issues.push("No rules defined".to_string());
                }
                if game.vocabulary.is_empty() {
                    issues.push("No vocabulary defined".to_string());
                }
                issues.extend(dsf_errors);
                Ok::<_, Infallible>(warp::reply::json(&serde_json::json!({
                    "success": true,
                    "issues": issues,
                    "issue_count": issues.len(),
                    "locations": game.locations.len(),
                    "objects": game.objects.len(),
                    "rules": game.rules.len(),
                    "messages": game.messages.len(),
                    "vocabulary": game.vocabulary.len(),
                })))
            } else {
                Ok(warp::reply::json(&ApiResponse {
                    success: false,
                    message: "No game loaded".to_string(),
                    id: None,
                }))
            }
        });

    // Combine all routes
    let routes = health
        .or(create_location_route)
        .or(update_location_route)
        .or(delete_location_route)
        .or(get_location_route)
        .or(list_locations_route)
        .or(create_object_route)
        .or(update_object_route)
        .or(delete_object_route)
        .or(move_object_route)
        .or(get_object_route)
        .or(list_objects_route)
        .or(create_connection_route)
        .or(delete_connection_route)
        .or(create_vocabulary_route)
        .or(delete_vocabulary_route)
        .or(list_vocabulary_route)
        .or(create_flag_route)
        .or(update_flag_route)
        .or(delete_flag_route)
        .or(list_flags_route)
        .or(create_rule_route)
        .or(update_rule_route)
        .or(delete_rule_route)
        .or(get_rule_route)
        .or(list_rules_route)
        .or(create_message_route)
        .or(update_message_route)
        .or(delete_message_route)
        .or(list_messages_route)
        .or(create_music_route)
        .or(update_music_route)
        .or(delete_music_route)
        .or(list_music_route)
        .or(get_game_route)
        .or(update_game_settings_route)
        .or(export_dsf_route)
        .or(validate_game_route)
        .with(cors);

    println!("DAAD Builder MCP API server starting on http://127.0.0.1:3042");
    warp::serve(routes).run(([127, 0, 0, 1], 3042)).await;

    Ok(())
}
