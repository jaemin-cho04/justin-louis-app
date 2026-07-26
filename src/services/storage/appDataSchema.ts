import { defaultTraits, localUser, seedData } from "../../domain/fixtures/seed";
import type {
  AppData,
  BreakDay,
  Friend,
  LogEntry,
  Project,
  Reflection,
  Trait,
  Visibility,
  WorkItem
} from "../../domain/model/types";

type LegacyData = Partial<AppData> & { profile?: AppData["currentUser"]["profile"] };

export type AppDataEnvelope = {
  schemaVersion: number;
  revision: number;
  savedAt: string;
  data: AppData;
};

export type DataDiagnostic = {
  code:
    | "legacy_migrated"
    | "future_schema"
    | "invalid_root"
    | "records_repaired"
    | "storage_parse_failed"
    | "remote_unavailable"
    | "sync_pending"
    | "permission_denied";
  severity: "info" | "warning" | "error";
  message: string;
  collection?: keyof AppData;
};

export type DataNormalizationResult = {
  data: AppData;
  diagnostics: DataDiagnostic[];
};

export const CURRENT_SCHEMA_VERSION = 2;

export function createAppDataEnvelope(data: AppData, revision = 1): AppDataEnvelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    revision,
    savedAt: new Date().toISOString(),
    data: normalizeAppData(data)
  };
}

export function decodeStoredAppData(raw: unknown): AppData {
  return decodeStoredAppDataWithReport(raw).data;
}

export function decodeStoredAppDataWithReport(raw: unknown): DataNormalizationResult {
  const diagnostics: DataDiagnostic[] = [];

  if (isRecord(raw) && "data" in raw && isRecord(raw.data)) {
    if (typeof raw.schemaVersion === "number" && raw.schemaVersion > CURRENT_SCHEMA_VERSION) {
      diagnostics.push({
        code: "future_schema",
        severity: "warning",
        message: `Saved data uses schema ${raw.schemaVersion}; this app supports schema ${CURRENT_SCHEMA_VERSION}. Compatible fields were loaded.`
      });
    }

    const result = normalizeAppDataWithReport(raw.data);
    return { data: result.data, diagnostics: [...diagnostics, ...result.diagnostics] };
  }

  diagnostics.push({
    code: "legacy_migrated",
    severity: "info",
    message: "Legacy local data was migrated to the current versioned format."
  });
  const result = normalizeAppDataWithReport(raw);
  return { data: result.data, diagnostics: [...diagnostics, ...result.diagnostics] };
}

export function storedRevision(raw: unknown): number {
  return isRecord(raw) && typeof raw.revision === "number" ? raw.revision : 0;
}

export function storedSavedAt(raw: unknown): string | undefined {
  return isRecord(raw) && typeof raw.savedAt === "string" ? raw.savedAt : undefined;
}

