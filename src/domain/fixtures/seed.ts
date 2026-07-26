import { brandConfig } from "../../config/brand";
import { projectColors } from "../../shared/theme/colors";
import { todayKey, toDateKey } from "../../shared/utils/dates";
import type { AppData, Trait, User, UserProfile } from "../model/types";

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);

const defaultUserId = "user-local";
const partnerOneId = "user-demo-study";
const partnerTwoId = "user-demo-research";

export const emptyProfile: UserProfile = {
  name: "",
  handle: "",
  termLabel: "Summer term",
  termEndDate: toDateKey(new Date(now.getFullYear(), 7, 31))
};

export const defaultNotificationPreferences = {
  weeklyPlanning: true,
  encouragement: true,
  memories: true,
  ownTaskReminders: false
};

export const localUser: User = {
  id: defaultUserId,
  profile: emptyProfile,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Vancouver",
  language: "en",
  notificationPreferences: defaultNotificationPreferences
};

export const defaultTraits: Trait[] = [
  { id: "teamwork", name: "Teamwork", category: "canmeds", isCanMeds: true },
  { id: "communication", name: "Communication", category: "canmeds", isCanMeds: true },
  { id: "leadership", name: "Leadership", category: "default", isCanMeds: false },
  { id: "resilience", name: "Resilience", category: "default", isCanMeds: false },
  { id: "failure", name: "Failure", category: "default", isCanMeds: false },
  { id: "growth", name: "Growth", category: "default", isCanMeds: false },
  { id: "advocacy", name: "Advocacy", category: "canmeds", isCanMeds: true },
  { id: "scholarship", name: "Scholarship", category: "canmeds", isCanMeds: true }
];

export const seedData: AppData = {
  hasOnboarded: false,
  currentUser: localUser,
  traitOptions: defaultTraits,
  projects: [
    {
      id: "project-mcat",
      ownerId: defaultUserId,
      title: "MCAT prep",
      description: "Daily study rhythm without turning the app into a drill sergeant.",
      color: projectColors[0],
      visibility: "private",
      priority: 1,
      isShared: false,
      termLabel: emptyProfile.termLabel
    },
    {
      id: "project-research",
      ownerId: defaultUserId,
      title: "Research",
      description: "Finite deliverables, notes, and steady progress toward publication.",
      color: projectColors[1],
      visibility: "closeFriends",
      priority: 2,
      isShared: true,
      termLabel: emptyProfile.termLabel
    },
    {
      id: "project-fitness",
      ownerId: defaultUserId,
      title: "Training",
      description: "Keep movement visible without making rest feel like failure.",
      color: projectColors[2],
      visibility: "closeFriends",
      priority: 3,
      isShared: false,
      termLabel: emptyProfile.termLabel
    }
  ],
  memberships: [
    {
      id: "membership-local-mcat",
      projectId: "project-mcat",
      userId: defaultUserId,
      role: "owner",
      joinedAt: now.toISOString()
    },
    {
      id: "membership-local-research",
      projectId: "project-research",
      userId: defaultUserId,
      role: "owner",
      joinedAt: now.toISOString()
    },
    {
      id: "membership-partner-research",
      projectId: "project-research",
      userId: partnerOneId,
      role: "viewer",
      joinedAt: now.toISOString()
    },
    {
      id: "membership-local-training",
      projectId: "project-fitness",
      userId: defaultUserId,
      role: "owner",
      joinedAt: now.toISOString()
    }
  ],
  workItems: [
    {
      id: "habit-cars",
      projectId: "project-mcat",
      kind: "habit",
      title: "CARS passage set",
      effort: 2,
      weekdays: [1, 2, 3, 4, 5]
    },
    {
      id: "habit-anki",
      projectId: "project-mcat",
      kind: "habit",
      title: "Review missed cards",
      effort: 1,
      weekdays: [0, 1, 2, 3, 4, 5, 6]
    },
    {
      id: "task-ethics",
      projectId: "project-research",
      kind: "task",
      title: "Draft ethics revision",
      effort: 3,
      dueDate: todayKey()
    },
    {
      id: "task-lit-review",
      projectId: "project-research",
      kind: "task",
      title: "Tag five papers",
      effort: 2,
      dueDate: toDateKey(tomorrow)
    },
    {
      id: "habit-run",
      projectId: "project-fitness",
      kind: "habit",
      title: "Easy run or mobility",
      effort: 2,
      weekdays: [1, 3, 5]
    }
  ],
  logs: [
    {
      id: "log-1",
      itemId: "habit-cars",
      date: todayKey(),
      status: "done",
      note: "Focused session, less overthinking.",
      satisfaction: 4,
      timezone: localUser.timezone,
      createdAt: now.toISOString()
    },
    {
      id: "log-2",
      itemId: "habit-anki",
      date: todayKey(),
      status: "attempted",
      note: "Started late but still reviewed the hardest cards.",
      satisfaction: 3,
      timezone: localUser.timezone,
      createdAt: now.toISOString()
    }
  ],
  reflections: [
    {
      id: "reflection-1",
      date: todayKey(),
      text: "Caught myself rushing through feedback. Better communication means slowing down before responding.",
      traits: ["communication", "growth"],
      createdAt: now.toISOString()
    }
  ],
  friends: [
    {
      id: "friend-study",
      userId: partnerOneId,
      name: "Louis",
      handle: "@louis",
      progress: 0.71,
      feedbackMode: "critiqueOpen",
      focus: "Runs",
      lastSignal: "Finished an easy 5K"
    },
    {
      id: "friend-research",
      userId: partnerTwoId,
      name: "Michelle",
      handle: "@michelle",
      progress: 0.88,
      feedbackMode: "cheersOnly",
      focus: "Study",
      lastSignal: "Completed today's focus block"
    },
    {
      id: "friend-justin",
      userId: "user-demo-justin",
      name: "Justin",
      handle: "@justin",
      progress: 0.63,
      feedbackMode: "cheersOnly",
      focus: "Portfolio",
      lastSignal: "Shipped a project update"
    },
    {
      id: "friend-raymond",
      userId: "user-demo-raymond",
      name: "Raymond",
      handle: "@ray",
      progress: 0.54,
      feedbackMode: "critiqueOpen",
      focus: "Training",
      lastSignal: "Logged today's work"
    },
    {
      id: "friend-jay",
      userId: "user-demo-jay",
      name: "Jay",
      handle: "@jay",
      progress: 0.39,
      feedbackMode: "cheersOnly",
      focus: "Applications",
      lastSignal: "Started a new milestone"
    }
  ],
  friendships: [
    {
      id: "friendship-study",
      requesterId: defaultUserId,
      recipientId: partnerOneId,
      status: "accepted",
      feedbackMode: "critiqueOpen",
      createdAt: now.toISOString()
    },
    {
      id: "friendship-research",
      requesterId: defaultUserId,
      recipientId: partnerTwoId,
      status: "accepted",
      feedbackMode: "cheersOnly",
      createdAt: now.toISOString()
    }
  ],
  reactions: [],
  invites: [],
  insights: [
    {
      id: "insight-private-start",
      kind: "traitGrowth",
      title: "Reflection library started",
      body: "Trait tags will become easier to retrieve as you keep logging.",
      generatedAt: now.toISOString(),
      isPrivate: true
    }
  ],
  achievements: [],
  breakDays: []
};

export const reactionCopy = {
  cheer: "Cheer sent",
  credit: "Credit sent",
  critique: "Critique saved for a friend who asked for it"
};

export const productTagline = brandConfig.appTagline;
