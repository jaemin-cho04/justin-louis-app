import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

import { brandConfig } from "../../config/brand";
import { defaultTraits, localUser, seedData } from "../../domain/fixtures/seed";
import type { AppData, Trait, Visibility } from "../../domain/model/types";

type StoredRow = {
  value: string;
};

export interface AppDataRepository {
  load(): Promise<AppData>;
  save(data: AppData): Promise<void>;
  reset(): Promise<AppData>;
}

const stateKey = brandConfig.storageNamespace;
const db = Platform.OS === "web" ? null : SQLite.openDatabaseSync("app_state.db");

export const sqliteAppDataRepository: AppDataRepository = {
  async load() {
    if (Platform.OS === "web") {
      return loadWebData();
    }

    await ensureSchema();
    const row = await db?.getFirstAsync<StoredRow>(
      "SELECT value FROM app_state WHERE key = ?",
      stateKey
    );

    if (!row?.value) {
      return seedData;
    }

    try {
      return normalizeAppData(JSON.parse(row.value));
    } catch {
      return seedData;
    }
  },
  async save(data) {
    if (Platform.OS === "web") {
      saveWebData(data);
      return;
    }

    await ensureSchema();
    await db?.runAsync(
      "INSERT OR REPLACE INTO app_state (key, value, updated_at) VALUES (?, ?, ?)",
      stateKey,
      JSON.stringify(data),
      new Date().toISOString()
    );
  },
  async reset() {
    if (Platform.OS === "web") {
      globalThis.localStorage?.removeItem(stateKey);
      return seedData;
    }

    await ensureSchema();
    await db?.runAsync("DELETE FROM app_state WHERE key = ?", stateKey);
    return seedData;
  }
};

export function loadAppData(): Promise<AppData> {
  return sqliteAppDataRepository.load();
}

export function saveAppData(data: AppData): Promise<void> {
  return sqliteAppDataRepository.save(data);
}

export function resetAppData(): Promise<AppData> {
  return sqliteAppDataRepository.reset();
}

async function ensureSchema(): Promise<void> {
  await db?.execAsync(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
}

function loadWebData(): AppData {
  const raw = globalThis.localStorage?.getItem(stateKey);

  if (!raw) {
    return seedData;
  }

  try {
    return normalizeAppData(JSON.parse(raw));
  } catch {
    return seedData;
  }
}

function saveWebData(data: AppData): void {
  globalThis.localStorage?.setItem(stateKey, JSON.stringify(data));
}

function normalizeAppData(raw: Partial<AppData> & { profile?: AppData["currentUser"]["profile"] }): AppData {
  const currentUser = raw.currentUser ?? {
    ...localUser,
    profile: raw.profile ?? seedData.currentUser.profile
  };

  const projects = (raw.projects ?? seedData.projects).map((project) => ({
    ...project,
    ownerId: project.ownerId ?? currentUser.id,
    visibility: normalizeVisibility(project.visibility),
    termLabel: project.termLabel ?? currentUser.profile.termLabel
  }));

  return {
    ...seedData,
    ...raw,
    currentUser,
    projects,
    memberships: raw.memberships ?? seedData.memberships,
    logs: (raw.logs ?? seedData.logs).map((entry) => ({
      ...entry,
      timezone: entry.timezone ?? currentUser.timezone
    })),
    friendships: raw.friendships ?? seedData.friendships,
    reactions: raw.reactions ?? [],
    invites: raw.invites ?? [],
    insights: raw.insights ?? seedData.insights,
    achievements: raw.achievements ?? [],
    traitOptions: normalizeTraits(raw.traitOptions),
    breakDays: raw.breakDays ?? []
  };
}

function normalizeVisibility(visibility: Visibility | "friends" | "shared" | undefined): Visibility {
  if (visibility === "friends") {
    return "closeFriends";
  }

  if (visibility === "shared") {
    return "sharedCollaborators";
  }

  return visibility ?? "private";
}

function normalizeTraits(traits: unknown): Trait[] {
  if (!Array.isArray(traits)) {
    return defaultTraits;
  }

  if (traits.every((trait) => typeof trait === "string")) {
    return defaultTraits;
  }

  return traits as Trait[];
}
