use serde_json::Value;

#[derive(Debug, Clone)]
pub struct ValidationError {
    pub field_path: String,
    pub error_type: String,
    pub message: String,
}

pub struct ValidationResult {
    pub errors: Vec<ValidationError>,
}

impl ValidationResult {
    pub fn new() -> Self {
        Self { errors: Vec::new() }
    }

    pub fn add_error(&mut self, field_path: String, error_type: String, message: String) {
        self.errors.push(ValidationError {
            field_path,
            error_type,
            message,
        });
    }

    pub fn is_valid(&self) -> bool {
        self.errors.is_empty()
    }

    pub fn to_error_message(&self) -> String {
        if self.errors.is_empty() {
            return "No errors found".to_string();
        }

        let mut msg = format!("Found {} validation error(s):\n\n", self.errors.len());
        for (i, error) in self.errors.iter().enumerate() {
            msg.push_str(&format!(
                "{}. [{}] {}: {}\n",
                i + 1,
                error.field_path,
                error.error_type,
                error.message
            ));
        }
        msg
    }
}

/// Validate game JSON before deserialization
pub fn validate_game_json(json: &Value) -> ValidationResult {
    let mut result = ValidationResult::new();

    // Check root is an object
    if !json.is_object() {
        result.add_error(
            "root".to_string(),
            "Invalid Type".to_string(),
            "Game data must be a JSON object".to_string(),
        );
        return result;
    }

    let obj = json.as_object().unwrap();

    // Validate locations array
    if let Some(locations) = obj.get("locations") {
        if let Some(arr) = locations.as_array() {
            for (i, loc) in arr.iter().enumerate() {
                validate_location(loc, i, &mut result);
            }
        } else {
            result.add_error(
                "locations".to_string(),
                "Invalid Type".to_string(),
                "locations must be an array".to_string(),
            );
        }
    }

    // Validate objects array
    if let Some(objects) = obj.get("objects") {
        if let Some(arr) = objects.as_array() {
            for (i, obj_item) in arr.iter().enumerate() {
                validate_object(obj_item, i, &mut result);
            }
        } else {
            result.add_error(
                "objects".to_string(),
                "Invalid Type".to_string(),
                "objects must be an array".to_string(),
            );
        }
    }

    // Validate vocabulary array
    if let Some(vocabulary) = obj.get("vocabulary") {
        if let Some(arr) = vocabulary.as_array() {
            for (i, vocab) in arr.iter().enumerate() {
                validate_vocab_entry(vocab, i, &mut result);
            }
        } else {
            result.add_error(
                "vocabulary".to_string(),
                "Invalid Type".to_string(),
                "vocabulary must be an array".to_string(),
            );
        }
    }

    // Validate flags array
    if let Some(flags) = obj.get("flags") {
        if let Some(arr) = flags.as_array() {
            for (i, flag) in arr.iter().enumerate() {
                validate_flag(flag, i, &mut result);
            }
        } else {
            result.add_error(
                "flags".to_string(),
                "Invalid Type".to_string(),
                "flags must be an array".to_string(),
            );
        }
    }

    // Validate music array
    if let Some(music) = obj.get("music") {
        if let Some(arr) = music.as_array() {
            for (i, track) in arr.iter().enumerate() {
                validate_music(track, i, &mut result);
            }
        } else {
            result.add_error(
                "music".to_string(),
                "Invalid Type".to_string(),
                "music must be an array".to_string(),
            );
        }
    }

    result
}

fn validate_location(loc: &Value, index: usize, result: &mut ValidationResult) {
    let path = format!("locations[{}]", index);

    if !loc.is_object() {
        result.add_error(
            path,
            "Invalid Type".to_string(),
            "Location must be an object".to_string(),
        );
        return;
    }

    let obj = loc.as_object().unwrap();

    // Required fields
    check_required_field(obj, &path, "id", "number", result);
    check_required_field(obj, &path, "name", "string", result);
    check_required_field(obj, &path, "description", "string", result);

    // Check isDark field exists and is boolean
    if let Some(is_dark) = obj.get("isDark") {
        if !is_dark.is_boolean() {
            result.add_error(
                format!("{}.isDark", path),
                "Invalid Type".to_string(),
                "isDark must be a boolean".to_string(),
            );
        }
    }

    // Check exits field (should be object with direction properties)
    if let Some(exits) = obj.get("exits") {
        if let Some(exits_obj) = exits.as_object() {
            for (dir, target) in exits_obj {
                if !target.is_null() && !target.is_number() {
                    result.add_error(
                        format!("{}.exits.{}", path, dir),
                        "Invalid Type".to_string(),
                        format!("Exit '{}' target must be a number or null", dir),
                    );
                }
            }
        } else {
            result.add_error(
                format!("{}.exits", path),
                "Invalid Type".to_string(),
                "exits must be an object".to_string(),
            );
        }
    }
}

fn validate_object(obj: &Value, index: usize, result: &mut ValidationResult) {
    let path = format!("objects[{}]", index);

    if !obj.is_object() {
        result.add_error(
            path,
            "Invalid Type".to_string(),
            "Object must be an object".to_string(),
        );
        return;
    }

    let obj_data = obj.as_object().unwrap();

    // Required fields
    check_required_field(obj_data, &path, "id", "number", result);
    check_required_field(obj_data, &path, "noun", "string", result);

    // Check location field structure
    if let Some(location) = obj_data.get("location") {
        validate_object_location(location, &format!("{}.location", path), result);
    } else {
        result.add_error(
            format!("{}.location", path),
            "Missing Field".to_string(),
            "location field is required".to_string(),
        );
    }
}

