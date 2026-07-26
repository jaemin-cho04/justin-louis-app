import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

import { runtimeConfig } from "../../config/runtime";
import { getSupabaseClient } from "../remote/supabaseClient";
import type { NotificationPreferences } from "../../domain/model/types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export async function registerPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice || Platform.OS === "web") return null;
  const existing = await Notifications.getPermissionsAsync();
  const permission = existing.granted ? existing : await Notifications.requestPermissionsAsync();
  if (!permission.granted) return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("progress", {
      name: "Progress reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 150, 200]
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync(
    runtimeConfig.easProjectId ? { projectId: runtimeConfig.easProjectId } : undefined
  )).data;
  const { error } = await getSupabaseClient().from("push_tokens").upsert({
    user_id: userId,
    expo_push_token: token,
    platform: Platform.OS,
    enabled: true,
    updated_at: new Date().toISOString()
  }, { onConflict: "expo_push_token" });
  if (error) throw new Error(error.message);
  return token;
}

export async function disablePushNotifications(userId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("push_tokens").update({ enabled: false }).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function scheduleTaskReminder(title: string, date: Date): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title: "Progress reminder", body: title, data: { screen: "home" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date }
  });
}

export async function synchronizeNotificationPreferences(
  userId: string,
  preferences: NotificationPreferences,
  hasOpenTasks: boolean
): Promise<void> {
  const { error } = await getSupabaseClient().from("notification_preferences").upsert({
    user_id: userId,
    weekly_planning: preferences.weeklyPlanning,
    encouragement: preferences.encouragement,
    memories: preferences.memories,
    own_task_reminders: preferences.ownTaskReminders,
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);

  if (Platform.OS === "web") return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(scheduled
    .filter((entry) => entry.content.data?.managedBy === "progress")
    .map((entry) => Notifications.cancelScheduledNotificationAsync(entry.identifier)));

  const reminders: Promise<string>[] = [];
  if (preferences.weeklyPlanning) reminders.push(Notifications.scheduleNotificationAsync({
    content: { title: "Plan your week", body: "Choose the progress that matters this week.", data: { screen: "goals", managedBy: "progress" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 2, hour: 18, minute: 0 }
  }));
  if (preferences.memories) reminders.push(Notifications.scheduleNotificationAsync({
    content: { title: "Look back with perspective", body: "Review a past reflection and notice what changed.", data: { screen: "archives", managedBy: "progress" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: 1, hour: 17, minute: 0 }
  }));
  if (preferences.ownTaskReminders && hasOpenTasks) reminders.push(Notifications.scheduleNotificationAsync({
    content: { title: "Your progress is waiting", body: "You still have open work scheduled in Progress.", data: { screen: "home", managedBy: "progress" } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: 18, minute: 0 }
  }));
  await Promise.all(reminders);
}

export function listenForPushTokenChanges(userId: string): () => void {
  if (Platform.OS === "web") return () => undefined;
  const subscription = Notifications.addPushTokenListener((token) => {
    if (token.type !== "expo") return;
    void getSupabaseClient().from("push_tokens").upsert({
      user_id: userId,
      expo_push_token: token.data,
      platform: Platform.OS,
      enabled: true,
      updated_at: new Date().toISOString()
    }, { onConflict: "expo_push_token" });
  });
  return () => subscription.remove();
}

export function listenForNotificationNavigation(onScreen: (screen: string) => void): () => void {
  void Notifications.getLastNotificationResponseAsync().then((response) => {
    const screen = response?.notification.request.content.data?.screen;
    if (typeof screen === "string") onScreen(screen);
  });
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const screen = response.notification.request.content.data?.screen;
    if (typeof screen === "string") onScreen(screen);
  });
  return () => subscription.remove();
}
