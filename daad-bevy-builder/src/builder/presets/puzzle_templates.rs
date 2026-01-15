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
