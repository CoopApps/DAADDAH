use crate::daad::types::*;
use crate::daad::game::DaadGame;

/// Complete puzzle templates that create objects, locations, flags, and rules
/// Users just customize names and descriptions

/// Template result containing everything created
pub struct TemplateResult {
    pub object_ids: Vec<u8>,
    pub location_ids: Vec<u8>,
    pub flag_ids: Vec<u8>,
    pub rule_ids: Vec<usize>,
    pub success_message: String,
}

/// 🔐 Locked Door + Key template
/// Creates: door object, key object, locked/unlocked states, passage rules
pub fn apply_locked_door_template(
    game: &mut DaadGame,
    door_name: &str,
    key_name: &str,
    location_a: u8,
    location_b: u8,
) -> TemplateResult {
    let mut object_ids = Vec::new();
    let mut flag_ids = Vec::new();
    let mut rule_ids = Vec::new();

    // Create door object (non-takeable)
    let door_id = game.add_object(door_name, door_name.to_lowercase().as_str(),
        &format!("A sturdy {}.", door_name.to_lowercase()));
    if let Some(door) = game.objects.iter_mut().find(|o| o.id == door_id) {
        door.is_takeable = false;
        door.location = ObjectLocation::Location(location_a);
        door.icon = "🚪".to_string();
    }
    object_ids.push(door_id);

    // Create key object
    let key_id = game.add_object(key_name, "key", &format!("A {} that might unlock something.", key_name.to_lowercase()));
    if let Some(key) = game.objects.iter_mut().find(|o| o.id == key_id) {
        key.location = ObjectLocation::Location(location_a); // Key starts at location A
        key.icon = "🔑".to_string();
    }
    object_ids.push(key_id);

    // Create locked state flag
    let locked_flag = game.add_flag(
        &format!("{}_locked", door_name.to_lowercase().replace(" ", "_")),
        &format!("Is {} locked", door_name)
    );
    if let Some(flag) = game.flags.iter_mut().find(|f| f.id == locked_flag) {
        flag.initial_value = 1; // Starts locked
    }
    flag_ids.push(locked_flag);

    // Rule 1: UNLOCK door WITH key
    let rule_id = game.add_rule(&format!("Unlock {} with {}", door_name, key_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "UNLOCK".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: door_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id: key_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagNotZero { flag_id: locked_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: locked_flag, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage {
                text: format!("You unlock the {} with the {}. *Click*", door_name.to_lowercase(), key_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: Can't go through locked door
    let rule_id = game.add_rule(&format!("Blocked by locked {}", door_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::PlayerAt { location_id: location_a },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagNotZero { flag_id: locked_flag },
        });
        // Detect movement attempt (any direction verb)
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: format!("The {} is locked. You need a key.", door_name.to_lowercase())
            },
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids,
        location_ids: vec![location_a, location_b],
        flag_ids,
        rule_ids,
        success_message: format!("Created locked door puzzle! Use UNLOCK {} to open it.", door_name.to_uppercase()),
    }
}

/// 💎 Trading Chain template
/// NPC wants item A → gives item B
pub fn apply_trading_chain_template(
    game: &mut DaadGame,
    npc_name: &str,
    npc_location: u8,
    wants_object_id: u8,
    gives_object_id: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create "already traded" flag
    let traded_flag = game.add_flag(
        &format!("traded_with_{}", npc_name.to_lowercase().replace(" ", "_")),
        &format!("Already traded with {}", npc_name)
    );
    flag_ids.push(traded_flag);

    // Get object names for messages
    let wants_name = game.get_object(wants_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "item".to_string());
    let gives_name = game.get_object(gives_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "reward".to_string());

    // Rule 1: TALK TO npc (first time)
    let rule_id = game.add_rule(&format!("Talk to {} (first time)", npc_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "TALK".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: npc_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagZero { flag_id: traded_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: format!("{} says: 'I need a {}. Bring it to me!'", npc_name, wants_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: GIVE item TO npc
    let rule_id = game.add_rule(&format!("Give {} to {}", wants_name, npc_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "GIVE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: npc_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id: wants_object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: traded_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::MoveObject {
                object_id: wants_object_id,
                to_location: ObjectLocation::Limbo
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::MoveObject {
                object_id: gives_object_id,
                to_location: ObjectLocation::Carried
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::SetFlag { flag_id: traded_flag, value: 1 },
        });
        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::ShowMessage {
                text: format!("{} says: 'Thank you! Here, take this {}.'", npc_name, gives_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::AddScore { points: 10 },
        });
        rule.actions.push(Action {
            id: 5,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 3: TALK TO npc (after trading)
    let rule_id = game.add_rule(&format!("Talk to {} (after trade)", npc_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "TALK".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: npc_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagNotZero { flag_id: traded_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: format!("{} says: 'Thanks again for the {}!'", npc_name, wants_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![wants_object_id, gives_object_id],
        location_ids: vec![npc_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created NPC trading puzzle! Use TALK TO {}, then GIVE {} to trade.",
            npc_name.to_uppercase(), wants_name.to_uppercase()),
    }
}

/// 🔦 Dark Room Exploration template
/// Requires light source to see/take objects
pub fn apply_dark_room_template(
    game: &mut DaadGame,
    dark_location: u8,
    light_object_id: u8,
    hidden_object_ids: Vec<u8>,
) -> TemplateResult {
    let mut rule_ids = Vec::new();

    let light_name = game.get_object(light_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "lamp".to_string());

    // Mark location as dark
    if let Some(location) = game.locations.iter_mut().find(|l| l.id == dark_location) {
        location.is_dark = true;
    }

    // Rule 1: Can't see in dark without light
    let rule_id = game.add_rule("Can't see in dark", ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::PlayerAt { location_id: dark_location },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::IsDark,
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::VerbIs { verb: "LOOK".to_string() },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: "It's pitch black. You need a light source to see anything!".to_string()
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: Can't take objects in dark
    for &hidden_id in &hidden_object_ids {
        let obj_name = game.get_object(hidden_id)
            .map(|o| o.name.clone())
            .unwrap_or_else(|| "object".to_string());

        let rule_id = game.add_rule(&format!("Can't take {} in dark", obj_name), ProcessTable::Response);
        if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
            rule.conditions.push(Condition {
                id: 0,
                condition_type: ConditionType::PlayerAt { location_id: dark_location },
            });
            rule.conditions.push(Condition {
                id: 1,
                condition_type: ConditionType::IsDark,
            });
            rule.conditions.push(Condition {
                id: 2,
                condition_type: ConditionType::VerbIs { verb: "TAKE".to_string() },
            });
            rule.conditions.push(Condition {
                id: 3,
                condition_type: ConditionType::NounIs { noun: obj_name.to_uppercase() },
            });
            rule.actions.push(Action {
                id: 0,
                action_type: ActionType::ShowMessage {
                    text: "It's too dark to see anything!".to_string()
                },
            });
            rule.actions.push(Action {
                id: 1,
                action_type: ActionType::EndTurn,
            });
        }
        rule_ids.push(rule_id);
    }

    TemplateResult {
        object_ids: vec![light_object_id],
        location_ids: vec![dark_location],
        flag_ids: vec![],
        rule_ids,
        success_message: format!("Created dark room puzzle! Carry a lit {} to see in the dark.", light_name),
    }
}

/// 🧩 Multi-Part Assembly template
/// Collect N parts, combine them, unlock victory
pub fn apply_assembly_template(
    game: &mut DaadGame,
    part_object_ids: Vec<u8>,
    final_object_name: &str,
    assembly_location: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create "assembled" flag
    let assembled_flag = game.add_flag(
        &format!("{}_assembled", final_object_name.to_lowercase().replace(" ", "_")),
        &format!("Has {} been assembled", final_object_name)
    );
    flag_ids.push(assembled_flag);

    // Create final object
    let final_id = game.add_object(final_object_name,
        final_object_name.to_lowercase().split_whitespace().last().unwrap_or("device"),
        &format!("The completed {}!", final_object_name.to_lowercase()));
    if let Some(final_obj) = game.objects.iter_mut().find(|o| o.id == final_id) {
        final_obj.location = ObjectLocation::Limbo; // Starts in limbo
        final_obj.icon = "⚙️".to_string();
    }

    // Rule: COMBINE parts (when carrying all)
    let rule_id = game.add_rule(&format!("Assemble {}", final_object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "COMBINE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: assembly_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagZero { flag_id: assembled_flag },
        });

        // Check carrying all parts
        for (idx, &part_id) in part_object_ids.iter().enumerate() {
            rule.conditions.push(Condition {
                id: 3 + idx,
                condition_type: ConditionType::ObjectCarried { object_id: part_id },
            });
        }

        // Remove all parts, give final object
        for (idx, &part_id) in part_object_ids.iter().enumerate() {
            rule.actions.push(Action {
                id: idx,
                action_type: ActionType::MoveObject {
                    object_id: part_id,
                    to_location: ObjectLocation::Limbo
                },
            });
        }

        rule.actions.push(Action {
            id: part_object_ids.len(),
            action_type: ActionType::MoveObject {
                object_id: final_id,
                to_location: ObjectLocation::Carried
            },
        });
        rule.actions.push(Action {
            id: part_object_ids.len() + 1,
            action_type: ActionType::SetFlag { flag_id: assembled_flag, value: 1 },
        });
        rule.actions.push(Action {
            id: part_object_ids.len() + 2,
            action_type: ActionType::ShowMessage {
                text: format!("You carefully assemble the parts into a {}!", final_object_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: part_object_ids.len() + 3,
            action_type: ActionType::AddScore { points: 20 },
        });
        rule.actions.push(Action {
            id: part_object_ids.len() + 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    let mut object_ids = part_object_ids.clone();
    object_ids.push(final_id);

    TemplateResult {
        object_ids,
        location_ids: vec![assembly_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created assembly puzzle! Collect {} parts and use COMBINE at the workshop.", part_object_ids.len()),
    }
}

/// 🎁 Hidden Object Reveal template
/// EXAMINE something → reveals hidden object
pub fn apply_hidden_object_template(
    game: &mut DaadGame,
    container_name: &str,
    container_location: u8,
    hidden_object_id: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create "found" flag
    let found_flag = game.add_flag(
        &format!("found_{}", container_name.to_lowercase().replace(" ", "_")),
        &format!("Found hidden object in {}", container_name)
    );
    flag_ids.push(found_flag);

    let hidden_name = game.get_object(hidden_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "treasure".to_string());

    // Set hidden object to limbo initially
    if let Some(obj) = game.objects.iter_mut().find(|o| o.id == hidden_object_id) {
        obj.location = ObjectLocation::Limbo;
    }

    // Rule: EXAMINE container → reveals object
    let rule_id = game.add_rule(&format!("Examine {} to find {}", container_name, hidden_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "EXAMINE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: container_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::PlayerAt { location_id: container_location },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: found_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: found_flag, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::MoveObject {
                object_id: hidden_object_id,
                to_location: ObjectLocation::Location(container_location)
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::ShowMessage {
                text: format!("You examine the {} closely and find a {} hidden inside!",
                    container_name.to_lowercase(), hidden_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::AddScore { points: 5 },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![hidden_object_id],
        location_ids: vec![container_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created hidden object puzzle! Use EXAMINE {} to discover the {}.",
            container_name.to_uppercase(), hidden_name),
    }
}

/// 🔢 Combination Lock/Safe template
/// Enter numeric code to unlock safe/door
pub fn apply_combination_lock_template(
    game: &mut DaadGame,
    safe_name: &str,
    safe_location: u8,
    correct_code: u16,
    reward_object_id: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create "opened" flag
    let opened_flag = game.add_flag(
        &format!("{}_opened", safe_name.to_lowercase().replace(" ", "_")),
        &format!("Has {} been opened", safe_name)
    );
    flag_ids.push(opened_flag);

    // Set reward object to limbo initially
    if let Some(obj) = game.objects.iter_mut().find(|o| o.id == reward_object_id) {
        obj.location = ObjectLocation::Limbo;
    }

    // Rule 1: ENTER CODE [number] (correct)
    let rule_id = game.add_rule(&format!("Enter correct code for {}", safe_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "ENTER".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: correct_code.to_string() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::PlayerAt { location_id: safe_location },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: opened_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: opened_flag, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::MoveObject {
                object_id: reward_object_id,
                to_location: ObjectLocation::Location(safe_location)
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::ShowMessage {
                text: format!("*CLICK* The {} opens! Inside you find something valuable.", safe_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::AddScore { points: 15 },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: ENTER CODE [wrong number]
    let rule_id = game.add_rule(&format!("Enter wrong code for {}", safe_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "ENTER".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: safe_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagZero { flag_id: opened_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: "*BEEP* Incorrect combination.".to_string()
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![reward_object_id],
        location_ids: vec![safe_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created combination lock puzzle! Use ENTER CODE {} to open.", correct_code),
    }
}

/// 🗣️ Password/Secret Word template
/// SAY magic word to trigger event
pub fn apply_password_template(
    game: &mut DaadGame,
    password: &str,
    trigger_location: u8,
    success_action: PasswordAction,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create "password used" flag
    let used_flag = game.add_flag(
        &format!("password_{}_used", password.to_lowercase().replace(" ", "_")),
        &format!("Password '{}' has been used", password)
    );
    flag_ids.push(used_flag);

    // Rule: SAY [password]
    let rule_id = game.add_rule(&format!("Say password '{}'", password), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "SAY".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: password.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::PlayerAt { location_id: trigger_location },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: used_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: used_flag, value: 1 },
        });

        // Add action based on type
        match success_action {
            PasswordAction::OpenDoor { to_location } => {
                rule.actions.push(Action {
                    id: 1,
                    action_type: ActionType::ShowMessage {
                        text: "The magic word echoes... A secret passage opens!".to_string()
                    },
                });
                rule.actions.push(Action {
                    id: 2,
                    action_type: ActionType::GoToLocation { location_id: to_location },
                });
            }
            PasswordAction::RevealObject { object_id } => {
                rule.actions.push(Action {
                    id: 1,
                    action_type: ActionType::ShowMessage {
                        text: "The magic word echoes... Something appears!".to_string()
                    },
                });
                rule.actions.push(Action {
                    id: 2,
                    action_type: ActionType::MoveObject {
                        object_id,
                        to_location: ObjectLocation::Location(trigger_location)
                    },
                });
            }
            PasswordAction::CustomMessage { ref message } => {
                rule.actions.push(Action {
                    id: 1,
                    action_type: ActionType::ShowMessage {
                        text: message.clone()
                    },
                });
            }
        }

        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::AddScore { points: 10 },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![],
        location_ids: vec![trigger_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created password puzzle! Use SAY {} at the right location.", password.to_uppercase()),
    }
}

/// Password action types
pub enum PasswordAction {
    OpenDoor { to_location: u8 },
    RevealObject { object_id: u8 },
    CustomMessage { message: String },
}

/// 🔨 Tool-Specific Jobs template
/// Need specific tool to perform action (DIG with SHOVEL, CHOP with AXE)
pub fn apply_tool_job_template(
    game: &mut DaadGame,
    verb: &str,
    tool_object_id: u8,
    job_location: u8,
    result_object_id: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    let tool_name = game.get_object(tool_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "tool".to_string());

    let result_name = game.get_object(result_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "treasure".to_string());

    // Create "job done" flag
    let done_flag = game.add_flag(
        &format!("{}_{}_done", verb.to_lowercase(), job_location),
        &format!("Has {} job been done at location {}", verb, job_location)
    );
    flag_ids.push(done_flag);

    // Set result object to limbo initially
    if let Some(obj) = game.objects.iter_mut().find(|o| o.id == result_object_id) {
        obj.location = ObjectLocation::Limbo;
    }

    // Rule 1: Try to do job without tool
    let rule_id = game.add_rule(&format!("Try to {} without {}", verb.to_lowercase(), tool_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: verb.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: job_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectNotCarried { object_id: tool_object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: done_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage {
                text: format!("You need a {} to do that!", tool_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: Do job with tool
    let rule_id = game.add_rule(&format!("{} with {}", verb, tool_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: verb.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::PlayerAt { location_id: job_location },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id: tool_object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: done_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: done_flag, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::MoveObject {
                object_id: result_object_id,
                to_location: ObjectLocation::Location(job_location)
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::ShowMessage {
                text: format!("You use the {} and discover {}!", tool_name.to_lowercase(), result_name.to_lowercase())
            },
        });
        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::AddScore { points: 10 },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![tool_object_id, result_object_id],
        location_ids: vec![job_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created tool job puzzle! Use {} with {} to find {}.",
            verb.to_uppercase(), tool_name, result_name),
    }
}

/// ⏰ Time-Limited Event template
/// Flag counts down each turn, must complete before it reaches zero
pub fn apply_time_limit_template(
    game: &mut DaadGame,
    event_name: &str,
    turns_remaining: u8,
    success_object_id: u8,
    success_location: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create timer flag
    let timer_flag = game.add_flag(
        &format!("{}_timer", event_name.to_lowercase().replace(" ", "_")),
        &format!("Turns remaining for {}", event_name)
    );
    if let Some(flag) = game.flags.iter_mut().find(|f| f.id == timer_flag) {
        flag.initial_value = turns_remaining;
    }
    flag_ids.push(timer_flag);

    // Create "event active" flag
    let active_flag = game.add_flag(
        &format!("{}_active", event_name.to_lowercase().replace(" ", "_")),
        &format!("Is {} event active", event_name)
    );
    if let Some(flag) = game.flags.iter_mut().find(|f| f.id == active_flag) {
        flag.initial_value = 1; // Starts active
    }
    flag_ids.push(active_flag);

    let success_name = game.get_object(success_object_id)
        .map(|o| o.name.clone())
        .unwrap_or_else(|| "antidote".to_string());

    // Rule 1: Timer countdown (auto-action every turn)
    let rule_id = game.add_rule(&format!("{} timer countdown", event_name), ProcessTable::AutoAction);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::FlagNotZero { flag_id: active_flag },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagNotZero { flag_id: timer_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::DecrementFlag { flag_id: timer_flag },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage {
                text: format!("⚠️ {} Time is running out!", event_name)
            },
        });
    }
    rule_ids.push(rule_id);

    // Rule 2: Time runs out (failure)
    let rule_id = game.add_rule(&format!("{} time up", event_name), ProcessTable::AutoAction);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::FlagNotZero { flag_id: active_flag },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagZero { flag_id: timer_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: active_flag, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage {
                text: format!("💀 {} You have failed!", event_name)
            },
        });
    }
    rule_ids.push(rule_id);

    // Rule 3: Use solution object in time (success)
    let rule_id = game.add_rule(&format!("Solve {} in time", event_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "USE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: success_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::PlayerAt { location_id: success_location },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::ObjectCarried { object_id: success_object_id },
        });
        rule.conditions.push(Condition {
            id: 4,
            condition_type: ConditionType::FlagNotZero { flag_id: active_flag },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: active_flag, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::MoveObject {
                object_id: success_object_id,
                to_location: ObjectLocation::Limbo
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::ShowMessage {
                text: format!("✓ You solved {} just in time!", event_name)
            },
        });
        rule.actions.push(Action {
            id: 3,
            action_type: ActionType::AddScore { points: 25 },
        });
        rule.actions.push(Action {
            id: 4,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    TemplateResult {
        object_ids: vec![success_object_id],
        location_ids: vec![success_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created time-limited puzzle! Find and USE {} within {} turns.", success_name, turns_remaining),
    }
}

/// 🧩 Sequence Puzzle template
/// Must perform actions in specific order (PULL lever, PUSH button, TURN dial)
pub fn apply_sequence_puzzle_template(
    game: &mut DaadGame,
    puzzle_name: &str,
    puzzle_location: u8,
    sequence: Vec<(String, String)>, // Vec of (verb, noun) pairs
    reward_object_id: u8,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();

    // Create step counter flag
    let step_flag = game.add_flag(
        &format!("{}_step", puzzle_name.to_lowercase().replace(" ", "_")),
        &format!("Current step in {} sequence", puzzle_name)
    );
    flag_ids.push(step_flag);

    // Set reward to limbo initially
    if let Some(obj) = game.objects.iter_mut().find(|o| o.id == reward_object_id) {
        obj.location = ObjectLocation::Limbo;
    }

    // Create a rule for each correct step
    for (step_num, (verb, noun)) in sequence.iter().enumerate() {
        let rule_id = game.add_rule(
            &format!("{} step {}: {} {}", puzzle_name, step_num + 1, verb, noun),
            ProcessTable::Response
        );
        if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
            rule.conditions.push(Condition {
                id: 0,
                condition_type: ConditionType::VerbIs { verb: verb.to_uppercase() },
            });
            rule.conditions.push(Condition {
                id: 1,
                condition_type: ConditionType::NounIs { noun: noun.to_uppercase() },
            });
            rule.conditions.push(Condition {
                id: 2,
                condition_type: ConditionType::PlayerAt { location_id: puzzle_location },
            });
            rule.conditions.push(Condition {
                id: 3,
                condition_type: ConditionType::FlagEquals { flag_id: step_flag, value: step_num as u8 },
            });

            if step_num == sequence.len() - 1 {
                // Final step - success!
                rule.actions.push(Action {
                    id: 0,
                    action_type: ActionType::SetFlag { flag_id: step_flag, value: (step_num + 1) as u8 },
                });
                rule.actions.push(Action {
                    id: 1,
                    action_type: ActionType::MoveObject {
                        object_id: reward_object_id,
                        to_location: ObjectLocation::Location(puzzle_location)
                    },
                });
                rule.actions.push(Action {
                    id: 2,
                    action_type: ActionType::ShowMessage {
                        text: format!("✓ *CLICK* The {} solves! A secret compartment opens!", puzzle_name.to_lowercase())
                    },
                });
                rule.actions.push(Action {
                    id: 3,
                    action_type: ActionType::AddScore { points: 20 },
                });
            } else {
                // Intermediate step
                rule.actions.push(Action {
                    id: 0,
                    action_type: ActionType::SetFlag { flag_id: step_flag, value: (step_num + 1) as u8 },
                });
                rule.actions.push(Action {
                    id: 1,
                    action_type: ActionType::ShowMessage {
                        text: "*Click* Something happens...".to_string()
                    },
                });
            }
            rule.actions.push(Action {
                id: 4,
                action_type: ActionType::EndTurn,
            });
        }
        rule_ids.push(rule_id);
    }

    // Rule: Wrong action resets puzzle
    let rule_id = game.add_rule(&format!("{} wrong action resets", puzzle_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::PlayerAt { location_id: puzzle_location },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagNotZero { flag_id: step_flag },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagLessThan { flag_id: step_flag, value: sequence.len() as u8 },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: step_flag, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage {
                text: "*BUZZ* Wrong! The puzzle resets.".to_string()
            },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    rule_ids.push(rule_id);

    let sequence_text = sequence.iter()
        .map(|(v, n)| format!("{} {}", v.to_uppercase(), n.to_uppercase()))
        .collect::<Vec<_>>()
        .join(", then ");

    TemplateResult {
        object_ids: vec![reward_object_id],
        location_ids: vec![puzzle_location],
        flag_ids,
        rule_ids,
        success_message: format!("Created sequence puzzle! Perform: {}", sequence_text),
    }
}

/// 🎯 Fetchquest Chain template (Extended trading sequence)
/// NPC1 wants A → gives B, NPC2 wants B → gives C, NPC3 wants C → gives final reward
pub fn apply_fetchquest_chain_template(
    game: &mut DaadGame,
    chain: Vec<FetchquestLink>,
) -> TemplateResult {
    let mut rule_ids = Vec::new();
    let mut flag_ids = Vec::new();
    let mut object_ids = Vec::new();
    let mut location_ids = Vec::new();

    for (idx, link) in chain.iter().enumerate() {
        location_ids.push(link.npc_location);
        object_ids.push(link.wants_object);
        object_ids.push(link.gives_object);

        // Create traded flag for this step
        let traded_flag = game.add_flag(
            &format!("fetchquest_step_{}_done", idx),
            &format!("Fetchquest step {} completed", idx + 1)
        );
        flag_ids.push(traded_flag);

        let wants_name = game.get_object(link.wants_object)
            .map(|o| o.name.clone())
            .unwrap_or_else(|| format!("item{}", idx));
        let gives_name = game.get_object(link.gives_object)
            .map(|o| o.name.clone())
            .unwrap_or_else(|| format!("item{}", idx + 1));

        // Set next item to limbo initially (appears after trade)
        if let Some(obj) = game.objects.iter_mut().find(|o| o.id == link.gives_object) {
            obj.location = ObjectLocation::Limbo;
        }

        // Check if previous step is complete (for chain validation)
        let mut conditions_prefix = vec![];
        if idx > 0 {
            conditions_prefix.push(Condition {
                id: 0,
                condition_type: ConditionType::FlagNotZero { flag_id: flag_ids[idx - 1] },
            });
        }

        // Rule: GIVE item TO npc
        let rule_id = game.add_rule(
            &format!("Fetchquest step {}: Give {} to {}", idx + 1, wants_name, link.npc_name),
            ProcessTable::Response
        );
        if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
            let mut cond_id = 0;
            for cond in conditions_prefix {
                rule.conditions.push(cond);
                cond_id += 1;
            }

            rule.conditions.push(Condition {
                id: cond_id,
                condition_type: ConditionType::VerbIs { verb: "GIVE".to_string() },
            });
            cond_id += 1;
            rule.conditions.push(Condition {
                id: cond_id,
                condition_type: ConditionType::PlayerAt { location_id: link.npc_location },
            });
            cond_id += 1;
            rule.conditions.push(Condition {
                id: cond_id,
                condition_type: ConditionType::ObjectCarried { object_id: link.wants_object },
            });
            cond_id += 1;
            rule.conditions.push(Condition {
                id: cond_id,
                condition_type: ConditionType::FlagZero { flag_id: traded_flag },
            });

            rule.actions.push(Action {
                id: 0,
                action_type: ActionType::MoveObject {
                    object_id: link.wants_object,
                    to_location: ObjectLocation::Limbo
                },
            });
            rule.actions.push(Action {
                id: 1,
                action_type: ActionType::MoveObject {
                    object_id: link.gives_object,
                    to_location: ObjectLocation::Carried
                },
            });
            rule.actions.push(Action {
                id: 2,
                action_type: ActionType::SetFlag { flag_id: traded_flag, value: 1 },
            });
            rule.actions.push(Action {
                id: 3,
                action_type: ActionType::ShowMessage {
                    text: format!("{} says: 'Excellent! Here's your {}.'", link.npc_name, gives_name.to_lowercase())
                },
            });

            // Extra reward for final link
            if idx == chain.len() - 1 {
                rule.actions.push(Action {
                    id: 4,
                    action_type: ActionType::AddScore { points: 30 },
                });
            } else {
                rule.actions.push(Action {
                    id: 4,
                    action_type: ActionType::AddScore { points: 10 },
                });
            }

            rule.actions.push(Action {
                id: 5,
                action_type: ActionType::EndTurn,
            });
        }
        rule_ids.push(rule_id);
    }

    TemplateResult {
        object_ids,
        location_ids,
        flag_ids,
        rule_ids,
        success_message: format!("Created {}-step fetchquest chain! Trade items with each NPC in sequence.", chain.len()),
    }
}

/// Link in a fetchquest chain
pub struct FetchquestLink {
    pub npc_name: String,
    pub npc_location: u8,
    pub wants_object: u8,
    pub gives_object: u8,
}
