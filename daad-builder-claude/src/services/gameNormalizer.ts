import { DaadGame, Flag } from "../types/daad";

/**
 * Default system flags required by DAAD game engine
 * These flags must always exist for proper game functionality
 */
function getDefaultSystemFlags(): Flag[] {
  return [
    {
      id: 1,
      name: "objects_carried",
      description: "Number of objects currently carried (automatically updated)",
      initialValue: 0,
    },
    {
      id: 37,
      name: "max_carry_objects",
      description: "Maximum number of objects player can carry (DAAD default: 4)",
      initialValue: 4,
    },
    {
      id: 52,
      name: "max_carry_weight",
      description: "Maximum weight player can carry (DAAD default: 10)",
      initialValue: 10,
    },
  ];
}

/**
 * Normalizes and validates game state data for backward compatibility
 *
 * This function ensures that all required fields exist and have valid values,
 * even when loading older save files that may be missing newer properties.
 *
 * @param data - Raw data that should be a DaadGame object
 * @returns Fully normalized DaadGame object with all required fields
 */
export function normalizeGameState(data: unknown): DaadGame {
  // Handle null, undefined, or non-object data
  if (!data || typeof data !== 'object') {
    console.warn("[GameNormalizer] Invalid game data received, returning minimal valid game");
    return createMinimalGame();
  }

  const game = data as any;

  // Normalize all array fields with fallback to empty arrays
  const normalizedGame: DaadGame = {
    // Required string fields with defaults
    partNumber: typeof game.partNumber === 'number' ? game.partNumber : 1,
    title: typeof game.title === 'string' ? game.title : 'Untitled Adventure',
    author: typeof game.author === 'string' ? game.author : '',
    version: typeof game.version === 'string' ? game.version : '1.0',

    // Optional string fields
    introText: typeof game.introText === 'string' ? game.introText : undefined,
    walkthrough: Array.isArray(game.walkthrough) ? game.walkthrough : undefined,

    // Required array fields with fallback
    locations: Array.isArray(game.locations) ? game.locations : [],
    objects: Array.isArray(game.objects) ? game.objects : [],
    rules: Array.isArray(game.rules) ? game.rules : [],
    messages: Array.isArray(game.messages) ? game.messages : [],
    vocabulary: Array.isArray(game.vocabulary) ? game.vocabulary : [],
    music: Array.isArray(game.music) ? game.music : [],

    // Flags array with special handling for system flags
    flags: normalizeFlags(game.flags),
  };

  return normalizedGame;
}

/**
 * Normalizes the flags array and ensures system flags exist
 *
 * @param flags - Raw flags array from loaded game
 * @returns Normalized flags array with guaranteed system flags
 */
function normalizeFlags(flags: unknown): Flag[] {
  // If flags is not an array, start with empty array
  const flagsArray = Array.isArray(flags) ? flags : [];

  // Get default system flags
  const systemFlags = getDefaultSystemFlags();
  const systemFlagIds = new Set(systemFlags.map(f => f.id));

  // Separate user-defined flags from system flags
  const userFlags = flagsArray.filter((f: any) =>
    typeof f === 'object' &&
    f !== null &&
    typeof f.id === 'number' &&
    !systemFlagIds.has(f.id)
  );

  // Check which system flags already exist in the loaded data
  const existingSystemFlags = flagsArray.filter((f: any) =>
    typeof f === 'object' &&
    f !== null &&
    typeof f.id === 'number' &&
    systemFlagIds.has(f.id)
  );

  // Find missing system flags
  const existingSystemFlagIds = new Set(existingSystemFlags.map((f: any) => f.id));
  const missingSystemFlags = systemFlags.filter(f => !existingSystemFlagIds.has(f.id));

  // Combine: existing system flags + missing system flags + user flags
  // This preserves any customizations to system flags while ensuring they exist
  return [...existingSystemFlags, ...missingSystemFlags, ...userFlags];
}

/**
 * Creates a minimal valid game object
 * Used as fallback when data is completely invalid
 */
function createMinimalGame(): DaadGame {
  return {
    partNumber: 1,
    title: 'Untitled Adventure',
    author: '',
    version: '1.0',
    locations: [],
    objects: [],
    rules: [],
    flags: getDefaultSystemFlags(),
    messages: [],
    vocabulary: [],
    music: [],
  };
}
