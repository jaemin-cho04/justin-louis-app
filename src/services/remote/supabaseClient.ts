import "react-native-url-polyfill/auto";
import "expo-sqlite/localStorage/install";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireRemoteBackendConfig } from "../../config/runtime";

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const config = requireRemoteBackendConfig();
  client = createClient(config.url, config.publishableKey, {
    auth: {
      storage: globalThis.localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    },
    realtime: { params: { eventsPerSecond: 5 } }
  });

  return client;
}
