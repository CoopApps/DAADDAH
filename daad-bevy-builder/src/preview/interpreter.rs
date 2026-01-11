// DAAD Interpreter - for live game preview

use bevy::prelude::Resource;
use crate::daad::game::DaadGame;
use crate::daad::types::{Direction, ObjectLocation, Object, Connection};

/// Game runtime state - tracks the current state during gameplay
#[derive(Resource)]
pub struct GameRuntime {
    pub current_location: u8,
    pub flags: Vec<u8>,  // Flag values (256 flags, 0-255)
    pub output_history: Vec<String>,
    pub turn_count: u32,
}

impl GameRuntime {
    /// Create a new game runtime from a DAAD game
    pub fn new(game: &DaadGame) -> Self {
        let mut flags = vec![0u8; 256];

        // Set initial flag values
        for flag in &game.flags {
            if (flag.id as usize) < 256 {
                flags[flag.id as usize] = flag.initial_value;
            }
        }

        // Find starting location (first location, or location 0)
        let starting_location = game.locations.first()
            .map(|loc| loc.id)
            .unwrap_or(0);

        let mut output = Vec::new();
        output.push(format!("=== {} ===", game.title));
        output.push(format!("By {}", game.author));
        output.push("".to_string());

        // Show initial location description
        if let Some(loc) = game.locations.iter().find(|l| l.id == starting_location) {
            output.push(format!("📍 {}", loc.name));
            output.push(loc.description.clone());
            output.push("".to_string());

            // List visible objects at starting location
            let objects_here: Vec<&Object> = game.objects.iter()
                .filter(|obj| matches!(obj.location, ObjectLocation::Location(id) if id == starting_location))
                .collect();

            if !objects_here.is_empty() {
                output.push("You can see:".to_string());
                for obj in objects_here {
                    output.push(format!("  {} {}", obj.icon, obj.name));
                }
                output.push("".to_string());
            }
        }

        Self {
            current_location: starting_location,
            flags,
            output_history: output,
            turn_count: 0,
        }
    }

    /// Execute a player command
    pub fn execute_command(&mut self, command: &str, game: &DaadGame) {
        self.turn_count += 1;
        self.output_history.push(format!("> {}", command));

        let cmd = command.trim().to_uppercase();

        match cmd.as_str() {
            "LOOK" | "L" => self.cmd_look(game),
            "INVENTORY" | "INV" | "I" => self.cmd_inventory(game),
            "NORTH" | "N" => self.cmd_go(Direction::North, game),
            "SOUTH" | "S" => self.cmd_go(Direction::South, game),
            "EAST" | "E" => self.cmd_go(Direction::East, game),
            "WEST" | "W" => self.cmd_go(Direction::West, game),
            "NORTHEAST" | "NE" => self.cmd_go(Direction::Northeast, game),
            "NORTHWEST" | "NW" => self.cmd_go(Direction::Northwest, game),
            "SOUTHEAST" | "SE" => self.cmd_go(Direction::Southeast, game),
            "SOUTHWEST" | "SW" => self.cmd_go(Direction::Southwest, game),
            "UP" | "U" => self.cmd_go(Direction::Up, game),
            "DOWN" | "D" => self.cmd_go(Direction::Down, game),
            "IN" => self.cmd_go(Direction::In, game),
            "OUT" => self.cmd_go(Direction::Out, game),
            _ => {
                self.output_history.push("I don't understand that command.".to_string());
                self.output_history.push("Try: LOOK, INVENTORY, GO [direction]".to_string());
            }
        }

        self.output_history.push("".to_string());

        // Keep output history reasonable (last 100 lines)
        if self.output_history.len() > 100 {
            self.output_history.drain(0..10);
        }
    }

    /// LOOK command - describe current location
    fn cmd_look(&mut self, game: &DaadGame) {
        if let Some(loc) = game.locations.iter().find(|l| l.id == self.current_location) {
            self.output_history.push(format!("📍 {}", loc.name));
            self.output_history.push(loc.description.clone());

            // List visible objects
            let objects_here: Vec<&Object> = game.objects.iter()
                .filter(|obj| matches!(obj.location, ObjectLocation::Location(id) if id == self.current_location))
                .collect();

            if !objects_here.is_empty() {
                self.output_history.push("".to_string());
                self.output_history.push("You can see:".to_string());
                for obj in objects_here {
                    self.output_history.push(format!("  {} {}", obj.icon, obj.name));
                }
            }

            // List available exits
            let exits: Vec<&Connection> = loc.connections.iter().collect();
            if !exits.is_empty() {
                self.output_history.push("".to_string());
                self.output_history.push("Exits:".to_string());
                for conn in exits {
                    if let Some(target) = game.locations.iter().find(|l| l.id == conn.target_location) {
                        self.output_history.push(format!("  {} - {}",
                            conn.direction.as_str(),
                            target.name));
                    }
                }
            }
        } else {
            self.output_history.push("You are nowhere. This is a bug!".to_string());
        }
    }

    /// INVENTORY command - list carried items
    fn cmd_inventory(&mut self, game: &DaadGame) {
        let inventory: Vec<&Object> = game.objects.iter()
            .filter(|obj| matches!(obj.location, ObjectLocation::Carried))
            .collect();

        if inventory.is_empty() {
            self.output_history.push("You are not carrying anything.".to_string());
        } else {
            self.output_history.push(format!("You are carrying {} items:", inventory.len()));
            for obj in inventory {
                self.output_history.push(format!("  {} {}", obj.icon, obj.name));
            }
        }
    }

    /// GO command - move to a different location
    fn cmd_go(&mut self, direction: Direction, game: &DaadGame) {
        if let Some(current_loc) = game.locations.iter().find(|l| l.id == self.current_location) {
            // Find connection in that direction
            if let Some(conn) = current_loc.connections.iter()
                .find(|c| c.direction == direction) {

                let target_id = conn.target_location;

                if let Some(target_loc) = game.locations.iter().find(|l| l.id == target_id) {
                    self.current_location = target_id;
                    self.output_history.push(format!("You go {}.", direction.as_str()));
                    self.output_history.push("".to_string());

                    // Automatically look at new location
                    self.cmd_look(game);
                } else {
                    self.output_history.push("That exit leads nowhere (missing location).".to_string());
                }
            } else {
                self.output_history.push(format!("You can't go {} from here.", direction.as_str()));
            }
        }
    }

    /// Get flag value
    pub fn get_flag(&self, flag_id: u8) -> u8 {
        self.flags.get(flag_id as usize).copied().unwrap_or(0)
    }

    /// Set flag value
    pub fn set_flag(&mut self, flag_id: u8, value: u8) {
        if (flag_id as usize) < self.flags.len() {
            self.flags[flag_id as usize] = value;
        }
    }
}

