use crate::daad::types::*;
use crate::daad::game::DaadGame;

/// Object behavior presets that auto-generate rules
/// Each preset creates a complete set of rules for common puzzle patterns

/// Container behavior preset
/// Generates rules for: OPEN, CLOSE, PUT X IN Y, TAKE X FROM Y
pub fn apply_container_preset(game: &mut DaadGame, object_id: u8) -> Vec<usize> {
    let mut created_rule_ids = Vec::new();

    // Get object info
    let Some(object) = game.objects.iter().find(|o| o.id == object_id) else {
        return created_rule_ids;
    };
    let object_name = object.name.clone();

    // Find or create flags for this object's state
    let open_flag_id = find_or_create_flag(game, &format!("{}_open", object_name), "Is container open");
    let locked_flag_id = find_or_create_flag(game, &format!("{}_locked", object_name), "Is container locked");

    // Rule 1: OPEN [container] (if unlocked)
    let rule_id = game.add_rule(&format!("Open {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "OPEN".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectPresent { object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: locked_flag_id },
        });
        rule.conditions.push(Condition {
            id: 4,
            condition_type: ConditionType::FlagZero { flag_id: open_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: open_flag_id, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("You open the {}.", object_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 2: CLOSE [container]
    let rule_id = game.add_rule(&format!("Close {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "CLOSE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectPresent { object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagNotZero { flag_id: open_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: open_flag_id, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("You close the {}.", object_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 3: Can't take from closed container
    let rule_id = game.add_rule(&format!("Can't take from closed {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "TAKE".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagZero { flag_id: open_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage { text: format!("The {} is closed.", object_name) },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    created_rule_ids
}

/// Lockable object preset
/// Generates rules for: LOCK, UNLOCK (with key check)
pub fn apply_lockable_preset(game: &mut DaadGame, object_id: u8, key_id: u8) -> Vec<usize> {
    let mut created_rule_ids = Vec::new();

    let Some(object) = game.objects.iter().find(|o| o.id == object_id) else {
        return created_rule_ids;
    };
    let object_name = object.name.clone();

    let Some(key) = game.objects.iter().find(|o| o.id == key_id) else {
        return created_rule_ids;
    };
    let key_name = key.name.clone();

    let locked_flag_id = find_or_create_flag(game, &format!("{}_locked", object_name), "Is locked");

    // Rule 1: UNLOCK [object] WITH [key]
    let rule_id = game.add_rule(&format!("Unlock {} with {}", object_name, key_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "UNLOCK".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id: key_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagNotZero { flag_id: locked_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: locked_flag_id, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("You unlock the {} with the {}.", object_name, key_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 2: LOCK [object] WITH [key]
    let rule_id = game.add_rule(&format!("Lock {} with {}", object_name, key_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "LOCK".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id: key_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: locked_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: locked_flag_id, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("You lock the {} with the {}.", object_name, key_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 3: Can't open when locked
    let rule_id = game.add_rule(&format!("Can't open locked {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "OPEN".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::FlagNotZero { flag_id: locked_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage { text: format!("The {} is locked.", object_name) },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    created_rule_ids
}

/// Light source preset
/// Generates rules for: LIGHT, EXTINGUISH, auto-turn consumption
pub fn apply_light_source_preset(game: &mut DaadGame, object_id: u8, fuel_amount: u8) -> Vec<usize> {
    let mut created_rule_ids = Vec::new();

    let Some(object) = game.objects.iter().find(|o| o.id == object_id) else {
        return created_rule_ids;
    };
    let object_name = object.name.clone();

    let lit_flag_id = find_or_create_flag(game, &format!("{}_lit", object_name), "Is light source lit");
    let fuel_flag_id = find_or_create_flag(game, &format!("{}_fuel", object_name), "Fuel remaining");

    // Set initial fuel
    if let Some(flag) = game.flags.iter_mut().find(|f| f.id == fuel_flag_id) {
        flag.initial_value = fuel_amount;
    }

    // Rule 1: LIGHT [object]
    let rule_id = game.add_rule(&format!("Light {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "LIGHT".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagZero { flag_id: lit_flag_id },
        });
        rule.conditions.push(Condition {
            id: 4,
            condition_type: ConditionType::FlagNotZero { flag_id: fuel_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: lit_flag_id, value: 1 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("The {} is now lit.", object_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 2: EXTINGUISH [object]
    let rule_id = game.add_rule(&format!("Extinguish {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "EXTINGUISH".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectCarried { object_id },
        });
        rule.conditions.push(Condition {
            id: 3,
            condition_type: ConditionType::FlagNotZero { flag_id: lit_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: lit_flag_id, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("You extinguish the {}.", object_name) },
        });
        rule.actions.push(Action {
            id: 2,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 3: Consume fuel each turn (auto-action)
    let rule_id = game.add_rule(&format!("{} fuel consumption", object_name), ProcessTable::AutoAction);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::FlagNotZero { flag_id: lit_flag_id },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagNotZero { flag_id: fuel_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::DecrementFlag { flag_id: fuel_flag_id },
        });
    }
    created_rule_ids.push(rule_id);

    // Rule 4: Light goes out when fuel exhausted
    let rule_id = game.add_rule(&format!("{} runs out of fuel", object_name), ProcessTable::AutoAction);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::FlagNotZero { flag_id: lit_flag_id },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::FlagZero { flag_id: fuel_flag_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::SetFlag { flag_id: lit_flag_id, value: 0 },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::ShowMessage { text: format!("The {} flickers and goes out.", object_name) },
        });
    }
    created_rule_ids.push(rule_id);

    created_rule_ids
}

/// Readable object preset
/// Generates rules for: READ [object]
pub fn apply_readable_preset(game: &mut DaadGame, object_id: u8, text_content: &str) -> Vec<usize> {
    let mut created_rule_ids = Vec::new();

    let Some(object) = game.objects.iter().find(|o| o.id == object_id) else {
        return created_rule_ids;
    };
    let object_name = object.name.clone();

    // Rule: READ [object]
    let rule_id = game.add_rule(&format!("Read {}", object_name), ProcessTable::Response);
    if let Some(rule) = game.rules.iter_mut().find(|r| r.id == rule_id) {
        rule.conditions.push(Condition {
            id: 0,
            condition_type: ConditionType::VerbIs { verb: "READ".to_string() },
        });
        rule.conditions.push(Condition {
            id: 1,
            condition_type: ConditionType::NounIs { noun: object_name.to_uppercase() },
        });
        rule.conditions.push(Condition {
            id: 2,
            condition_type: ConditionType::ObjectPresent { object_id },
        });
        rule.actions.push(Action {
            id: 0,
            action_type: ActionType::ShowMessage { text: text_content.to_string() },
        });
        rule.actions.push(Action {
            id: 1,
            action_type: ActionType::EndTurn,
        });
    }
    created_rule_ids.push(rule_id);

    created_rule_ids
}

/// Helper: Find existing flag or create new one
fn find_or_create_flag(game: &mut DaadGame, name: &str, description: &str) -> u8 {
    // Try to find existing flag with this name
    if let Some(flag) = game.flags.iter().find(|f| f.name == name) {
        return flag.id;
    }

    // Create new flag
    game.add_flag(name, description)
}
