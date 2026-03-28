import { DaadGame } from "../types/daad";
import * as database from "./database";
import { normalizeGameState } from "./gameNormalizer";

export interface Backup {
  id: number;
  projectName: string;
  gameData: string;
  createdAt: string;
  description: string;
  isAutoBackup: boolean;
}

async function getDb() {
  return database.getDatabase();
}

export async function createBackup(
  projectName: string,
  game: DaadGame,
  description: string = "",
  isAutoBackup: boolean = false
): Promise<number> {
  const database = await getDb();
  const gameData = JSON.stringify(game);

  const result = await database.execute(
    `INSERT INTO backups (project_name, game_data, description, is_auto_backup)
     VALUES ($1, $2, $3, $4)`,
    [projectName, gameData, description, isAutoBackup ? 1 : 0]
  );

  return result.lastInsertId;
}

export async function listBackups(projectName?: string): Promise<Backup[]> {
  const database = await getDb();

  const query = projectName
    ? `SELECT * FROM backups WHERE project_name = $1 ORDER BY created_at DESC`
    : `SELECT * FROM backups ORDER BY created_at DESC`;

  const results = projectName
    ? await database.select<Backup[]>(query, [projectName])
    : await database.select<Backup[]>(query);

  return results.map((row: any) => ({
    id: row.id,
    projectName: row.project_name,
    gameData: row.game_data,
    createdAt: row.created_at,
    description: row.description || "",
    isAutoBackup: row.is_auto_backup === 1,
  }));
}

export async function restoreBackup(backupId: number): Promise<DaadGame | null> {
  const database = await getDb();

  const results = await database.select<Array<{ game_data: string }>>(
    `SELECT game_data FROM backups WHERE id = $1`,
    [backupId]
  );

  if (results.length === 0) {
    return null;
  }

  const gameData = results[0].game_data;
  try {
    const rawGame = JSON.parse(gameData);
    return normalizeGameState(rawGame);
  } catch (error) {
    console.error("[Backup] Failed to parse backup data:", error);
    throw new Error("Backup data is corrupted and cannot be restored");
  }
}

export async function deleteBackup(backupId: number): Promise<void> {
  const database = await getDb();
  await database.execute(`DELETE FROM backups WHERE id = $1`, [backupId]);
}

export async function deleteOldAutoBackups(
  projectName: string,
  keepCount: number = 10
): Promise<void> {
  const database = await getDb();

  // Keep only the most recent keepCount auto-backups
  await database.execute(
    `DELETE FROM backups
     WHERE project_name = $1
       AND is_auto_backup = 1
       AND id NOT IN (
         SELECT id FROM backups
         WHERE project_name = $1
           AND is_auto_backup = 1
         ORDER BY created_at DESC
         LIMIT $2
       )`,
    [projectName, keepCount]
  );
}

export async function getBackupCount(projectName: string): Promise<number> {
  const database = await getDb();

  const results = await database.select<Array<{ count: number }>>(
    `SELECT COUNT(*) as count FROM backups WHERE project_name = $1`,
    [projectName]
  );

  return results[0].count;
}
