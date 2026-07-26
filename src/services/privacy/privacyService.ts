import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import type { AppData } from "../../domain/model/types";
import { getSupabaseClient } from "../remote/supabaseClient";

export async function exportUserData(data: AppData, includeRemote = false): Promise<string> {
  const directory = FileSystem.cacheDirectory;
  if (!directory) throw new Error("Temporary file storage is not available.");
  const uri = `${directory}progress-export-${new Date().toISOString().slice(0, 10)}.json`;
  let remoteData: unknown;
  if (includeRemote) {
    const { data: result, error } = await getSupabaseClient().functions.invoke("export-account", { method: "POST" });
    if (error) throw new Error(error.message);
    remoteData = result;
  }
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), schemaVersion: 2, localData: data, remoteData }, null, 2);
  await FileSystem.writeAsStringAsync(uri, payload, { encoding: FileSystem.EncodingType.UTF8 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Export Progress data", UTI: "public.json" });
  }
  return uri;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await getSupabaseClient().functions.invoke("delete-account", { method: "POST" });
  if (error) throw new Error(error.message);
  await getSupabaseClient().auth.signOut({ scope: "local" });
}