fn validate_object_location(loc: &Value, path: &str, result: &mut ValidationResult) {
    if !loc.is_object() {
        result.add_error(
            path.to_string(),
            "Invalid Type".to_string(),
            "location must be an object with 'type' field".to_string(),
        );
        return;
    }

    let obj = loc.as_object().unwrap();

    if let Some(loc_type) = obj.get("type") {
        if let Some(type_str) = loc_type.as_str() {
            match type_str {
                "at" => {
                    check_required_field(obj, path, "locationId", "number", result);
                }
                "inside" => {
                    check_required_field(obj, path, "containerId", "number", result);
                }
                "carried" | "worn" | "limbo" => {
                    // These types don't need additional fields
                }
                _ => {
                    result.add_error(
                        format!("{}.type", path),
                        "Invalid Value".to_string(),
                        format!(
                            "Unknown location type '{}'. Expected: at, carried, worn, inside, limbo",
                            type_str
                        ),
                    );
                }
            }
        } else {
            result.add_error(
                format!("{}.type", path),
                "Invalid Type".to_string(),
                "type must be a string".to_string(),
            );
        }
    } else {
        result.add_error(
            format!("{}.type", path),
            "Missing Field".to_string(),
            "type field is required".to_string(),
        );
    }
}

fn validate_vocab_entry(vocab: &Value, index: usize, result: &mut ValidationResult) {
    let path = format!("vocabulary[{}]", index);

    if !vocab.is_object() {
        result.add_error(
            path,
            "Invalid Type".to_string(),
            "Vocabulary entry must be an object".to_string(),
        );
        return;
    }

    let obj = vocab.as_object().unwrap();

    check_required_field(obj, &path, "word", "string", result);
    check_required_field(obj, &path, "id", "number", result);

    // Check wordType
    if let Some(word_type) = obj.get("wordType") {
        if let Some(type_str) = word_type.as_str() {
            let valid_types = ["verb", "noun", "adjective", "adverb", "preposition"];
            if !valid_types.contains(&type_str) {
                result.add_error(
                    format!("{}.wordType", path),
                    "Invalid Value".to_string(),
                    format!(
                        "Unknown wordType '{}'. Expected: {}",
                        type_str,
                        valid_types.join(", ")
                    ),
                );
            }
        } else {
            result.add_error(
                format!("{}.wordType", path),
                "Invalid Type".to_string(),
                "wordType must be a string".to_string(),
            );
        }
    } else {
        result.add_error(
            format!("{}.wordType", path),
            "Missing Field".to_string(),
            "wordType field is required".to_string(),
        );
    }
}

fn validate_flag(flag: &Value, index: usize, result: &mut ValidationResult) {
    let path = format!("flags[{}]", index);

    if !flag.is_object() {
        result.add_error(
            path,
            "Invalid Type".to_string(),
            "Flag must be an object".to_string(),
        );
        return;
    }

    let obj = flag.as_object().unwrap();

    check_required_field(obj, &path, "id", "number", result);
    check_required_field(obj, &path, "initialValue", "number", result);
    // name and description have defaults, so not strictly required
}

fn validate_music(music: &Value, index: usize, result: &mut ValidationResult) {
    let path = format!("music[{}]", index);

    if !music.is_object() {
        result.add_error(
            path,
            "Invalid Type".to_string(),
            "Music must be an object".to_string(),
        );
        return;
    }

    let obj = music.as_object().unwrap();

    check_required_field(obj, &path, "id", "number", result);
    check_required_field(obj, &path, "tempo", "number", result);
    check_required_field(obj, &path, "shape", "number", result);
    check_required_field(obj, &path, "volume", "number", result);
    check_required_field(obj, &path, "notes", "array", result);
    // name has default, so not strictly required
}

fn check_required_field(
    obj: &serde_json::Map<String, Value>,
    path: &str,
    field_name: &str,
    expected_type: &str,
    result: &mut ValidationResult,
) {
    if let Some(value) = obj.get(field_name) {
        let type_matches = match expected_type {
            "string" => value.is_string(),
            "number" => value.is_number(),
            "boolean" => value.is_boolean(),
            "array" => value.is_array(),
            "object" => value.is_object(),
            _ => false,
        };

        if !type_matches {
            result.add_error(
                format!("{}.{}", path, field_name),
                "Invalid Type".to_string(),
                format!("Expected {}, found {}", expected_type, get_json_type(value)),
            );
        }
    } else {
        result.add_error(
            format!("{}.{}", path, field_name),
            "Missing Field".to_string(),
            format!("{} field is required", field_name),
        );
    }
}

fn get_json_type(value: &Value) -> &'static str {
    if value.is_string() {
        "string"
    } else if value.is_number() {
        "number"
    } else if value.is_boolean() {
        "boolean"
    } else if value.is_array() {
        "array"
    } else if value.is_object() {
        "object"
    } else if value.is_null() {
        "null"
    } else {
        "unknown"
    }
}
