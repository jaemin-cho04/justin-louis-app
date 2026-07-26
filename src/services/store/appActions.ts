import { clearLogData } from "../../domain/operations/logs";
import { deleteProjectData, deleteWorkItemData, makeHabitWorkItem } from "../../domain/operations/projects";
import type { AppData, LogStatus, Milestone, Project, Reflection, UserProfile, Visibility } from "../../domain/model/types";
import { projectColors } from "../../shared/theme/colors";

export type DraftProject = {
  title: string;
  description: string;
  goalType?: "habit" | "project";
  cadence?: "Daily" | "Weekly" | "Monthly";
  tracking?: string;
  target?: string;
  duration?: string;
  milestones?: Array<Omit<Milestone, "id">>;
};

type Dependencies = {
  selectedDate: string;
  update: (recipe: (current: AppData) => AppData) => void;
  reset: () => Promise<AppData>;
  replace: (data: AppData) => void;
};

export function createAppActions({ selectedDate, update, reset, replace }: Dependencies) {
  return {
    completeOnboarding(profile: UserProfile) {
      update((current) => ({
        ...current,
        hasOnboarded: true,
        currentUser: { ...current.currentUser, profile }
      }));
    },

    logItem(itemId: string, status: LogStatus, note?: string) {
      update((current) => upsertLog(current, itemId, selectedDate, status, note));
    },

    clearLog(itemId: string) {
      update((current) => clearLogData(current, itemId, selectedDate));
    },

    toggleBreakDay() {
      update((current) => {
        const exists = current.breakDays.some((day) => day.date === selectedDate);
        return exists
          ? {
              ...current,
              breakDays: current.breakDays.filter((day) => day.date !== selectedDate),
              logs: current.logs.filter(
                (entry) => !(entry.date === selectedDate && entry.note === "BreakDay deferred this item.")
              )
            }
          : {
              ...current,
              breakDays: [...current.breakDays, { date: selectedDate, reason: "Guilt-free rest" }]
            };
      });
    },

    addReflection(text: string, traits: string[], links: Pick<Reflection, "itemId" | "projectId"> = {}) {
      const cleanText = text.trim();
      if (!cleanText) return;

      update((current) => ({
        ...current,
        reflections: [{
          id: makeId("reflection"),
          date: selectedDate,
          text: cleanText,
          traits,
          itemId: links.itemId,
          projectId: links.projectId,
          createdAt: new Date().toISOString()
        }, ...current.reflections]
      }));
    },

    deleteReflection(reflectionId: string) {
      update((current) => ({
        ...current,
        reflections: current.reflections.filter((reflection) => reflection.id !== reflectionId)
      }));
    },

    updateReflection(reflectionId: string, text: string) {
      const cleanText = text.trim();
      if (!cleanText) return;
      update((current) => ({
        ...current,
        reflections: current.reflections.map((reflection) =>
          reflection.id === reflectionId ? { ...reflection, text: cleanText } : reflection
        )
      }));
    },

    setProjectVisibility(projectId: string, visibility: Visibility) {
      update((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.id === projectId ? { ...project, visibility } : project
        )
      }));
    },

    moveProject(projectId: string, direction: "up" | "down") {
      update((current) => reorderProject(current, projectId, direction));
    },

    addProject(draft: DraftProject) {
      const title = draft.title.trim();
      if (!title) return;

      update((current) => {
        const projectId = makeId("project");
        const goalWorkItemId = draft.goalType === "habit" ? makeId("habit") : undefined;
        const project: Project = {
          id: projectId,
          ownerId: current.currentUser.id,
          title,
          description: draft.description.trim() || "A new project to shape as you go.",
          color: projectColors[current.projects.length % projectColors.length],
          visibility: "private",
          priority: current.projects.length + 1,
          isShared: false,
          termLabel: current.currentUser.profile.termLabel,
          goalType: draft.goalType ?? "project",
          cadence: draft.cadence,
          tracking: draft.tracking?.trim(),
          target: draft.target?.trim(),
          duration: draft.duration?.trim(),
          milestones: createMilestones(draft.milestones),
          goalWorkItemId
        };

        return {
          ...current,
          projects: [...current.projects, project],
          memberships: [...current.memberships, {
            id: makeId("membership"),
            projectId,
            userId: current.currentUser.id,
            role: "owner",
            joinedAt: new Date().toISOString()
          }],
          workItems: goalWorkItemId
            ? [...current.workItems, makeHabitWorkItem(projectId, goalWorkItemId, title, draft.cadence)]
            : current.workItems
        };
      });
    },

    updateProject(projectId: string, draft: DraftProject) {
      const title = draft.title.trim();
      if (!title) return;

      update((current) => updateProjectData(current, projectId, draft, title));
    },

    deleteProject(projectId: string) {
      update((current) => deleteProjectData(current, projectId));
    },

    toggleFriendFeedback(friendId: string) {
      update((current) => ({
        ...current,
        friends: current.friends.map((friend) => friend.id === friendId ? {
          ...friend,
          feedbackMode: friend.feedbackMode === "critiqueOpen" ? "cheersOnly" : "critiqueOpen"
        } : friend)
      }));
    },

    addFriend(name: string, handle: string) {
      const cleanName = name.trim();
      const cleanHandle = handle.trim().replace(/^@+/, "");
      if (!cleanName || !cleanHandle) return;

      update((current) => ({
        ...current,
        friends: [...current.friends, {
          id: makeId("friend"),
          userId: makeId("user-demo"),
          name: cleanName,
          handle: `@${cleanHandle}`,
          progress: 0,
          feedbackMode: "cheersOnly",
          focus: "No shared focus yet",
          lastSignal: "Added locally"
        }]
      }));
    },

    removeFriend(friendId: string) {
      update((current) => {
        const friend = current.friends.find((item) => item.id === friendId);
        return {
          ...current,
          friends: current.friends.filter((item) => item.id !== friendId),
          friendships: current.friendships.filter(
            (item) => item.recipientId !== friend?.userId && item.requesterId !== friend?.userId
          )
        };
      });
    },

    addComment(targetId: string, comment: string) {
      const cleanComment = comment.trim();
      if (!cleanComment) return;

      update((current) => ({
        ...current,
        reactions: [...current.reactions, {
          id: makeId("comment"),
          authorId: current.currentUser.id,
          targetId,
          targetType: "log",
          type: "cheer",
          comment: cleanComment,
          createdAt: new Date().toISOString()
        }]
      }));
    },

    deleteComment(commentId: string) {
      update((current) => ({
        ...current,
        reactions: current.reactions.filter((reaction) =>
          reaction.id !== commentId || reaction.authorId !== current.currentUser.id
        )
      }));
    },

    updateLogNote(logId: string, note: string) {
      update((current) => ({
        ...current,
        logs: current.logs.map((entry) => entry.id === logId ? { ...entry, note: note.trim() } : entry)
      }));
    },

    updateProfile(profile: Partial<UserProfile>) {
      update((current) => ({
        ...current,
        currentUser: {
          ...current.currentUser,
          profile: { ...current.currentUser.profile, ...profile }
        }
      }));
    },

    setNotificationPreference(
      key: keyof AppData["currentUser"]["notificationPreferences"],
      enabled: boolean
    ) {
      update((current) => ({
        ...current,
        currentUser: {
          ...current.currentUser,
          notificationPreferences: { ...current.currentUser.notificationPreferences, [key]: enabled }
        }
      }));
    },

    async reset() {
      replace(await reset());
    }
  };
}

