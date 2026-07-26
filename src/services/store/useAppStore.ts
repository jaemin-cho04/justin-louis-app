import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

import { seedData } from "../../domain/fixtures/seed";
import type { AppData } from "../../domain/model/types";
import { todayKey } from "../../shared/utils/dates";
import { sqliteAppDataRepository, type AppDataRepository, type DataDiagnostic } from "../storage/appDataRepository";
import { createAppActions } from "./appActions";

export type PersistenceState = {
  status: "loading" | "saving" | "saved" | "error";
  lastSavedAt?: string;
  message?: string;
  revision?: number;
  diagnostics: DataDiagnostic[];
};

export function useAppStore(repository: AppDataRepository = sqliteAppDataRepository) {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [isReady, setIsReady] = useState(false);
  const [persistence, setPersistence] = useState<PersistenceState>({ status: "loading", diagnostics: [] });
  const saveRequest = useRef(0);
  const dataRef = useRef<AppData | null>(null);
  const latestRemoteRevision = useRef(0);
  const skipNextSave = useRef(false);
  dataRef.current = data;

  useEffect(() => {
    repository.load()
      .then((snapshot) => {
        setData(snapshot.data);
        latestRemoteRevision.current = snapshot.diagnostics.some((item) => item.code === "remote_unavailable") ? 0 : snapshot.revision;
        setPersistence({ status: "saved", revision: snapshot.revision, diagnostics: snapshot.diagnostics });
      })
      .catch((error: unknown) => {
        if (__DEV__) console.error("Failed to load saved app data; using defaults.", error);
        setData(seedData);
        setPersistence({
          status: "error",
          message: errorMessage(error, "Unable to load saved app data."),
          diagnostics: [{ code: "storage_parse_failed", severity: "error", message: "The data repository failed to load." }]
        });
      })
      .finally(() => setIsReady(true));
  }, [repository]);

  useEffect(() => {
    if (!data) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const request = ++saveRequest.current;
    setPersistence((current) => ({ ...current, status: "saving", message: undefined }));
    void repository.save(data)
      .then((receipt) => {
        if (request === saveRequest.current) {
          if (!receipt.diagnostics?.some((item) => item.code === "sync_pending")) {
            latestRemoteRevision.current = Math.max(latestRemoteRevision.current, receipt.revision);
          }
          setPersistence((current) => ({
            status: "saved",
            lastSavedAt: receipt.savedAt,
            revision: receipt.revision,
            diagnostics: receipt.diagnostics?.length
              ? [...nonSyncDiagnostics(current.diagnostics), ...receipt.diagnostics]
              : nonSyncDiagnostics(current.diagnostics)
          }));
        }
      })
      .catch((error: unknown) => {
        if (request === saveRequest.current) {
          setPersistence((current) => ({
            ...current,
            status: "error",
            message: errorMessage(error, "Unable to save app data.")
          }));
        }
      });
  }, [data, repository]);

  useEffect(() => repository.subscribe?.((snapshot) => {
    if (snapshot.revision <= latestRemoteRevision.current) return;
    latestRemoteRevision.current = snapshot.revision;
    skipNextSave.current = true;
    setData(snapshot.data);
    setPersistence({ status: "saved", lastSavedAt: snapshot.updatedAt, revision: snapshot.revision, diagnostics: snapshot.diagnostics });
  }), [repository]);

  useEffect(() => {
    if (!repository.synchronize) return;
    const subscription = AppState.addEventListener("change", (state) => {
      if (state !== "active" || !dataRef.current) return;
      void repository.synchronize?.(dataRef.current).then((receipt) => {
        setPersistence((current) => ({
          ...current,
          status: "saved",
          lastSavedAt: receipt.savedAt,
          revision: receipt.revision,
          diagnostics: nonSyncDiagnostics(current.diagnostics)
        }));
      }).catch((error: unknown) => {
        setPersistence((current) => ({ ...current, diagnostics: [
          ...nonSyncDiagnostics(current.diagnostics),
          { code: "sync_pending", severity: "warning", message: errorMessage(error, "Background synchronization will retry.") }
        ] }));
      });
    });
    return () => subscription.remove();
  }, [repository]);

  const update = useCallback((recipe: (current: AppData) => AppData) => {
    setData((current) => current ? recipe(current) : current);
  }, []);
  const replace = useCallback((nextData: AppData) => setData(nextData), []);

  const actions = useMemo(() => createAppActions({
    selectedDate,
    update,
    replace,
    reset: async () => (await repository.reset()).data
  }), [replace, repository, selectedDate, update]);

  return { data, actions, selectedDate, setSelectedDate, isReady, persistence };
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function nonSyncDiagnostics(diagnostics: DataDiagnostic[]): DataDiagnostic[] {
  return diagnostics.filter((item) => !["remote_unavailable", "sync_pending", "permission_denied"].includes(item.code));
}
