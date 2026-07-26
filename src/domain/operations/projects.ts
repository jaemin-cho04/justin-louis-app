import type { AppData, Project, WorkItem } from "../model/types";

export function makeHabitWorkItem(
  projectId: string,
  itemId: string,
  title: string,
  cadence: Project["cadence"] = "Daily"
): WorkItem {
  return {
    id: itemId,
    projectId,
    kind: "habit",
    title,
    effort: 1,
    weekdays: cadence === "Daily" ? [0, 1, 2, 3, 4, 5, 6] : [1],
    recurrenceCadence: cadence,
    monthlyDay: cadence === "Monthly" ? 1 : undefined
  };
}

export function deleteProjectData(current: AppData, projectId: string): AppData {
  const itemIds = current.workItems
    .filter((item) => item.projectId === projectId)
    .map((item) => item.id);
  const logIds = current.logs
    .filter((entry) => itemIds.includes(entry.itemId))
    .map((entry) => entry.id);

  return {
    ...current,
    projects: current.projects.filter((project) => project.id !== projectId),
    memberships: current.memberships.filter((membership) => membership.projectId !== projectId),
    workItems: current.workItems.filter((item) => item.projectId !== projectId),
    logs: current.logs.filter((entry) => !itemIds.includes(entry.itemId)),
    reflections: current.reflections.filter(
      (reflection) => reflection.projectId !== projectId && !itemIds.includes(reflection.itemId ?? "")
    ),
    reactions: current.reactions.filter(
      (reaction) => reaction.targetId !== projectId && !logIds.includes(reaction.targetId)
    )
  };
}

export function deleteWorkItemData(current: AppData, itemId: string): AppData {
  const logIds = current.logs
    .filter((entry) => entry.itemId === itemId)
    .map((entry) => entry.id);

  return {
    ...current,
    workItems: current.workItems.filter((item) => item.id !== itemId),
    logs: current.logs.filter((entry) => entry.itemId !== itemId),
    reflections: current.reflections.filter((reflection) => reflection.itemId !== itemId),
    reactions: current.reactions.filter((reaction) => !logIds.includes(reaction.targetId))
  };
}
