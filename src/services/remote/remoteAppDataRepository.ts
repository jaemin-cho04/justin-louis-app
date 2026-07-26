import { seedData } from "../../domain/fixtures/seed";
import type { AppData } from "../../domain/model/types";
import {
  CURRENT_SCHEMA_VERSION,
  createAppDataEnvelope,
  normalizeAppData,
  type AppDataRepository,
  type RepositorySnapshot,
  type SaveReceipt
} from "../storage/appDataRepository";
import { getSupabaseClient } from "./supabaseClient";

type SnapshotRow = {
  revision: number;
  schema_version: number;
  data: unknown;
  updated_at: string;
};

export function createRemoteAppDataRepository(userId: string): AppDataRepository {
  let revision = 0;

  const load = async (): Promise<RepositorySnapshot> => {
      const { data, error } = await getSupabaseClient()
        .from("app_snapshots")
        .select("revision, schema_version, data, updated_at")
        .eq("user_id", userId)
        .maybeSingle<SnapshotRow>();

      if (error) throw remoteError("load", error);
      if (!data) {
        revision = 0;
        return emptySnapshot();
      }

      revision = data.revision;
      return {
        data: normalizeAppData(data.data),
        diagnostics: [],
        revision,
        schemaVersion: data.schema_version,
        updatedAt: data.updated_at
      };
  };

  const save = async (appData: AppData): Promise<SaveReceipt> => {
    const envelope = createAppDataEnvelope(appData, revision + 1);
    let result = await saveAtRevision(envelope.data, envelope.schemaVersion, revision);
    if (result.error?.code === "40001") {
      await load();
      result = await saveAtRevision(envelope.data, envelope.schemaVersion, revision);
    }
    if (result.error) throw remoteError("save", result.error);
    const saved = result.data as { revision: number; updated_at: string } | null;
    if (!saved) throw remoteError("save", { message: "Snapshot save returned no receipt." });
    revision = saved.revision;
    return { revision, savedAt: saved.updated_at };
  };

  return {
    load,
    save,
    subscribe(onSnapshot) {
      const client = getSupabaseClient();
      const channel = client.channel(`snapshot:${userId}`).on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_snapshots", filter: `user_id=eq.${userId}` },
        () => { void load().then(onSnapshot); }
      ).subscribe();
      return () => { void client.removeChannel(channel); };
    },

    async reset() {
      const { error } = await getSupabaseClient().from("app_snapshots").delete().eq("user_id", userId);
      if (error) throw remoteError("reset", error);
      revision = 0;
      return emptySnapshot();
    }
  };
}

async function saveAtRevision(data: AppData, schemaVersion: number, expectedRevision: number) {
  return getSupabaseClient().rpc("save_app_snapshot", {
    expected_revision: expectedRevision,
    next_schema_version: schemaVersion,
    next_data: data
  }).single();
}

function emptySnapshot(): RepositorySnapshot {
  return {
    data: normalizeAppData(seedData),
    diagnostics: [],
    revision: 0,
    schemaVersion: CURRENT_SCHEMA_VERSION
  };
}

function remoteError(operation: string, error: { message: string; code?: string }): Error {
  const result = new Error(`Remote ${operation} failed: ${error.message}`);
  result.name = error.code === "42501" ? "PermissionDeniedError" : error.code === "40001" ? "SyncConflictError" : "RemoteRepositoryError";
  return result;
}

export function isPermissionError(error: unknown): boolean {
  return error instanceof Error && error.name === "PermissionDeniedError";
}
