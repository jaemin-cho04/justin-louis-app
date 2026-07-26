import { parseDateKey, weekdayFor, weekKeys } from "../../shared/utils/dates";
import type { AppData, LogEntry, LogStatus, WorkItem } from "../model/types";
import { buildAppDataIndex, logKey, type AppDataIndex } from "./appDataIndex";

export type ProgressSegment = {
  status: LogStatus | "open";
  weight: number;
};

export type ProgressSummary = {
  totalWeight: number;
  doneWeight: number;
  attemptedWeight: number;
  missedWeight: number;
  skippedWeight: number;
  deferredWeight: number;
  openWeight: number;
  completion: number;
  segments: ProgressSegment[];
};

export function isBreakDay(data: AppData, date: string): boolean {
  return data.breakDays.some((day) => day.date === date);
}

export function isScheduledFor(item: WorkItem, date: string): boolean {
  if (item.isArchived) {
    return false;
  }

  if (item.kind === "task") {
    return item.dueDate === date;
  }

  if (item.recurrenceCadence === "Monthly") {
    return parseDateKey(date).getDate() === (item.monthlyDay ?? 1);
  }

  return Boolean(item.weekdays?.includes(weekdayFor(date)));
}

export function scheduledItems(data: AppData, date: string): WorkItem[] {
  const index = buildAppDataIndex(data);
  return scheduledItemsWithIndex(data, date, index);
}

function scheduledItemsWithIndex(data: AppData, date: string, index: AppDataIndex): WorkItem[] {
  return data.workItems
    .filter((item) => isScheduledFor(item, date))
    .sort((first, second) => {
      const firstProject = index.projectById.get(first.projectId);
      const secondProject = index.projectById.get(second.projectId);
      return (firstProject?.priority ?? 99) - (secondProject?.priority ?? 99);
    });
}

export function logForItem(data: AppData, itemId: string, date: string): LogEntry | undefined {
  return buildAppDataIndex(data).logByItemAndDate.get(logKey(itemId, date));
}

export function logsForItem(data: AppData, itemId: string): LogEntry[] {
  return [...(buildAppDataIndex(data).logsByItemId.get(itemId) ?? [])]
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function summarizeDay(data: AppData, date: string): ProgressSummary {
  const index = buildAppDataIndex(data);
  const items = scheduledItemsWithIndex(data, date, index);
  const segments: ProgressSegment[] = items.map((item) => {
    const log = index.logByItemAndDate.get(logKey(item.id, date));
    return { status: log?.status ?? (isBreakDay(data, date) ? "deferred" : "open"), weight: item.effort };
  });

  return summarizeSegments(segments);
}

export function summarizeWeek(data: AppData): ProgressSummary {
  const index = buildAppDataIndex(data);
  const segments: ProgressSegment[] = weekKeys().flatMap((date) =>
    scheduledItemsWithIndex(data, date, index).map((item) => {
      const log = index.logByItemAndDate.get(logKey(item.id, date));
      return { status: log?.status ?? (isBreakDay(data, date) ? "deferred" : "open"), weight: item.effort };
    })
  );

  return summarizeSegments(segments);
}

export function summarizeTerm(data: AppData): ProgressSummary {
  const taskSegments: ProgressSegment[] = data.workItems
    .filter((item) => item.kind === "task")
    .map((item) => {
      const log = data.logs.find((entry) => entry.itemId === item.id && entry.status === "done");
      return { status: log?.status ?? "open", weight: item.effort };
    });

  return summarizeSegments(taskSegments);
}

function summarizeSegments(segments: ProgressSegment[]): ProgressSummary {
  const counted = segments.filter(
    (segment) => segment.status !== "skipped" && segment.status !== "deferred"
  );
  const totalWeight = counted.reduce((sum, segment) => sum + segment.weight, 0);

  const statusWeight = (status: ProgressSegment["status"]) =>
    segments
      .filter((segment) => segment.status === status)
      .reduce((sum, segment) => sum + segment.weight, 0);

  const doneWeight = statusWeight("done");
  const attemptedWeight = statusWeight("attempted");
  const missedWeight = statusWeight("missed");
  const skippedWeight = statusWeight("skipped");
  const deferredWeight = statusWeight("deferred");
  const openWeight = statusWeight("open");

  return {
    totalWeight,
    doneWeight,
    attemptedWeight,
    missedWeight,
    skippedWeight,
    deferredWeight,
    openWeight,
    completion: totalWeight === 0 ? 0 : doneWeight / totalWeight,
    segments
  };
}
