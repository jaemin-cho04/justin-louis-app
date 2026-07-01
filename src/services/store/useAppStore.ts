import { useCallback, useEffect, useMemo, useState } from "react";

import { loadAppData, resetAppData, saveAppData } from "../storage/appDataRepository";
import { scheduledItems } from "../../domain/selectors/progress";
import { todayKey } from "../../shared/utils/dates";
import { projectColors } from "../../shared/theme/colors";
import type { AppData, LogStatus, Project, UserProfile, Visibility } from "../../domain/model/types";

type DraftProject = {
  title: string;
  description: string;
};

const makeId = (prefix: string) => `${prefix}-${Date.now()}`;

export function useAppStore() {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadAppData()
      .then(setData)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if (data) {
      void saveAppData(data);
    }
  }, [data]);

  const update = useCallback((recipe: (current: AppData) => AppData) => {
    setData((current) => (current ? recipe(current) : current));
  }, []);

  const actions = useMemo(
    () => ({
      completeOnboarding(profile: UserProfile) {
        update((current) => ({
          ...current,
          hasOnboarded: true,
          currentUser: {
            ...current.currentUser,
            profile
          }
        }));
      },
      logItem(itemId: string, status: LogStatus, note?: string) {
        update((current) => upsertLog(current, itemId, selectedDate, status, note));
      },
      toggleBreakDay() {
        update((current) => {
          const exists = current.breakDays.some((day) => day.date === selectedDate);

          if (exists) {
            return {
              ...current,
              breakDays: current.breakDays.filter((day) => day.date !== selectedDate),
              logs: current.logs.filter(
                (entry) => !(entry.date === selectedDate && entry.status === "deferred")
              )
            };
          }

          const now = new Date().toISOString();
          const deferredLogs = scheduledItems(current, selectedDate).map((item) => ({
            id: makeId(`deferred-${item.id}`),
            itemId: item.id,
            date: selectedDate,
            status: "deferred" as const,
            note: "BreakDay deferred this item.",
            timezone: current.currentUser.timezone,
            createdAt: now
          }));

          return {
            ...current,
            breakDays: [...current.breakDays, { date: selectedDate, reason: "Guilt-free rest" }],
            logs: [
              ...current.logs.filter(
                (entry) => !deferredLogs.some((log) => log.itemId === entry.itemId && log.date === entry.date)
              ),
              ...deferredLogs
            ]
          };
        });
      },
      addReflection(text: string, traits: string[]) {
        const cleanText = text.trim();

        if (!cleanText) {
          return;
        }

        update((current) => ({
          ...current,
          reflections: [
            {
              id: makeId("reflection"),
              date: selectedDate,
              text: cleanText,
              traits,
              createdAt: new Date().toISOString()
            },
            ...current.reflections
          ]
        }));
      },
      deleteReflection(reflectionId: string) {
        update((current) => ({
          ...current,
          reflections: current.reflections.filter((reflection) => reflection.id !== reflectionId)
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

        if (!title) {
          return;
        }

        update((current) => {
          const project: Project = {
            id: makeId("project"),
            ownerId: current.currentUser.id,
            title,
            description: draft.description.trim() || "A new project to shape as you go.",
            color: projectColors[current.projects.length % projectColors.length],
            visibility: "private",
            priority: current.projects.length + 1,
            isShared: false,
            termLabel: current.currentUser.profile.termLabel
          };

          return {
            ...current,
            projects: [...current.projects, project],
            memberships: [
              ...current.memberships,
              {
                id: makeId("membership"),
                projectId: project.id,
                userId: current.currentUser.id,
                role: "owner",
                joinedAt: new Date().toISOString()
              }
            ]
          };
        });
      },
      toggleFriendFeedback(friendId: string) {
        update((current) => ({
          ...current,
          friends: current.friends.map((friend) =>
            friend.id === friendId
              ? {
                  ...friend,
                  feedbackMode: friend.feedbackMode === "critiqueOpen" ? "cheersOnly" : "critiqueOpen"
                }
              : friend
          )
        }));
      },
      addDemoFriend() {
        update((current) => ({
          ...current,
          friends: [
            ...current.friends,
            {
              id: makeId("friend"),
              userId: makeId("user-demo"),
              name: "New close friend",
              handle: `@close${current.friends.length + 1}`,
              progress: 0.32,
              feedbackMode: "cheersOnly",
              focus: "First week",
              lastSignal: "Ready for quiet accountability"
            }
          ]
        }));
      },
      async reset() {
        const fresh = await resetAppData();
        setData(fresh);
      }
    }),
    [selectedDate, update]
  );

  return {
    data,
    actions,
    selectedDate,
    setSelectedDate,
    isReady
  };
}

function upsertLog(
  current: AppData,
  itemId: string,
  date: string,
  status: LogStatus,
  note?: string
): AppData {
  const existing = current.logs.find((entry) => entry.itemId === itemId && entry.date === date);

  if (existing) {
    return {
      ...current,
      logs: current.logs.map((entry) =>
        entry.id === existing.id
          ? {
              ...entry,
              status,
              note: note ?? entry.note,
              timezone: current.currentUser.timezone,
              createdAt: new Date().toISOString()
            }
          : entry
      )
    };
  }

  return {
    ...current,
    logs: [
      ...current.logs,
      {
        id: makeId("log"),
        itemId,
        date,
        status,
        note,
        timezone: current.currentUser.timezone,
        createdAt: new Date().toISOString()
      }
    ]
  };
}

function reorderProject(current: AppData, projectId: string, direction: "up" | "down"): AppData {
  const projects = [...current.projects].sort((first, second) => first.priority - second.priority);
  const index = projects.findIndex((project) => project.id === projectId);
  const nextIndex = direction === "up" ? index - 1 : index + 1;

  if (index < 0 || nextIndex < 0 || nextIndex >= projects.length) {
    return current;
  }

  const moving = projects[index];
  projects[index] = projects[nextIndex];
  projects[nextIndex] = moving;

  return {
    ...current,
    projects: projects.map((project, order) => ({ ...project, priority: order + 1 }))
  };
}