export function normalizeAppData(rawValue: unknown): AppData {
  const raw = (isRecord(rawValue) ? rawValue : {}) as LegacyData;
  const rawUser = isRecord(raw.currentUser) ? raw.currentUser : undefined;
  const rawProfile = isRecord(rawUser?.profile) ? rawUser.profile : raw.profile;
  const currentUser = {
    ...localUser,
    ...rawUser,
    profile: {
      ...seedData.currentUser.profile,
      ...(isRecord(rawProfile) ? rawProfile : {})
    },
    notificationPreferences: {
      ...seedData.currentUser.notificationPreferences,
      ...(isRecord(rawUser?.notificationPreferences) ? rawUser.notificationPreferences : {})
    }
  } as AppData["currentUser"];

  const projects = uniqueById(entityArrayOr<Project>(raw.projects, seedData.projects))
    .filter((project) => typeof project.id === "string" && typeof project.title === "string")
    .map((project, index) => ({
      ...project,
      ownerId: project.ownerId ?? currentUser.id,
      visibility: normalizeVisibility(project.visibility),
      priority: Number.isFinite(project.priority) ? project.priority : index + 1,
      termLabel: project.termLabel ?? currentUser.profile.termLabel
    }));
  const projectIds = new Set(projects.map((project) => project.id));

  const workItems = uniqueById(entityArrayOr<WorkItem>(raw.workItems, seedData.workItems))
    .filter((item) => projectIds.has(item.projectId) && (item.kind === "habit" || item.kind === "task"));
  const itemIds = new Set(workItems.map((item) => item.id));

  const logs = uniqueByKey(entityArrayOr<LogEntry>(raw.logs, seedData.logs), (entry) => `${entry.itemId}:${entry.date}`)
    .filter((entry) => itemIds.has(entry.itemId) && isLogStatus(entry.status))
    .map((entry) => ({ ...entry, timezone: entry.timezone ?? currentUser.timezone }));

  const reflections = uniqueById(entityArrayOr<Reflection>(raw.reflections, seedData.reflections))
    .filter((reflection) => typeof reflection.text === "string")
    .map((reflection) => ({
      ...reflection,
      itemId: reflection.itemId && itemIds.has(reflection.itemId) ? reflection.itemId : undefined,
      projectId: reflection.projectId && projectIds.has(reflection.projectId) ? reflection.projectId : undefined,
      traits: Array.isArray(reflection.traits) ? reflection.traits : []
    }));

  const friends = uniqueByKey(
    uniqueById(entityArrayOr<Friend>(raw.friends, seedData.friends))
      .filter((friend) => typeof friend.handle === "string" && typeof friend.userId === "string"),
    (friend) => friend.handle.toLowerCase()
  );
  const friendUserIds = new Set(friends.map((friend) => friend.userId));

  return {
    ...seedData,
    ...raw,
    hasOnboarded: raw.hasOnboarded ?? seedData.hasOnboarded,
    currentUser,
    projects,
    memberships: uniqueById(entityArrayOr(raw.memberships, seedData.memberships))
      .filter((membership) => projectIds.has(membership.projectId)),
    workItems,
    logs,
    reflections,
    friends,
    friendships: uniqueById(entityArrayOr(raw.friendships, seedData.friendships))
      .filter((friendship) => friendUserIds.has(friendship.requesterId) || friendUserIds.has(friendship.recipientId)),
    reactions: uniqueById(entityArrayOr(raw.reactions, seedData.reactions)),
    invites: uniqueById(entityArrayOr(raw.invites, seedData.invites)),
    insights: uniqueById(entityArrayOr(raw.insights, seedData.insights)),
    achievements: uniqueById(entityArrayOr(raw.achievements, seedData.achievements)),
    breakDays: uniqueByKey(entityArrayOr<BreakDay>(raw.breakDays, []).filter((day) => typeof day.date === "string"), (day) => day.date),
    traitOptions: normalizeTraits(raw.traitOptions),
    customFields: isRecord(raw.customFields) ? raw.customFields : undefined
  };
}

export function normalizeAppDataWithReport(rawValue: unknown): DataNormalizationResult {
  const data = normalizeAppData(rawValue);
  const diagnostics: DataDiagnostic[] = [];

  if (!isRecord(rawValue)) {
    diagnostics.push({
      code: "invalid_root",
      severity: "error",
      message: "Saved data was not a readable object. Safe defaults were loaded."
    });
    return { data, diagnostics };
  }

  const collections: Array<keyof Pick<AppData,
    "projects" | "memberships" | "workItems" | "logs" | "reflections" | "friends" |
    "friendships" | "reactions" | "invites" | "insights" | "achievements" | "breakDays" | "traitOptions"
  >> = [
    "projects", "memberships", "workItems", "logs", "reflections", "friends", "friendships",
    "reactions", "invites", "insights", "achievements", "breakDays", "traitOptions"
  ];

  for (const collection of collections) {
    const source = rawValue[collection];
    if (Array.isArray(source) && source.length !== data[collection].length) {
      diagnostics.push({
        code: "records_repaired",
        severity: "warning",
        collection,
        message: `${collection}: ${Math.abs(source.length - data[collection].length)} invalid, duplicate, or disconnected record${Math.abs(source.length - data[collection].length) === 1 ? " was" : "s were"} repaired or removed.`
      });
    }
  }

  return { data, diagnostics };
}

function normalizeVisibility(visibility: Visibility | "friends" | "shared" | undefined): Visibility {
  if (visibility === "friends") return "closeFriends";
  if (visibility === "shared") return "sharedCollaborators";
  return visibility ?? "private";
}

function normalizeTraits(traits: unknown): Trait[] {
  if (!Array.isArray(traits) || traits.every((trait) => typeof trait === "string")) {
    return defaultTraits;
  }

  return uniqueById(traits.filter(isRecord) as Trait[])
    .filter((trait) => typeof trait.id === "string" && typeof trait.name === "string");
}

function entityArrayOr<T>(value: unknown, fallback: T[]): T[] {
  const source = Array.isArray(value) ? value : fallback;
  return source.filter(isRecord) as T[];
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  return uniqueByKey(items, (item) => item.id);
}

function uniqueByKey<T>(items: T[], keyFor: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyFor(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isLogStatus(status: unknown): status is LogEntry["status"] {
  return ["done", "attempted", "missed", "skipped", "deferred"].includes(String(status));
}