function updateProjectData(current: AppData, projectId: string, draft: DraftProject, title: string): AppData {
  const existing = current.projects.find((project) => project.id === projectId);
  if (!existing) return current;

  let nextCurrent = current;
  let goalWorkItemId = existing.goalWorkItemId;
  let workItems = current.workItems;

  if (draft.goalType === "habit") {
    goalWorkItemId ??= makeId("habit");
    const nextItem = makeHabitWorkItem(projectId, goalWorkItemId, title, draft.cadence);
    workItems = current.workItems.some((item) => item.id === goalWorkItemId)
      ? current.workItems.map((item) => item.id === goalWorkItemId ? nextItem : item)
      : [...current.workItems, nextItem];
  } else if (goalWorkItemId) {
    nextCurrent = deleteWorkItemData(current, goalWorkItemId);
    workItems = nextCurrent.workItems;
    goalWorkItemId = undefined;
  }

  return {
    ...nextCurrent,
    workItems,
    projects: nextCurrent.projects.map((project) => project.id === projectId ? {
      ...project,
      title,
      description: draft.description.trim() || project.description,
      goalType: draft.goalType ?? "project",
      cadence: draft.cadence,
      tracking: draft.tracking?.trim(),
      target: draft.target?.trim(),
      duration: draft.duration?.trim(),
      goalWorkItemId,
      milestones: createMilestones(draft.milestones, project)
    } : project)
  };
}

function createMilestones(milestones?: DraftProject["milestones"], project?: Project) {
  return milestones?.map((milestone, index) => ({
    ...milestone,
    id: project?.milestones?.[index]?.id ?? makeId(`milestone-${index}`),
    title: milestone.title.trim(),
    timing: milestone.timing.trim()
  }));
}

function upsertLog(current: AppData, itemId: string, date: string, status: LogStatus, note?: string): AppData {
  const existing = current.logs.find((entry) => entry.itemId === itemId && entry.date === date);
  if (!existing) {
    return {
      ...current,
      logs: [...current.logs, {
        id: makeId("log"), itemId, date, status, note,
        timezone: current.currentUser.timezone,
        createdAt: new Date().toISOString()
      }]
    };
  }

  return {
    ...current,
    logs: current.logs.map((entry) => entry.id === existing.id ? {
      ...entry,
      status,
      note: note ?? entry.note,
      timezone: current.currentUser.timezone,
      createdAt: new Date().toISOString()
    } : entry)
  };
}

function reorderProject(current: AppData, projectId: string, direction: "up" | "down"): AppData {
  const projects = [...current.projects].sort((first, second) => first.priority - second.priority);
  const index = projects.findIndex((project) => project.id === projectId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) return current;

  [projects[index], projects[nextIndex]] = [projects[nextIndex], projects[index]];
  return { ...current, projects: projects.map((project, order) => ({ ...project, priority: order + 1 })) };
}

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
