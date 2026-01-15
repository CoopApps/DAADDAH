// Game runtime interpreter
use crate::types::*;

pub struct GameRuntime {
    pub current_location: u8,
    pub flags: Vec<u8>,
    pub output_buffer: Vec<String>,
    pub turn_count: u32,
    pub object_locations: Vec<(u8, ObjectLocation)>, // Track mutable object locations
}

impl GameRuntime {
    pub fn new(game: &DaadGame) -> Self {
        let mut flags = vec![0u8; 256];

        // Set initial flag values
        for flag in &game.flags {
            if (flag.id as usize) < 256 {
                flags[flag.id as usize] = flag.initial_value;
            }
        }

        // Find starting location
        let starting_location = game.locations.first()
            .map(|loc| loc.id)
            .unwrap_or(0);

        // Copy initial object locations
        let object_locations: Vec<(u8, ObjectLocation)> = game.objects.iter()
            .map(|obj| (obj.id, obj.location.clone()))
            .collect();

        let mut output = Vec::new();
        output.push("═".repeat(50));
        output.push(format!("  {}", game.title));
        output.push(format!("  by {}", game.author));
        output.push("═".repeat(50));
        output.push(String::new());

        let mut runtime = Self {
            current_location: starting_location,
            flags,
            output_buffer: output,
            turn_count: 0,
            object_locations,
        };

        // Show initial location
        runtime.cmd_look(game);

        runtime
    }

    pub fn execute_command(&mut self, command: &str, game: &DaadGame) {
        self.turn_count += 1;
        self.output_buffer.clear();

        let cmd = command.trim().to_uppercase();
        let words: Vec<&str> = cmd.split_whitespace().collect();

        if words.is_empty() {
            return;
        }

        match words[0] {
            "LOOK" | "L" => self.cmd_look(game),
            "INVENTORY" | "INV" | "I" => self.cmd_inventory(game),
            "EXAMINE" | "X" | "EXAM" => {
                if words.len() > 1 {
                    self.cmd_examine(words[1], game);
                } else {
                    self.output_buffer.push("Examine what?".to_string());
                }
            }
            "GET" | "TAKE" => {
                if words.len() > 1 {
                    self.cmd_get(words[1], game);
                } else {
                    self.output_buffer.push("Get what?".to_string());
                }
            }
            "DROP" => {
                if words.len() > 1 {
                    self.cmd_drop(words[1], game);
                } else {
                    self.output_buffer.push("Drop what?".to_string());
                }
            }
            "GO" => {
                if words.len() > 1 {
                    if let Some(dir) = Direction::from_str(words[1]) {
                        self.cmd_go(dir, game);
                    } else {
                        self.output_buffer.push("I don't understand that direction.".to_string());
                    }
                } else {
                    self.output_buffer.push("Go where?".to_string());
                }
            }
            _ => {
                // Try to parse as a direction
                if let Some(dir) = Direction::from_str(words[0]) {
                    self.cmd_go(dir, game);
                } else {
                    self.output_buffer.push("I don't understand that command.".to_string());
                    self.output_buffer.push("Try: LOOK, GO [direction], GET [object], DROP [object], INVENTORY, EXAMINE [object]".to_string());
                }
            }
        }
    }

    pub fn display_output(&self) {
        for line in &self.output_buffer {
            println!("{}", line);
        }
    }

    fn cmd_look(&mut self, game: &DaadGame) {
        if let Some(loc) = game.locations.iter().find(|l| l.id == self.current_location) {
            self.output_buffer.push(String::new());
            self.output_buffer.push(format!("┌─ {} ─┐", loc.name));
            self.output_buffer.push(loc.description.clone());

            // List visible objects
            let objects_here: Vec<&Object> = game.objects.iter()
                .filter(|obj| {
                    if let Some((_, location)) = self.object_locations.iter().find(|(id, _)| *id == obj.id) {
                        matches!(location, ObjectLocation::Location(id) if *id == self.current_location)
                    } else {
                        false
                    }
                })
                .collect();

            if !objects_here.is_empty() {
                self.output_buffer.push(String::new());
                self.output_buffer.push("You can see:".to_string());
                for obj in objects_here {
                    self.output_buffer.push(format!("  {} {}", obj.icon, obj.name));
                }
            }

            // List available exits
            if !loc.connections.is_empty() {
                self.output_buffer.push(String::new());
                self.output_buffer.push("Exits:".to_string());
                for conn in &loc.connections {
                    if let Some(target) = game.locations.iter().find(|l| l.id == conn.target_location) {
                        self.output_buffer.push(format!("  {} - {}", conn.direction.as_str(), target.name));
                    }
                }
            }

            self.output_buffer.push("└".to_string() + &"─".repeat(loc.name.len() + 4) + "┘");
        }
    }

