/**
 * Database service for DAAD Builder.
 * Provides persistent storage for projects, auto-saves, and backups using SQLite.
 *
 * @module services/database
 */

import Database from "@tauri-apps/plugin-sql";
import { DaadGame } from "../types/daad";
import { normalizeGameState } from "./gameNormalizer";

/** Singleton database connection */
let db: Database | null = null;

/**
 * Initializes the SQLite database connection and creates required tables.
 * Safe to call multiple times - will only initialize once.
 *
 * Tables created:
 * - projects: Named saves with timestamps
 * - autosave: Single-row emergency recovery
 * - backups: Manual and automatic backups
 *
 * @throws Error if database initialization fails
 */
export async function initDatabase(): Promise<void> {
  if (db) return; // Already initialized

  try {
    // Use relative path in app data - platform independent
    // Tauri SQLite plugin will store this in the app's data directory
    db = await Database.load("sqlite:daad_projects.db");

    // Create projects table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create auto-save table (for emergency recovery)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS autosave (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create backups table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_name TEXT NOT NULL,
        game_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        description TEXT,
        is_auto_backup INTEGER DEFAULT 0
      )
    `);

    console.log("[Database] Initialized SQLite database");
  } catch (error) {
    console.error("[Database] Failed to initialize database:", error);
    throw new Error(`Database initialization failed: ${error}`);
  }
}

/**
 * Gets the database connection, initializing if needed.
 * @returns Promise resolving to the database connection
 */
export async function getDatabase(): Promise<Database> {
  if (!db) await initDatabase();
  return db!;
}

/**
 * Saves a project to the database.
 * Updates existing project if name matches, otherwise creates new.
 *
 * @param name - Project name (used as identifier)
 * @param game - Game data to save
 * @returns Promise resolving to the project ID
 */
export async function saveProject(name: string, game: DaadGame): Promise<number> {
  try {
    if (!db) await initDatabase();

    const data = JSON.stringify(game);

    // Check if project with this name exists
    const existing = await db!.select<Array<{ id: number }>>(
      "SELECT id FROM projects WHERE name = $1",
      [name]
    );

    if (existing.length > 0) {
      // Update existing project
      await db!.execute(
        "UPDATE projects SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [data, existing[0].id]
      );
      console.log(`[Database] Updated project: ${name} (ID: ${existing[0].id})`);
      return existing[0].id;
    } else {
      // Insert new project
      const result = await db!.execute(
        "INSERT INTO projects (name, data) VALUES ($1, $2)",
        [name, data]
      );
      console.log(`[Database] Created new project: ${name} (ID: ${result.lastInsertId})`);
      return result.lastInsertId;
    }
  } catch (error) {
    console.error("[Database] Failed to save project:", error);
    throw new Error(`Failed to save project: ${error}`);
  }
}

export async function loadProject(id: number): Promise<DaadGame | null> {
  try {
    if (!db) await initDatabase();

    const result = await db!.select<Array<{ data: string }>>(
      "SELECT data FROM projects WHERE id = $1",
      [id]
    );

    if (result.length === 0) return null;

    try {
      const rawGame = JSON.parse(result[0].data);
      return normalizeGameState(rawGame);
    } catch (parseError) {
      console.error("[Database] Failed to parse project data:", parseError);
      throw new Error(`Project data is corrupted and cannot be loaded`);
    }
  } catch (error) {
    console.error("[Database] Failed to load project:", error);
    throw new Error(`Failed to load project: ${error}`);
  }
}

export async function loadProjectByName(name: string): Promise<DaadGame | null> {
  try {
    if (!db) await initDatabase();

    const result = await db!.select<Array<{ data: string }>>(
      "SELECT data FROM projects WHERE name = $1",
      [name]
    );

    if (result.length === 0) return null;

    try {
      const rawGame = JSON.parse(result[0].data);
      return normalizeGameState(rawGame);
    } catch (parseError) {
      console.error("[Database] Failed to parse project data:", parseError);
      throw new Error(`Project data is corrupted and cannot be loaded`);
    }
  } catch (error) {
    console.error("[Database] Failed to load project by name:", error);
    throw new Error(`Failed to load project by name: ${error}`);
  }
}

export async function listProjects(): Promise<Array<{ id: number; name: string; updated_at: string }>> {
  try {
    if (!db) await initDatabase();

    return await db!.select(
      "SELECT id, name, updated_at FROM projects ORDER BY updated_at DESC"
    );
  } catch (error) {
    console.error("[Database] Failed to list projects:", error);
    throw new Error(`Failed to list projects: ${error}`);
  }
}

export async function deleteProject(id: number): Promise<void> {
  try {
    if (!db) await initDatabase();

    await db!.execute("DELETE FROM projects WHERE id = $1", [id]);
    console.log(`[Database] Deleted project ID: ${id}`);
  } catch (error) {
    console.error("[Database] Failed to delete project:", error);
    throw new Error(`Failed to delete project: ${error}`);
  }
}

export async function autoSave(game: DaadGame): Promise<void> {
  try {
    if (!db) await initDatabase();

    // Validate game state before saving
    if (!game || typeof game !== 'object') {
      console.warn("[Database] Invalid game state, skipping auto-save");
      return;
    }

    const data = JSON.stringify(game);

    // Ensure data is not empty
    if (!data || data === 'null' || data === '{}') {
      console.warn("[Database] Empty game state, skipping auto-save");
      return;
    }

    // Upsert into autosave table (only one row with id=1)
    await db!.execute(
      `INSERT INTO autosave (id, data, updated_at)
       VALUES (1, $1, CURRENT_TIMESTAMP)
       ON CONFLICT(id) DO UPDATE SET
         data = excluded.data,
         updated_at = excluded.updated_at`,
      [data]
    );
  } catch (error) {
    console.error("[Database] Failed to auto-save:", error);
    throw new Error(`Failed to auto-save: ${error}`);
  }
}

export async function loadAutoSave(): Promise<DaadGame | null> {
  try {
    if (!db) await initDatabase();

    const result = await db!.select<Array<{ data: string; updated_at: string }>>(
      "SELECT data, updated_at FROM autosave WHERE id = 1"
    );

    if (result.length === 0) return null;

    console.log(`[Database] Found auto-save from: ${result[0].updated_at}`);
    try {
      const rawGame = JSON.parse(result[0].data);
      return normalizeGameState(rawGame);
    } catch (parseError) {
      console.error("[Database] Failed to parse auto-save data:", parseError);
      throw new Error(`Auto-save data is corrupted and cannot be loaded`);
    }
  } catch (error) {
    console.error("[Database] Failed to load auto-save:", error);
    throw new Error(`Failed to load auto-save: ${error}`);
  }
}

export async function closeDatabase(): Promise<void> {
  try {
    if (db) {
      await db.close();
      db = null;
      console.log("[Database] Connection closed");
    }
  } catch (error) {
    console.error("[Database] Failed to close connection:", error);
  }
}
