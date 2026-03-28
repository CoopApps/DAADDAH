import { Music, MusicNote } from "../types/daad";

/**
 * DAAD Music Library
 *
 * A comprehensive collection of sound effects and musical pieces for DAAD games.
 * Each track is designed to work on all DAAD-supported platforms (ZX Spectrum, C64, Amstrad CPC, MSX, Amiga, PC).
 *
 * Usage:
 * - Import tracks into your game's music array
 * - Reference by ID in XPLAY actions within rules
 * - IDs start at 0 and increment sequentially
 *
 * Categories:
 * - Sound Effects (0-29): UI feedback, interactions, environment
 * - Musical Pieces (30-49): Themes, ambience, cutscenes
 */

// Helper function to create note sequences easily
function notes(sequence: Array<[string, number, number, boolean?]>): MusicNote[] {
  return sequence.map(([note, octave, duration, dotted = false]) => ({
    note: note as any,
    octave,
    duration: duration as any,
    dotted,
  }));
}

export const MUSIC_LIBRARY: Music[] = [
  // ==========================================
  // SOUND EFFECTS (IDs 0-29)
  // ==========================================

  // --- UI & Feedback (0-9) ---
  {
    id: 0,
    name: "Item Pickup",
    tempo: 180,
    shape: 2,
    volume: 8000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 8],
    ]),
  },
  {
    id: 1,
    name: "Item Drop",
    tempo: 180,
    shape: 2,
    volume: 8000,
    notes: notes([
      ["G", 3, 16],
      ["E", 3, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 2,
    name: "Success/Confirm",
    tempo: 200,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 3,
    name: "Error/Deny",
    tempo: 150,
    shape: 3,
    volume: 10000,
    notes: notes([
      ["E", 3, 16],
      ["D#", 3, 16],
      ["D", 3, 8],
    ]),
  },
  {
    id: 4,
    name: "Menu Select",
    tempo: 240,
    shape: 2,
    volume: 6000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
    ]),
  },
  {
    id: 5,
    name: "Menu Navigate",
    tempo: 240,
    shape: 2,
    volume: 5000,
    notes: notes([
      ["C", 3, 32],
    ]),
  },
  {
    id: 6,
    name: "Unlock/Solve Puzzle",
    tempo: 160,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["G", 3, 16],
      ["A", 3, 16],
      ["B", 3, 16],
      ["C", 3, 16],
      ["D", 3, 16],
      ["E", 3, 16],
      ["F", 3, 16],
      ["G", 3, 8, true], // dotted
    ]),
  },
  {
    id: 7,
    name: "Achievement/Discovery",
    tempo: 180,
    shape: 1,
    volume: 10000,
    notes: notes([
      ["C", 3, 8],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 4, true],
    ]),
  },
  {
    id: 8,
    name: "Warning/Alert",
    tempo: 200,
    shape: 3,
    volume: 11000,
    notes: notes([
      ["C", 3, 8],
      ["R", 4, 16], // rest
      ["C", 3, 8],
      ["R", 4, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 9,
    name: "Coin/Score",
    tempo: 220,
    shape: 2,
    volume: 8000,
    notes: notes([
      ["E", 3, 16],
      ["G", 3, 8],
    ]),
  },

  // --- Doors & Objects (10-14) ---
  {
    id: 10,
    name: "Door Open",
    tempo: 120,
    shape: 3,
    volume: 7000,
    notes: notes([
      ["C", 3, 8],
      ["C#", 3, 8],
      ["D", 3, 8],
      ["D#", 3, 4],
    ]),
  },
  {
    id: 11,
    name: "Door Close",
    tempo: 120,
    shape: 3,
    volume: 7000,
    notes: notes([
      ["D#", 3, 8],
      ["D", 3, 8],
      ["C#", 3, 8],
      ["C", 3, 4],
    ]),
  },
  {
    id: 12,
    name: "Door Locked",
    tempo: 150,
    shape: 3,
    volume: 8000,
    notes: notes([
      ["D", 3, 16],
      ["D", 3, 16],
      ["R", 4, 16],
    ]),
  },
  {
    id: 13,
    name: "Chest Open",
    tempo: 140,
    shape: 2,
    volume: 8000,
    notes: notes([
      ["C", 3, 16],
      ["D", 3, 16],
      ["E", 3, 16],
      ["G", 3, 8],
      ["E", 3, 8, true],
    ]),
  },
  {
    id: 14,
    name: "Switch/Lever",
    tempo: 180,
    shape: 3,
    volume: 7000,
    notes: notes([
      ["G", 3, 16],
      ["C", 3, 16],
    ]),
  },

  // --- Movement & Environment (15-19) ---
  {
    id: 15,
    name: "Footsteps (Single)",
    tempo: 120,
    shape: 4,
    volume: 5000,
    notes: notes([
      ["C", 3, 16],
      ["R", 3, 16],
      ["C", 3, 16],
    ]),
  },
  {
    id: 16,
    name: "Footsteps (Walking)",
    tempo: 140,
    shape: 4,
    volume: 5000,
    notes: notes([
      ["C", 3, 16],
      ["R", 3, 16],
      ["C", 3, 16],
      ["R", 3, 16],
      ["C", 3, 16],
      ["R", 3, 16],
      ["C", 3, 16],
      ["R", 3, 16],
    ]),
  },
  {
    id: 17,
    name: "Footsteps (Running)",
    tempo: 200,
    shape: 4,
    volume: 5500,
    notes: notes([
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
      ["C", 3, 32],
    ]),
  },
  {
    id: 18,
    name: "Splash/Water",
    tempo: 130,
    shape: 5,
    volume: 7000,
    notes: notes([
      ["G", 3, 16],
      ["F", 3, 16],
      ["D", 3, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 19,
    name: "Wind/Breeze",
    tempo: 100,
    shape: 5,
    volume: 6000,
    notes: notes([
      ["C", 3, 4],
      ["D", 3, 4],
      ["E", 3, 4],
      ["D", 3, 4],
      ["C", 3, 2],
    ]),
  },

  // --- Combat & Danger (20-24) ---
  {
    id: 20,
    name: "Sword Swing",
    tempo: 200,
    shape: 3,
    volume: 8000,
    notes: notes([
      ["C", 3, 32],
      ["G", 3, 16],
      ["C", 3, 16],
    ]),
  },
  {
    id: 21,
    name: "Hit/Impact",
    tempo: 180,
    shape: 4,
    volume: 10000,
    notes: notes([
      ["C", 3, 16],
      ["C", 3, 16],
    ]),
  },
  {
    id: 22,
    name: "Enemy Appear",
    tempo: 140,
    shape: 3,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["D#", 3, 16],
      ["F#", 3, 16],
      ["A", 3, 8],
    ]),
  },
  {
    id: 23,
    name: "Player Hurt",
    tempo: 160,
    shape: 3,
    volume: 10000,
    notes: notes([
      ["A", 3, 16],
      ["G", 3, 16],
      ["F", 3, 16],
      ["E", 3, 8],
    ]),
  },
  {
    id: 24,
    name: "Enemy Defeated",
    tempo: 150,
    shape: 2,
    volume: 9000,
    notes: notes([
      ["E", 3, 8],
      ["D", 3, 8],
      ["C", 3, 8],
      ["A", 3, 4],
    ]),
  },

  // --- Magic & Special (25-29) ---
  {
    id: 25,
    name: "Magic Spell",
    tempo: 180,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["B", 3, 16],
      ["D", 3, 16],
      ["F", 3, 16],
      ["A", 3, 8],
    ]),
  },
  {
    id: 26,
    name: "Teleport",
    tempo: 200,
    shape: 1,
    volume: 10000,
    notes: notes([
      ["C", 3, 16],
      ["C", 3, 16],
      ["C", 3, 16],
      ["C", 3, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 27,
    name: "Power Up",
    tempo: 160,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["D", 3, 16],
      ["E", 3, 16],
      ["F", 3, 16],
      ["G", 3, 16],
      ["A", 3, 16],
      ["B", 3, 16],
      ["C", 3, 4, true],
    ]),
  },
  {
    id: 28,
    name: "Power Down",
    tempo: 140,
    shape: 3,
    volume: 8000,
    notes: notes([
      ["C", 3, 16],
      ["B", 3, 16],
      ["A", 3, 16],
      ["G", 3, 16],
      ["F", 3, 16],
      ["E", 3, 16],
      ["D", 3, 16],
      ["C", 3, 4],
    ]),
  },
  {
    id: 29,
    name: "Mystery/Question",
    tempo: 150,
    shape: 2,
    volume: 7000,
    notes: notes([
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 8],
      ["B", 3, 4, true],
    ]),
  },

  // ==========================================
  // MUSICAL PIECES (IDs 30-49)
  // ==========================================

  // --- Victory & Success (30-32) ---
  {
    id: 30,
    name: "Victory Fanfare",
    tempo: 160,
    shape: 1,
    volume: 10000,
    notes: notes([
      ["C", 3, 8],
      ["C", 3, 8],
      ["C", 3, 8],
      ["G", 3, 4],
      ["E", 3, 8],
      ["G", 3, 4, true],
      ["C", 3, 2],
    ]),
  },
  {
    id: 31,
    name: "Level Complete",
    tempo: 180,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 8],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 8],
      ["G", 3, 8],
      ["E", 3, 8],
      ["C", 3, 4],
    ]),
  },
  {
    id: 32,
    name: "Quest Complete",
    tempo: 140,
    shape: 1,
    volume: 9500,
    notes: notes([
      ["G", 3, 8],
      ["C", 3, 8],
      ["E", 3, 8],
      ["G", 3, 4],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 2, true],
    ]),
  },

  // --- Defeat & Game Over (33-34) ---
  {
    id: 33,
    name: "Game Over",
    tempo: 100,
    shape: 3,
    volume: 10000,
    notes: notes([
      ["C", 3, 4],
      ["B", 3, 4],
      ["A", 3, 4],
      ["G", 3, 4],
      ["F", 3, 2, true],
    ]),
  },
  {
    id: 34,
    name: "Player Death",
    tempo: 120,
    shape: 3,
    volume: 10000,
    notes: notes([
      ["A", 3, 8],
      ["G", 3, 8],
      ["F", 3, 8],
      ["E", 3, 8],
      ["D", 3, 8],
      ["C", 3, 2],
    ]),
  },

  // --- Ambient & Atmosphere (35-39) ---
  {
    id: 35,
    name: "Mysterious Ambience",
    tempo: 100,
    shape: 2,
    volume: 6000,
    notes: notes([
      ["D", 3, 4],
      ["F", 3, 4],
      ["A", 3, 4],
      ["G", 3, 2, true],
    ]),
  },
  {
    id: 36,
    name: "Danger Theme",
    tempo: 140,
    shape: 3,
    volume: 9000,
    notes: notes([
      ["C", 3, 8],
      ["C", 3, 8],
      ["D#", 3, 8],
      ["D#", 3, 8],
      ["F#", 3, 8],
      ["F#", 3, 8],
      ["A", 3, 4],
    ]),
  },
  {
    id: 37,
    name: "Peaceful Melody",
    tempo: 120,
    shape: 1,
    volume: 7000,
    notes: notes([
      ["C", 3, 4],
      ["E", 3, 4],
      ["G", 3, 4],
      ["E", 3, 4],
      ["D", 3, 4],
      ["F", 3, 4],
      ["E", 3, 2, true],
    ]),
  },
  {
    id: 38,
    name: "Suspense Build",
    tempo: 80,
    shape: 2,
    volume: 7000,
    notes: notes([
      ["C", 3, 4],
      ["D", 3, 4],
      ["E", 3, 4],
      ["F", 3, 4],
      ["G", 3, 4],
      ["A", 3, 4],
      ["B", 3, 2],
    ]),
  },
  {
    id: 39,
    name: "Sad/Melancholy",
    tempo: 90,
    shape: 2,
    volume: 7000,
    notes: notes([
      ["E", 3, 4],
      ["D", 3, 4],
      ["C", 3, 4],
      ["D", 3, 4],
      ["E", 3, 2, true],
    ]),
  },

  // --- Clock & Time (40-41) ---
  {
    id: 40,
    name: "Clock Ticking",
    tempo: 120,
    shape: 4,
    volume: 5000,
    notes: notes([
      ["C", 3, 16],
      ["R", 4, 16],
      ["C", 3, 16],
      ["R", 4, 16],
      ["C", 3, 16],
      ["R", 4, 16],
      ["C", 3, 16],
      ["R", 4, 16],
    ]),
  },
  {
    id: 41,
    name: "Bell Chimes",
    tempo: 100,
    shape: 1,
    volume: 8000,
    notes: notes([
      ["C", 3, 4],
      ["R", 4, 8],
      ["C", 3, 4],
      ["R", 4, 8],
      ["C", 3, 4],
    ]),
  },

  // --- Title & Intro (42-44) ---
  {
    id: 42,
    name: "Title Screen Theme",
    tempo: 140,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 8],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 8],
      ["G", 3, 8],
      ["E", 3, 8],
      ["D", 3, 8],
      ["F", 3, 8],
      ["A", 3, 8],
      ["F", 3, 8],
      ["D", 3, 8],
      ["C", 3, 4],
    ]),
  },
  {
    id: 43,
    name: "Game Start",
    tempo: 160,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["C", 3, 4, true],
    ]),
  },
  {
    id: 44,
    name: "Cutscene Music",
    tempo: 110,
    shape: 1,
    volume: 7500,
    notes: notes([
      ["G", 3, 4],
      ["A", 3, 4],
      ["B", 3, 4],
      ["C", 3, 4],
      ["D", 3, 4],
      ["E", 3, 4],
      ["D", 3, 4],
      ["C", 3, 2],
    ]),
  },

  // --- Special Events (45-49) ---
  {
    id: 45,
    name: "Boss Encounter",
    tempo: 150,
    shape: 3,
    volume: 11000,
    notes: notes([
      ["C", 3, 8],
      ["C", 3, 8],
      ["D#", 3, 8],
      ["C", 3, 8],
      ["F", 3, 8],
      ["D#", 3, 4],
    ]),
  },
  {
    id: 46,
    name: "Treasure Found",
    tempo: 170,
    shape: 1,
    volume: 9500,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["C", 3, 16],
      ["E", 3, 8],
      ["G", 3, 4, true],
    ]),
  },
  {
    id: 47,
    name: "Secret Discovered",
    tempo: 130,
    shape: 1,
    volume: 8500,
    notes: notes([
      ["G", 3, 16],
      ["B", 3, 16],
      ["D", 3, 16],
      ["G", 3, 16],
      ["B", 3, 8],
      ["D", 3, 4, true],
    ]),
  },
  {
    id: 48,
    name: "Transformation/Morph",
    tempo: 180,
    shape: 1,
    volume: 9000,
    notes: notes([
      ["C", 3, 16],
      ["E", 3, 16],
      ["G", 3, 16],
      ["B", 3, 16],
      ["D", 3, 16],
      ["F", 3, 16],
      ["A", 3, 16],
      ["C", 3, 8],
    ]),
  },
  {
    id: 49,
    name: "Final Boss Victory",
    tempo: 140,
    shape: 1,
    volume: 11000,
    notes: notes([
      ["C", 3, 8],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 3, 4],
      ["G", 3, 8],
      ["C", 3, 4],
      ["E", 3, 8],
      ["G", 3, 8],
      ["C", 6, 2, true],
    ]),
  },
];

/**
 * Get music tracks by category
 */
export const MUSIC_CATEGORIES = {
  uiFeedback: MUSIC_LIBRARY.slice(0, 10),
  doorsObjects: MUSIC_LIBRARY.slice(10, 15),
  movement: MUSIC_LIBRARY.slice(15, 20),
  combat: MUSIC_LIBRARY.slice(20, 25),
  magic: MUSIC_LIBRARY.slice(25, 30),
  victory: MUSIC_LIBRARY.slice(30, 33),
  defeat: MUSIC_LIBRARY.slice(33, 35),
  ambient: MUSIC_LIBRARY.slice(35, 40),
  time: MUSIC_LIBRARY.slice(40, 42),
  titleIntro: MUSIC_LIBRARY.slice(42, 45),
  specialEvents: MUSIC_LIBRARY.slice(45, 50),
};

/**
 * Get a music track by ID
 */
export function getMusicById(id: number): Music | undefined {
  return MUSIC_LIBRARY.find(m => m.id === id);
}

/**
 * Get a music track by name
 */
export function getMusicByName(name: string): Music | undefined {
  return MUSIC_LIBRARY.find(m => m.name === name);
}
