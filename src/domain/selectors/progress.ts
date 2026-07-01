import { weekdayFor, weekKeys } from "../../shared/utils/dates";
import type { AppData, LogEntry, LogStatus, WorkItem } from "../model/types";

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

  return Boolean(item.weekdays?.includes(weekdayFor(date)));
}

export function scheduledItems(data: AppData, date: string): WorkItem[] {
  return data.workItems
    .filter((item) => isScheduledFor(item, date))
    .sort((first, second) => {
      const firstProject = data.projects.find((project) => project.id === first.projectId);
      const secondProject = data.projects.find((project) => project.id === second.projectId);
      return (firstProject?.priority ?? 99) - (secondProject?.priority ?? 99);
    });
}

export function logForItem(data: AppData, itemId: string, date: string): LogEntry | undefined {
  return data.logs.find((entry) => entry.itemId === itemId && entry.date === date);
}

export function summarizeDay(data: AppData, date: string): ProgressSummary {
  const items = scheduledItems(data, date);
  const segments: ProgressSegment[] = items.map((item) => {
    const log = logForItem(data, item.id, date);
    return { status: log?.status ?? "open", weight: item.effort };
  });

  return summarizeSegments(segments);
}

export function summarizeWeek(data: AppData): ProgressSummary {
  const segments: ProgressSegment[] = weekKeys().flatMap((date) =>
    scheduledItems(data, date).map((item) => {
      const log = logForItem(data, item.id, date);
      return { status: log?.status ?? "open", weight: item.effort };
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
