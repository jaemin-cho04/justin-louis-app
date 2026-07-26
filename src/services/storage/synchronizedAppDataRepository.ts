import type { AppDataRepository, RepositorySnapshot, SaveReceipt } from "./appDataRepository";
import type { DataDiagnostic } from "./appDataSchema";
import { isPermissionError } from "../remote/remoteAppDataRepository";
import { bindDataToUser } from "../../domain/operations/userIdentity";

export function createSynchronizedAppDataRepository(
  local: AppDataRepository,
  remote: AppDataRepository,
  userId: string
): AppDataRepository {
  return {
    async load() {
      const localSnapshot = await local.load();

      try {
        const remoteSnapshot = await remote.load();
        const selected = newerSnapshot(localSnapshot, remoteSnapshot);
        return {
          ...selected,
          data: bindDataToUser(selected.data, userId),
          diagnostics: [...localSnapshot.diagnostics, ...remoteSnapshot.diagnostics]
        };
      } catch (error: unknown) {
        return withDiagnostic(localSnapshot, remoteDiagnostic(error, "Remote data is unavailable; local changes remain safe and will retry."));
      }
    },

    async save(data) {
      const boundData = bindDataToUser(data, userId);
      const localReceipt = await local.save(boundData);

      try {
        const remoteReceipt = await remote.save(boundData);
        return newerReceipt(localReceipt, remoteReceipt);
      } catch (error: unknown) {
        return {
          ...localReceipt,
          diagnostics: [remoteDiagnostic(error, "Saved locally. Remote synchronization is pending and will retry.", "sync_pending")]
        };
      }
    },

    async reset() {
      const localSnapshot = await local.reset();
      const boundSnapshot = { ...localSnapshot, data: bindDataToUser(localSnapshot.data, userId) };
      try {
        await remote.reset();
        return boundSnapshot;
      } catch (error: unknown) {
        return withDiagnostic(boundSnapshot, remoteDiagnostic(error, "Local data was reset, but remote account data could not be cleared."));
      }
    },

    async synchronize(data) {
      return remote.save(bindDataToUser(data, userId));
    },

    subscribe: remote.subscribe ? (onSnapshot) => remote.subscribe!((snapshot) => {
      const boundSnapshot = { ...snapshot, data: bindDataToUser(snapshot.data, userId) };
      void local.save(boundSnapshot.data)
        .then(() => onSnapshot(boundSnapshot))
        .catch(() => onSnapshot(withDiagnostic(boundSnapshot, {
          code: "storage_parse_failed",
          severity: "error",
          message: "A remote update arrived but could not be cached locally."
        })));
    }) : undefined
  };
}

function newerSnapshot(first: RepositorySnapshot, second: RepositorySnapshot): RepositorySnapshot {
  const firstTime = Date.parse(first.updatedAt ?? "") || first.revision;
  const secondTime = Date.parse(second.updatedAt ?? "") || second.revision;
  return secondTime > firstTime ? second : first;
}

function newerReceipt(first: SaveReceipt, second: SaveReceipt): SaveReceipt {
  return Date.parse(second.savedAt) >= Date.parse(first.savedAt) ? second : first;
}

function withDiagnostic(snapshot: RepositorySnapshot, diagnostic: DataDiagnostic): RepositorySnapshot {
  return { ...snapshot, diagnostics: [...snapshot.diagnostics, diagnostic] };
}

function remoteDiagnostic(
  error: unknown,
  fallback: string,
  code: DataDiagnostic["code"] = "remote_unavailable"
): DataDiagnostic {
  return {
    code: isPermissionError(error) ? "permission_denied" : code,
    severity: isPermissionError(error) ? "error" : "warning",
    message: error instanceof Error ? `${fallback} ${error.message}` : fallback
  };
}
