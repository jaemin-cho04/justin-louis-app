import * as Sentry from "@sentry/react-native";

import { runtimeConfig } from "../../config/runtime";

let initialized = false;

export function initializeMonitoring(): void {
  if (initialized) return;
  initialized = true;
  if (!runtimeConfig.sentryDsn) return;
  Sentry.init({
    dsn: runtimeConfig.sentryDsn,
    environment: runtimeConfig.environment,
    enableAutoSessionTracking: true,
    sendDefaultPii: false,
    tracesSampleRate: runtimeConfig.environment === "production" ? 0.1 : 1
  });
}

export function reportError(error: unknown, context?: Record<string, unknown>): string {
  const incidentId = `incident-${Date.now().toString(36)}`;
  if (runtimeConfig.sentryDsn) {
    Sentry.withScope((scope) => {
      scope.setTag("incident_id", incidentId);
      if (context) scope.setContext("app", context);
      Sentry.captureException(error);
    });
  } else {
    console.error("[monitoring]", { incidentId, error, context });
  }
  return incidentId;
}

export function addMonitoringBreadcrumb(message: string, data?: Record<string, unknown>): void {
  if (runtimeConfig.sentryDsn) Sentry.addBreadcrumb({ category: "app", message, data, level: "info" });
}

export function setMonitoringUser(userId?: string): void {
  if (!runtimeConfig.sentryDsn) return;
  Sentry.setUser(userId ? { id: userId } : null);
}
