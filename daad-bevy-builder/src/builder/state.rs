use bevy::prelude::*;
use crate::daad::game::DaadGame;

/// Builder application state
#[derive(Resource)]
pub struct BuilderState {
    pub current_game: DaadGame,
    pub selected_panel: Panel,
    pub editing: Option<EditMode>,
    pub show_code_viewer: bool,
    pub show_preview: bool,
    pub unsaved_changes: bool,
    pub current_file_path: Option<String>,
}

impl Default for BuilderState {
    fn default() -> Self {
        Self {
            current_game: DaadGame::default(),
            selected_panel: Panel::default(),
            editing: None,
            show_code_viewer: true,  // Show code by default
            show_preview: false,
            unsaved_changes: false,
            current_file_path: None,
        }
    }
}

/// Which panel is currently active
#[derive(Default, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Panel {
    #[default]
    GameInfo,      // Title, author, settings
    Locations,     // Location editor
    Objects,       // Object editor
    Rules,         // Rule/logic editor
    Flags,         // Flag manager
    Messages,      // Message editor
    Preview,       // Test the game
    Export,        // Export options
}

impl Panel {
    pub fn as_str(&self) -> &'static str {
        match self {
            Panel::GameInfo => "Game Info",
            Panel::Locations => "Locations",
            Panel::Objects => "Objects",
            Panel::Rules => "Rules",
            Panel::Flags => "Flags",
            Panel::Messages => "Messages",
            Panel::Preview => "Preview",
            Panel::Export => "Export",
        }
    }

    pub fn icon(&self) -> &'static str {
        match self {
            Panel::GameInfo => "📋",
            Panel::Locations => "📍",
            Panel::Objects => "📦",
            Panel::Rules => "⚙️",
            Panel::Flags => "🚩",
            Panel::Messages => "💬",
            Panel::Preview => "▶️",
            Panel::Export => "💾",
        }
    }
}

/// What's currently being edited
#[derive(Debug, Clone)]
pub enum EditMode {
    Location(u8),   // Editing location ID
    Object(u8),     // Editing object ID
    Rule(usize),    // Editing rule ID
    Flag(u8),       // Editing flag ID
    Message(usize), // Editing message ID
    None,           // Nothing being edited
}

impl BuilderState {
    /// Mark that changes have been made
    pub fn mark_dirty(&mut self) {
        self.unsaved_changes = true;
    }

    /// Mark that changes have been saved
    pub fn mark_clean(&mut self) {
        self.unsaved_changes = false;
    }

    /// Switch to a different panel
    pub fn select_panel(&mut self, panel: Panel) {
        self.selected_panel = panel;
        self.editing = None;
    }

    /// Start editing an item
    pub fn start_editing(&mut self, mode: EditMode) {
        self.editing = Some(mode);
    }

    /// Stop editing
    pub fn stop_editing(&mut self) {
        self.editing = None;
    }

    /// Save current game to file
    pub fn save_game(&mut self, path: &str) -> Result<(), std::io::Error> {
        self.current_game.save_to_file(path)?;
        self.current_file_path = Some(path.to_string());
        self.mark_clean();
        Ok(())
    }

    /// Load game from file
    pub fn load_game(&mut self, path: &str) -> Result<(), std::io::Error> {
        let game = DaadGame::load_from_file(path)?;
        self.current_game = game;
        self.current_file_path = Some(path.to_string());
        self.mark_clean();
        Ok(())
    }

    /// Create a new game
    pub fn new_game(&mut self, title: &str, author: &str) {
        self.current_game = DaadGame::new(title, author);
        self.current_file_path = None;
        self.mark_clean();
    }
}
