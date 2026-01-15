// Text input component for Bevy UI
use bevy::prelude::*;

/// Text input field component
#[derive(Component)]
pub struct TextInput {
    pub value: String,
    pub placeholder: String,
    pub is_focused: bool,
    pub max_length: Option<usize>,
    pub field_id: String,
}

impl TextInput {
    pub fn new(field_id: &str, placeholder: &str) -> Self {
        Self {
            value: String::new(),
            placeholder: placeholder.to_string(),
            is_focused: false,
            max_length: None,
            field_id: field_id.to_string(),
        }
    }

    pub fn with_value(mut self, value: String) -> Self {
        self.value = value;
        self
    }

    pub fn with_max_length(mut self, max_length: usize) -> Self {
        self.max_length = Some(max_length);
        self
    }
}

/// System to handle keyboard input for focused text fields
pub fn handle_text_input(
    mut char_input_events: EventReader<ReceivedCharacter>,
    keys: Res<Input<KeyCode>>,
    mut query: Query<&mut TextInput>,
) {
    for mut input in query.iter_mut() {
        if !input.is_focused {
            continue;
        }

        // Handle backspace
        if keys.just_pressed(KeyCode::Back) {
            input.value.pop();
        }

        // Handle character input
        for event in char_input_events.iter() {
            let c = event.char;

            // Skip control characters
            if c.is_control() {
                continue;
            }

            // Check max length
            if let Some(max_len) = input.max_length {
                if input.value.len() >= max_len {
                    continue;
                }
            }

            input.value.push(c);
        }
    }
}

/// System to handle clicking on text input fields to focus them
pub fn handle_text_input_focus(
    mut interaction_query: Query<
        (&Interaction, &mut TextInput),
        Changed<Interaction>,
    >,
    mut all_inputs: Query<&mut TextInput>,
) {
    for (interaction, mut clicked_input) in interaction_query.iter_mut() {
        if *interaction == Interaction::Pressed {
            // Unfocus all other inputs
            for mut input in all_inputs.iter_mut() {
                input.is_focused = false;
            }
            // Focus this one
            clicked_input.is_focused = true;
        }
    }
}

/// Marker component for text input label (shows current value)
#[derive(Component)]
pub struct TextInputLabel {
    pub for_field_id: String,
}

/// System to update text input display labels
pub fn update_text_input_labels(
    inputs: Query<&TextInput, Changed<TextInput>>,
    mut labels: Query<(&mut Text, &TextInputLabel)>,
) {
    for (mut text, label) in labels.iter_mut() {
        if let Some(input) = inputs.iter().find(|i| i.field_id == label.for_field_id) {
            let display_text = if input.value.is_empty() && !input.is_focused {
                &input.placeholder
            } else {
                &input.value
            };

            let cursor = if input.is_focused { "|" } else { "" };

            text.sections[0].value = format!("{}{}", display_text, cursor);
            text.sections[0].style.color = if input.value.is_empty() && !input.is_focused {
                Color::rgb(0.5, 0.5, 0.5)
            } else {
                Color::WHITE
            };
        }
    }
}
