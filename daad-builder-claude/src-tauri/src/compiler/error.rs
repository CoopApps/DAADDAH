// Compiler error types

use std::fmt;

#[derive(Debug)]
pub enum CompilerError {
    // Parsing errors
    ParseError { line: usize, column: usize, message: String },
    UnexpectedToken { expected: String, found: String, line: usize },
    InvalidSection { section: String, line: usize },

    // Semantic errors
    UndefinedVocabulary { word: String, line: usize },
    DuplicateDefinition { item: String, id: u8 },
    NonConsecutiveNumbering { item: String, expected: u8, found: u8 },

    // Validation errors
    TooManyObjects { count: usize, max: usize },
    TooManyMessages { count: usize },
    ObjectWeightTooHigh { object: u8, weight: u8 },
    InvalidLocation { location: u8 },

    // Code generation errors
    CodegenError { message: String },
    UnsupportedFeature { feature: String },

    // IO errors
    IoError(std::io::Error),

    // Platform errors
    PlatformError { platform: String, message: String },
}

impl fmt::Display for CompilerError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CompilerError::ParseError { line, column, message } => {
                write!(f, "Parse error at line {}, column {}: {}", line, column, message)
            }
            CompilerError::UnexpectedToken { expected, found, line } => {
                write!(f, "Line {}: Expected {}, found {}", line, expected, found)
            }
            CompilerError::InvalidSection { section, line } => {
                write!(f, "Line {}: Invalid section '{}'", line, section)
            }
            CompilerError::UndefinedVocabulary { word, line } => {
                write!(f, "Line {}: Undefined vocabulary word '{}'", line, word)
            }
            CompilerError::DuplicateDefinition { item, id } => {
                write!(f, "{} {} is defined multiple times", item, id)
            }
            CompilerError::NonConsecutiveNumbering { item, expected, found } => {
                write!(f, "{} numbering gap: expected {}, found {}", item, expected, found)
            }
            CompilerError::TooManyObjects { count, max } => {
                write!(f, "Too many objects: {} (maximum {})", count, max)
            }
            CompilerError::TooManyMessages { count } => {
                write!(f, "Too many messages: {} (maximum 255)", count)
            }
            CompilerError::ObjectWeightTooHigh { object, weight } => {
                write!(f, "Object {} weight {} exceeds maximum of 63", object, weight)
            }
            CompilerError::InvalidLocation { location } => {
                write!(f, "Invalid location reference: {}", location)
            }
            CompilerError::CodegenError { message } => {
                write!(f, "Code generation error: {}", message)
            }
            CompilerError::UnsupportedFeature { feature } => {
                write!(f, "Unsupported feature: {}", feature)
            }
            CompilerError::IoError(e) => {
                write!(f, "IO error: {}", e)
            }
            CompilerError::PlatformError { platform, message } => {
                write!(f, "Platform '{}' error: {}", platform, message)
            }
        }
    }
}

impl std::error::Error for CompilerError {}

impl From<std::io::Error> for CompilerError {
    fn from(err: std::io::Error) -> Self {
        CompilerError::IoError(err)
    }
}

pub type CompilerResult<T> = Result<T, CompilerError>;
