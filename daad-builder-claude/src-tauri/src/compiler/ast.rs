// Abstract Syntax Tree for DAAD games
//
// This represents the parsed game data in a format optimized
// for bytecode generation

use serde::{Serialize, Deserialize};
use std::collections::HashMap;

/// Target platform for compilation
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum Platform {
    ZXSpectrum48K,
    ZXSpectrum128K,
    C64,
    AmstradCPC,
    MSX,
    Amiga,
    AtariST,
    MSDOS,
    PCW,
    Plus4,
}

impl Platform {
    pub fn max_objects(&self) -> usize {
        match self {
            // V3 platforms (newer)
            Platform::Amiga | Platform::AtariST | Platform::MSDOS => 120,
            // V2 platforms (classic)
            _ => 256,
        }
    }

    pub fn supports_graphics(&self) -> bool {
        !matches!(self, Platform::PCW) // PCW is text-only
    }
}

/// External file reference (EXTERN directive)
#[derive(Debug, Clone)]
pub struct ExternalFile {
    pub filename: String,
    pub data: Vec<u8>,
}

/// Parsed DAAD game ready for compilation
#[derive(Debug, Clone)]
pub struct GameData {
    pub title: String,
    pub author: String,
    pub version: String,
    pub part_number: u8,

    // Vocabulary
    pub vocabulary: Vec<VocabEntry>,
    pub vocab_lookup: HashMap<String, u8>, // word -> id

    // Messages
    pub system_messages: Vec<String>,      // /STX
    pub messages: Vec<String>,             // /MTX
    pub object_texts: Vec<String>,         // /OTX
    pub location_texts: Vec<String>,       // /LTX

    // Game world
    pub objects: Vec<ObjectDef>,
    pub locations: Vec<LocationDef>,

    // Logic
    pub processes: [Vec<ProcessEntry>; 4], // PRO 0-3

    // Initial state
    pub initial_flags: HashMap<u8, u8>,

    // External files
    pub external_files: Vec<ExternalFile>,
}

#[derive(Debug, Clone)]
pub struct VocabEntry {
    pub word: String,  // Max 5 chars, uppercase
    pub id: u8,
    pub word_type: VocabType,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VocabType {
    Verb = 0,
    Noun = 1,
    Adjective = 2,
    Preposition = 3,
    Pronoun = 4,
    Conjugation = 5,
    Adverb = 6,
}

impl VocabType {
    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "verb" => Some(VocabType::Verb),
            "noun" => Some(VocabType::Noun),
            "adjective" => Some(VocabType::Adjective),
            "preposition" => Some(VocabType::Preposition),
            "pronoun" => Some(VocabType::Pronoun),
            "conjugation" => Some(VocabType::Conjugation),
            "adverb" => Some(VocabType::Adverb),
            _ => None,
        }
    }
}

#[derive(Debug, Clone)]
pub struct ObjectDef {
    pub id: u8,
    pub initial_location: u8,     // 252=limbo, 253=worn, 254=carried
    pub weight: u8,                // 0-63
    pub is_container: bool,
    pub is_wearable: bool,
    pub custom_flags: [bool; 16],  // f15 to f0
    pub noun: Option<u8>,          // vocab id or None
    pub adjective: Option<u8>,     // vocab id or None
}

#[derive(Debug, Clone)]
pub struct LocationDef {
    pub id: u8,
    pub connections: Vec<Connection>,
    pub is_dark: bool,
}

#[derive(Debug, Clone)]
pub struct Connection {
    pub direction: u8,        // vocab id for direction
    pub target: u8,           // target location
    pub is_blocked: bool,     // V3 only
}

/// Process entry (verb/noun pair with condacts)
#[derive(Debug, Clone)]
pub struct ProcessEntry {
    pub verb: u8,             // vocab id or 255 for wildcard
    pub noun: u8,             // vocab id or 255 for wildcard
    pub condacts: Vec<CondAct>,
}

/// Condition or Action
#[derive(Debug, Clone)]
pub struct CondAct {
    pub opcode: u8,
    pub params: Vec<u8>,
}

impl GameData {
    pub fn new(title: String, author: String, version: String) -> Self {
        Self {
            title,
            author,
            version,
            part_number: 1,
            vocabulary: Vec::new(),
            vocab_lookup: HashMap::new(),
            system_messages: Vec::new(),
            messages: Vec::new(),
            object_texts: Vec::new(),
            location_texts: Vec::new(),
            objects: Vec::new(),
            locations: Vec::new(),
            processes: [Vec::new(), Vec::new(), Vec::new(), Vec::new()],
            initial_flags: HashMap::new(),
            external_files: Vec::new(),
        }
    }

    /// Lookup vocabulary word by string
    pub fn get_vocab_id(&self, word: &str) -> Option<u8> {
        self.vocab_lookup.get(&word.to_uppercase()).copied()
    }

    /// Validate game data before compilation
    pub fn validate(&self, platform: Platform) -> Result<(), crate::compiler::CompilerError> {
        use crate::compiler::CompilerError;

        // Check object count
        if self.objects.len() > platform.max_objects() {
            return Err(CompilerError::TooManyObjects {
                count: self.objects.len(),
                max: platform.max_objects(),
            });
        }

        // Check message counts
        if self.messages.len() > 255 {
            return Err(CompilerError::TooManyMessages {
                count: self.messages.len(),
            });
        }

        // Check object weights
        for obj in &self.objects {
            if obj.weight > 63 {
                return Err(CompilerError::ObjectWeightTooHigh {
                    object: obj.id,
                    weight: obj.weight,
                });
            }
        }

        // Check consecutive numbering
        for (i, obj) in self.objects.iter().enumerate() {
            if obj.id as usize != i {
                return Err(CompilerError::NonConsecutiveNumbering {
                    item: "Object".to_string(),
                    expected: i as u8,
                    found: obj.id,
                });
            }
        }

        for (i, loc) in self.locations.iter().enumerate() {
            if loc.id as usize != i {
                return Err(CompilerError::NonConsecutiveNumbering {
                    item: "Location".to_string(),
                    expected: i as u8,
                    found: loc.id,
                });
            }
        }

        Ok(())
    }
}
