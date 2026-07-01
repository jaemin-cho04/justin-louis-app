export type AppTab = "home" | "log" | "friends" | "goals" | "you";

export type WorkItemKind = "task" | "habit";

export type LogStatus = "done" | "attempted" | "missed" | "skipped" | "deferred";

export type Visibility = "private" | "closeFriends" | "sharedCollaborators";

export type FriendFeedbackMode = "cheersOnly" | "critiqueOpen";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type UserRole = "owner" | "editor" | "viewer";

export type FriendshipStatus = "pending" | "accepted" | "blocked";

export type ReactionType = "cheer" | "credit" | "critique";

export type InsightKind =
  | "bestWeekday"
  | "consistentProject"
  | "skippedPattern"
  | "traitGrowth"
  | "weeklyMostlyHit";

export type UserProfile = {
  name: string;
  handle: string;
  termLabel: string;
  termEndDate?: string;
  photoUri?: string;
};

export type NotificationPreferences = {
  weeklyPlanning: boolean;
  encouragement: boolean;
  memories: boolean;
  ownTaskReminders: boolean;
};

export type User = {
  id: string;
  profile: UserProfile;
  timezone: string;
  language: string;
  notificationPreferences: NotificationPreferences;
};

export type Project = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  color: string;
  visibility: Visibility;
  priority: number;
  isShared: boolean;
  termLabel?: string;
  archivedAt?: string;
};

export type Membership = {
  id: string;
  projectId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
};

export type WorkItem = {
  id: string;
  projectId: string;
  kind: WorkItemKind;
  title: string;
  effort: 1 | 2 | 3;
  dueDate?: string;
  weekdays?: Weekday[];
  isArchived?: boolean;
};

export type LogEntry = {
  id: string;
  itemId: string;
  date: string;
  status: LogStatus;
  note?: string;
  satisfaction?: number;
  durationMinutes?: number;
  timezone?: string;
  mediaIds?: string[];
  createdAt: string;
};

export type Reflection = {
  id: string;
  date: string;
  text: string;
  traits: string[];
  itemId?: string;
  projectId?: string;
  mediaIds?: string[];
  createdAt: string;
};

export type Trait = {
  id: string;
  name: string;
  category: "default" | "canmeds" | "custom";
  isCanMeds: boolean;
};

export type Friend = {
  id: string;
  userId: string;
  name: string;
  handle: string;
  progress: number;
  feedbackMode: FriendFeedbackMode;
  focus: string;
  lastSignal: string;
};

export type Friendship = {
  id: string;
  requesterId: string;
  recipientId: string;
  status: FriendshipStatus;
  feedbackMode: FriendFeedbackMode;
  createdAt: string;
};

export type Reaction = {
  id: string;
  authorId: string;
  targetId: string;
  targetType: "log" | "reflection" | "project";
  type: ReactionType;
  comment?: string;
  createdAt: string;
};

export type Invite = {
  id: string;
  code: string;
  senderId: string;
  expiresAt: string;
  acceptedAt?: string;
};

export type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
  generatedAt: string;
  isPrivate: true;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  earnedAt?: string;
  shareable: boolean;
};

export type BreakDay = {
  date: string;
  reason?: string;
};

export type AppData = {
  hasOnboarded: boolean;
  currentUser: User;
  projects: Project[];
  memberships: Membership[];
  workItems: WorkItem[];
  logs: LogEntry[];
  reflections: Reflection[];
  friends: Friend[];
  friendships: Friendship[];
  reactions: Reaction[];
  invites: Invite[];
  insights: Insight[];
  achievements: Achievement[];
  breakDays: BreakDay[];
  traitOptions: Trait[];
};