    fn cmd_inventory(&mut self, game: &DaadGame) {
        let inventory: Vec<&Object> = game.objects.iter()
            .filter(|obj| {
                if let Some((_, location)) = self.object_locations.iter().find(|(id, _)| *id == obj.id) {
                    matches!(location, ObjectLocation::Carried)
                } else {
                    false
                }
            })
            .collect();

        if inventory.is_empty() {
            self.output_buffer.push("You are not carrying anything.".to_string());
        } else {
            self.output_buffer.push(format!("You are carrying {} item(s):", inventory.len()));
            for obj in inventory {
                self.output_buffer.push(format!("  {} {}", obj.icon, obj.name));
            }
        }
    }

    fn cmd_examine(&mut self, noun: &str, game: &DaadGame) {
        // Find object by noun
        if let Some(obj) = game.objects.iter().find(|o| o.noun.eq_ignore_ascii_case(noun)) {
            // Check if visible (at current location or carried)
            if let Some((_, location)) = self.object_locations.iter().find(|(id, _)| *id == obj.id) {
                let visible = match location {
                    ObjectLocation::Location(loc_id) => *loc_id == self.current_location,
                    ObjectLocation::Carried | ObjectLocation::Worn => true,
                    _ => false,
                };

                if visible {
                    self.output_buffer.push(obj.description.clone());
                } else {
                    self.output_buffer.push("You don't see that here.".to_string());
                }
            }
        } else {
            self.output_buffer.push("You don't see that here.".to_string());
        }
    }

    fn cmd_get(&mut self, noun: &str, game: &DaadGame) {
        if let Some(obj) = game.objects.iter().find(|o| o.noun.eq_ignore_ascii_case(noun)) {
            if !obj.is_takeable {
                self.output_buffer.push("You can't take that.".to_string());
                return;
            }

            // Check if at current location
            if let Some((obj_id, location)) = self.object_locations.iter_mut().find(|(id, _)| *id == obj.id) {
                if matches!(location, ObjectLocation::Location(loc_id) if *loc_id == self.current_location) {
                    *location = ObjectLocation::Carried;
                    self.output_buffer.push(format!("You take the {}.", obj.name));
                } else {
                    self.output_buffer.push("You don't see that here.".to_string());
                }
            }
        } else {
            self.output_buffer.push("You don't see that here.".to_string());
        }
    }

    fn cmd_drop(&mut self, noun: &str, game: &DaadGame) {
        if let Some(obj) = game.objects.iter().find(|o| o.noun.eq_ignore_ascii_case(noun)) {
            // Check if carried
            if let Some((obj_id, location)) = self.object_locations.iter_mut().find(|(id, _)| *id == obj.id) {
                if matches!(location, ObjectLocation::Carried) {
                    *location = ObjectLocation::Location(self.current_location);
                    self.output_buffer.push(format!("You drop the {}.", obj.name));
                } else {
                    self.output_buffer.push("You're not carrying that.".to_string());
                }
            }
        } else {
            self.output_buffer.push("You're not carrying that.".to_string());
        }
    }

    fn cmd_go(&mut self, direction: Direction, game: &DaadGame) {
        if let Some(current_loc) = game.locations.iter().find(|l| l.id == self.current_location) {
            if let Some(conn) = current_loc.connections.iter().find(|c| c.direction == direction) {
                let target_id = conn.target_location;

                if let Some(_target_loc) = game.locations.iter().find(|l| l.id == target_id) {
                    self.current_location = target_id;
                    self.output_buffer.push(format!("You go {}.", direction.as_str()));
                    self.cmd_look(game);
                } else {
                    self.output_buffer.push("That exit leads nowhere.".to_string());
                }
            } else {
                self.output_buffer.push(format!("You can't go {} from here.", direction.as_str()));
            }
        }
    }
}
