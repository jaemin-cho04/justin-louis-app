import type { AppData, LogEntry, Project, Trait, WorkItem } from "../model/types";

export type AppDataIndex = {
  projectById: ReadonlyMap<string, Project>;
  workItemById: ReadonlyMap<string, WorkItem>;
  logByItemAndDate: ReadonlyMap<string, LogEntry>;
  logsByItemId: ReadonlyMap<string, LogEntry[]>;
  traitById: ReadonlyMap<string, Trait>;
};

export function buildAppDataIndex(data: AppData): AppDataIndex {
  const logsByItemId = new Map<string, LogEntry[]>();
  const logByItemAndDate = new Map<string, LogEntry>();

  for (const log of data.logs) {
    logByItemAndDate.set(logKey(log.itemId, log.date), log);
    logsByItemId.set(log.itemId, [...(logsByItemId.get(log.itemId) ?? []), log]);
  }

  return {
    projectById: new Map(data.projects.map((project) => [project.id, project])),
    workItemById: new Map(data.workItems.map((item) => [item.id, item])),
    logByItemAndDate,
    logsByItemId,
    traitById: new Map(data.traitOptions.map((trait) => [trait.id, trait]))
  };
}

export function logKey(itemId: string, date: string): string {
  return `${itemId}:${date}`;
}
