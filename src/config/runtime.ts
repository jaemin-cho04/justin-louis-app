export const runtimeConfig = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "",
  supabasePublishableKey: process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "",
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() ?? "",
  easProjectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim() ?? "",
  environment: process.env.EXPO_PUBLIC_APP_ENV?.trim() || (process.env.NODE_ENV === "production" ? "production" : "development")
} as const;

export const remoteBackendConfigured = Boolean(
  runtimeConfig.supabaseUrl && runtimeConfig.supabasePublishableKey
);

export function requireRemoteBackendConfig() {
  if (!remoteBackendConfigured) {
    throw new Error(
      "Remote backend is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  return {
    url: runtimeConfig.supabaseUrl,
    publishableKey: runtimeConfig.supabasePublishableKey
  };
}
