/**
 * Application-wide constants
 */

// Timing constants (in milliseconds)
export const DEBOUNCE_DELAY = 1000; // Auto-save debounce delay
export const AUTO_SAVE_DEBOUNCE = 1000; // Database auto-save delay
export const RESTORE_AUTO_SAVE_DELAY = 500; // Delay before checking for auto-save on mount
export const STATUS_MESSAGE_DURATION = 3000; // How long status messages are shown
export const UNDO_STATUS_DURATION = 1000; // How long undo/redo status is shown
export const DEFAULT_TOAST_DURATION = 3000; // Default toast notification duration
export const DEFAULT_AUTO_WALK_SPEED = 1500; // Milliseconds between auto-walk commands

// History limits
export const MAX_HISTORY_SIZE = 50; // Maximum undo/redo history

// UI constants
export const DEFAULT_LOCATION_X = 100; // Default X position for new locations
export const DEFAULT_LOCATION_Y = 100; // Default Y position for new locations
export const DEFAULT_OBJECT_WEIGHT = 1; // Default weight for new objects

// Database constants
export const MAX_AUTO_BACKUPS = 10; // Maximum number of auto-backups to keep
export const BACKUP_SAVE_SLOTS = 10; // Number of available save slots (0-9)

// Game defaults
export const DEFAULT_MAX_CARRY_OBJECTS = 4; // DAAD default: flag 37
export const DEFAULT_MAX_CARRY_WEIGHT = 10; // DAAD default: flag 52

// Validation constants
export const MIN_GAME_TITLE_LENGTH = 1; // Minimum title length
export const MAX_RULE_NAME_LENGTH = 50; // Maximum rule name length
export const MAX_LOCATION_NAME_LENGTH = 50; // Maximum location name length
export const MAX_OBJECT_NAME_LENGTH = 20; // Maximum object noun/adjective length
export const MAX_VOCAB_WORD_LENGTH = 10; // Maximum vocabulary word length (DAAD limit)
export const MAX_MESSAGE_LENGTH = 255; // Maximum message length
export const MAX_DESCRIPTION_LENGTH = 500; // Maximum description length

// User-safe flag range (to avoid system flags)
export const USER_FLAG_MIN = 64;
export const USER_FLAG_MAX = 255;

// System flags (reserved by DAAD)
export const FLAG_OBJECTS_CARRIED = 1;
export const FLAG_MAX_CARRY_OBJECTS = 37;
export const FLAG_MAX_CARRY_WEIGHT = 52;

// Standardized error messages
export const ERROR_MESSAGES = {
  // Database errors
  DB_INIT_FAILED: "Database initialization failed. Some features may not work.",
  DB_SAVE_FAILED: "Failed to save project to database.",
  DB_LOAD_FAILED: "Failed to load project from database.",
  DB_DELETE_FAILED: "Failed to delete project from database.",
  DB_AUTO_SAVE_FAILED: "Auto-save failed. Your changes may not be preserved.",

  // File operations
  FILE_SAVE_FAILED: "Failed to save file.",
  FILE_LOAD_FAILED: "Failed to load file.",
  FILE_EXPORT_FAILED: "Failed to export project.",
  FILE_INVALID_FORMAT: "Invalid file format.",

  // Validation
  VALIDATION_FAILED: "Project validation failed.",
  VALIDATION_WARNINGS: "Project has validation warnings.",

  // Generic
  UNKNOWN_ERROR: "An unexpected error occurred.",
  OPERATION_CANCELLED: "Operation cancelled.",
} as const;

// Standardized success messages
export const SUCCESS_MESSAGES = {
  PROJECT_SAVED: "Project saved successfully.",
  PROJECT_LOADED: "Project loaded successfully.",
  PROJECT_EXPORTED: "Project exported successfully.",
  PROJECT_DELETED: "Project deleted successfully.",
  BACKUP_CREATED: "Backup created successfully.",
  BACKUP_RESTORED: "Backup restored successfully.",
} as const;
