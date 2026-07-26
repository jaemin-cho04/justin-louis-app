import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

import { brandConfig } from "../../config/brand";
import { seedData } from "../../domain/fixtures/seed";
import type { AppData } from "../../domain/model/types";
import {
  CURRENT_SCHEMA_VERSION,
  createAppDataEnvelope,
  decodeStoredAppDataWithReport,
  normalizeAppData,
  storedSavedAt,
  storedRevision
} from "./appDataSchema";
import type { DataDiagnostic } from "./appDataSchema";

export { CURRENT_SCHEMA_VERSION, createAppDataEnvelope, decodeStoredAppData, decodeStoredAppDataWithReport, normalizeAppData } from "./appDataSchema";
export type { AppDataEnvelope, DataDiagnostic, DataNormalizationResult } from "./appDataSchema";

type StoredRow = { value: string };

export interface AppDataRepository {
  load(): Promise<RepositorySnapshot>;
  save(data: AppData): Promise<SaveReceipt>;
  reset(): Promise<RepositorySnapshot>;
  synchronize?(data: AppData): Promise<SaveReceipt>;
  subscribe?(onSnapshot: (snapshot: RepositorySnapshot) => void): () => void;
}

export type RepositorySnapshot = {
  data: AppData;
  diagnostics: DataDiagnostic[];
  revision: number;
  schemaVersion: number;
  updatedAt?: string;
};

export type SaveReceipt = {
  revision: number;
  savedAt: string;
  diagnostics?: DataDiagnostic[];
};

let nativeDb: SQLite.SQLiteDatabase | null = null;

function getNativeDb(): SQLite.SQLiteDatabase {
  nativeDb ??= SQLite.openDatabaseSync("app_state.db");
  return nativeDb;
}

export function createSqliteAppDataRepository(identity = "local"): AppDataRepository {
  const stateKey = `${brandConfig.storageNamespace}:${identity}`;
  let currentRevision = 0;
  let saveQueue: Promise<void> = Promise.resolve();

  return {
  async load() {
    const storedValue = Platform.OS === "web" ? readWebValue(stateKey) : await readNativeValue(stateKey);
    if (!storedValue) return makeSnapshot(normalizeAppData(seedData));

    try {
      const parsed: unknown = JSON.parse(storedValue);
      currentRevision = storedRevision(parsed);
      const result = decodeStoredAppDataWithReport(parsed);
      reportDiagnostics(result.diagnostics);
      return makeSnapshot(result.data, result.diagnostics, currentRevision, storedSavedAt(parsed));
    } catch (error: unknown) {
      currentRevision = 0;
      const diagnostics: DataDiagnostic[] = [{
        code: "storage_parse_failed",
        severity: "error",
        message: error instanceof Error ? `Saved data could not be parsed: ${error.message}` : "Saved data could not be parsed."
      }];
      reportDiagnostics(diagnostics);
      return makeSnapshot(normalizeAppData(seedData), diagnostics);
    }
  },

  async save(data) {
    const revision = currentRevision + 1;
    currentRevision = revision;
    const envelope = createAppDataEnvelope(data, revision);

    saveQueue = saveQueue.catch(() => undefined).then(async () => {
      const value = JSON.stringify(envelope);
      if (Platform.OS === "web") {
        globalThis.localStorage?.setItem(stateKey, value);
        return;
      }

      const db = getNativeDb();
      await ensureSchema();
      await db.runAsync(
        "INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)",
        stateKey,
        value,
        envelope.savedAt
      );
    });

    await saveQueue;
    return { revision, savedAt: envelope.savedAt };
  },

  async reset() {
    await saveQueue.catch(() => undefined);
    currentRevision = 0;

    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(stateKey);
      return makeSnapshot(normalizeAppData(seedData));
    }

    const db = getNativeDb();
    await ensureSchema();
    await db.runAsync("DELETE FROM app_state WHERE key = ?", stateKey);
    return makeSnapshot(normalizeAppData(seedData));
  }
  };
}

export const sqliteAppDataRepository = createSqliteAppDataRepository();

async function readNativeValue(stateKey: string): Promise<string | null> {
  const db = getNativeDb();
  await ensureSchema();
  const row = await db.getFirstAsync<StoredRow>("SELECT value FROM app_state WHERE key = ?", stateKey);
  return row?.value ?? null;
}

function readWebValue(stateKey: string): string | null {
  return globalThis.localStorage?.getItem(stateKey) ?? null;
}

async function ensureSchema(): Promise<void> {
  await getNativeDb().execAsync(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function makeSnapshot(
  data: AppData,
  diagnostics: DataDiagnostic[] = [],
  revision = 0,
  updatedAt?: string
): RepositorySnapshot {
  return { data, diagnostics, revision, schemaVersion: CURRENT_SCHEMA_VERSION, updatedAt };
}

function reportDiagnostics(diagnostics: DataDiagnostic[]): void {
  if (!__DEV__ || diagnostics.length === 0) return;
  for (const diagnostic of diagnostics) {
    const details = { code: diagnostic.code, collection: diagnostic.collection };
    if (diagnostic.severity === "error") console.error(`[data] ${diagnostic.message}`, details);
    else if (diagnostic.severity === "warning") console.warn(`[data] ${diagnostic.message}`, details);
    else console.info(`[data] ${diagnostic.message}`, details);
  }
}
