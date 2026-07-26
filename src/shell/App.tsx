import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ArchivesScreen } from "../features/archives/screens/ArchivesScreen";
import { FriendsScreen } from "../features/social/screens/FriendsScreen";
import { GoalsScreen } from "../features/projects/screens/GoalsScreen";
import { HomeScreen } from "../features/home/screens/HomeScreen";
import { LogScreen } from "../features/logging/screens/LogScreen";
import { OnboardingScreen } from "../features/onboarding/screens/OnboardingScreen";
import { ReflectionSheet } from "../features/reflections/components/ReflectionSheet";
import { YouScreen } from "../features/profile/screens/YouScreen";
import { BottomTabs } from "../shared/components/BottomTabs";
import { colors } from "../shared/theme/colors";
import { useAppStore } from "../services/store/useAppStore";
import { useAuth } from "../services/auth/AuthProvider";
import { createSqliteAppDataRepository, sqliteAppDataRepository } from "../services/storage/appDataRepository";
import { createSynchronizedAppDataRepository } from "../services/storage/synchronizedAppDataRepository";
import { createRemoteAppDataRepository } from "../services/remote/remoteAppDataRepository";
import { useSocialGraph } from "../services/social/useSocialGraph";
import { publishSocialSummary, synchronizeProfile } from "../services/social/socialRepository";
import { disablePushNotifications, listenForNotificationNavigation, listenForPushTokenChanges, registerPushNotifications, synchronizeNotificationPreferences } from "../services/notifications/notificationService";
import { createPrivateImageUrl, deletePrivateImage, uploadPrivateImage } from "../services/media/mediaService";
import { deleteAccount, exportUserData } from "../services/privacy/privacyService";
import { reportError, setMonitoringUser } from "../services/monitoring/monitoring";
import type { AppTab, Reflection } from "../domain/model/types";
import { summarizeWeek } from "../domain/selectors/progress";

export default function App() {
  const auth = useAuth();
  const localRepository = useMemo(() => auth.user ? createSqliteAppDataRepository(`account:${auth.user.id}`) : sqliteAppDataRepository, [auth.user?.id]);
  const repository = useMemo(() => auth.user
    ? createSynchronizedAppDataRepository(localRepository, createRemoteAppDataRepository(auth.user.id), auth.user.id)
    : localRepository, [auth.user?.id, localRepository]);
  const { data, actions, selectedDate, setSelectedDate, isReady, persistence } = useAppStore(repository);
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [reflectionOpen, setReflectionOpen] = useState(false);
  const [reflectionLinks, setReflectionLinks] = useState<(Pick<Reflection, "itemId" | "projectId"> & { title?: string }) | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const social = useSocialGraph(auth.user?.id);

  useEffect(() => { setMonitoringUser(auth.user?.id); }, [auth.user?.id]);

  useEffect(() => {
    if (!auth.user || !data?.currentUser.profile.name || !data.currentUser.profile.handle) return;
    void synchronizeProfile(auth.user.id, data.currentUser.profile.name, data.currentUser.profile.handle, data.currentUser.profile.photoStoragePath).catch((error) => {
      reportError(error, { operation: "profile_sync" });
    });
  }, [auth.user?.id, data?.currentUser.profile.name, data?.currentUser.profile.handle, data?.currentUser.profile.photoStoragePath]);

  useEffect(() => {
    if (!auth.user || !data?.hasOnboarded) return;
    const completion = summarizeWeek(data).completion * 100;
    const focus = data.projects.find((project) => !project.archivedAt)?.title ?? "Shared progress";
    const lastSignal = data.logs[0] ? `${data.logs[0].status} · ${data.logs[0].date}` : "No recent signal";
    void publishSocialSummary(auth.user.id, completion, focus, lastSignal).catch((error) => reportError(error, { operation: "social_summary" }));
  }, [auth.user?.id, data?.hasOnboarded, data?.logs, data?.projects, data?.breakDays]);

  useEffect(() => {
    const path = data?.currentUser.profile.photoStoragePath;
    if (!auth.user || !path) return;
    void createPrivateImageUrl(path).then((photoUri) => {
      if (photoUri !== data.currentUser.profile.photoUri) actions.updateProfile({ photoUri });
    }).catch((error) => reportError(error, { operation: "profile_photo_refresh" }));
  }, [auth.user?.id, data?.currentUser.profile.photoStoragePath]);

  useEffect(() => {
    if (!auth.user || !data?.hasOnboarded) return;
    const preferences = data.currentUser.notificationPreferences;
    const anyEnabled = Object.values(preferences).some(Boolean);
    const hasOpenTasks = data.workItems.some((item) => !item.isArchived);
    const operation = async () => {
      if (anyEnabled) {
        await registerPushNotifications(auth.user!.id);
        await synchronizeNotificationPreferences(auth.user!.id, preferences, hasOpenTasks);
      } else {
        await synchronizeNotificationPreferences(auth.user!.id, preferences, hasOpenTasks);
        await disablePushNotifications(auth.user!.id);
      }
    };
    void operation().catch((error) => reportError(error, { operation: "notification_sync" }));
  }, [auth.user?.id, data?.hasOnboarded, data?.currentUser.notificationPreferences, data?.workItems]);

  useEffect(() => auth.user ? listenForPushTokenChanges(auth.user.id) : undefined, [auth.user?.id]);

  useEffect(() => listenForNotificationNavigation((screen) => {
    if (["home", "goals", "friends", "archives", "you"].includes(screen)) {
      setLogOpen(false);
      setActiveTab(screen as AppTab);
    }
  }), []);

  if (!isReady || !data) {
    return (
      <SafeAreaProvider>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.purple} size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!data.hasOnboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={actions.completeOnboarding} />
      </SafeAreaProvider>
    );
  }

  const socialData = social.enabled ? {
    ...data,
    friends: social.friends,
    projects: [...data.projects, ...social.sharedProjects.filter((shared) => !data.projects.some((project) => project.id === shared.id))]
  } : data;

  return (
    <SafeAreaProvider>
      <View style={styles.app}>
        <StatusBar style="light" />
        {logOpen ? (
          <LogScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onLog={actions.logItem}
            onClear={actions.clearLog}
            onClose={() => setLogOpen(false)}
          />
        ) : activeTab === "home" && (
          <HomeScreen
            data={data}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onToggleBreakDay={actions.toggleBreakDay}
            onOpenLog={() => setLogOpen(true)}
            onOpenReflection={(context) => { setReflectionLinks(context ?? null); setReflectionOpen(true); }}
          />
        )}
        {activeTab === "goals" && (
          <GoalsScreen
            data={data}
            onMoveProject={actions.moveProject}
            onSetVisibility={actions.setProjectVisibility}
            onAddProject={actions.addProject}
            onUpdateProject={async (projectId, draft) => {
              actions.updateProject(projectId, draft);
              const project = socialData.projects.find((item) => item.id === projectId);
              if (social.enabled && project && social.sharedProjects.some((shared) => shared.id === projectId)) {
                await social.saveSharedProject({
                  ...project,
                  ...draft,
                  milestones: draft.milestones?.map((milestone, index) => ({
                    ...milestone,
                    id: project.milestones?.[index]?.id ?? `milestone-${Date.now()}-${index}`
                  }))
                });
              }
            }}
            onDeleteProject={async (projectId) => {
              const shared = social.sharedProjects.find((project) => project.id === projectId);
              if (!auth.user || !shared) actions.deleteProject(projectId);
              else if (shared.ownerId === auth.user.id) {
                await social.deleteSharedProject(projectId);
                actions.deleteProject(projectId);
              } else {
                await social.removeCollaborator(projectId, auth.user.id);
                actions.deleteProject(projectId);
              }
            }}
            onCreateCollaborationInvite={social.enabled ? social.createProjectInvite : undefined}
            collaborators={social.enabled ? social.collaborators : undefined}
            collaborationInvites={social.enabled ? social.invites.filter((invite) => invite.kind === "collaborator") : undefined}
            onRemoveCollaborator={social.enabled ? social.removeCollaborator : undefined}
            onRevokeCollaborationInvite={social.enabled ? social.revokeInvite : undefined}
          />
        )}
        {activeTab === "friends" && (
          <FriendsScreen
            data={socialData}
            onAddFriend={actions.addFriend}
            onRemoveFriend={async (friendId) => { if (social.enabled) await social.remove(friendId); else actions.removeFriend(friendId); }}
            onToggleFeedback={actions.toggleFriendFeedback}
            onAddComment={actions.addComment}
            onDeleteComment={actions.deleteComment}
            remote={social.enabled ? social : undefined}
          />
        )}
        {activeTab === "archives" && (
          <ArchivesScreen data={data} onUpdateLogNote={actions.updateLogNote} onUpdateReflection={actions.updateReflection} onDeleteReflection={actions.deleteReflection} />
        )}
        {activeTab === "you" && (
          <YouScreen
            data={socialData}
            persistence={persistence}
            onReset={actions.reset}
            onUpdateProfile={actions.updateProfile}
            onSetNotificationPreference={actions.setNotificationPreference}
            onOpenFriends={() => setActiveTab("friends")}
            onUploadProfilePhoto={auth.user ? async (uri) => {
              const image = await uploadPrivateImage(auth.user!.id, uri, "profile");
              const oldPath = data.currentUser.profile.photoStoragePath;
              if (oldPath) await deletePrivateImage(oldPath);
              return image;
            } : undefined}
            onRemoveProfilePhoto={auth.user ? async () => {
              const path = data.currentUser.profile.photoStoragePath;
              if (path) await deletePrivateImage(path);
              actions.updateProfile({ photoUri: undefined, photoStoragePath: undefined });
            } : undefined}
            onExportData={() => exportUserData(data, Boolean(auth.user))}
            onDeleteAccount={auth.user ? async () => { await deleteAccount(); await localRepository.reset(); } : undefined}
            onSignOut={auth.user ? async () => { await localRepository.reset(); await auth.signOut(); } : undefined}
            onChangePassword={auth.user ? auth.updatePassword : undefined}
          />
        )}

        <BottomTabs activeTab={activeTab} onChange={(tab) => { setLogOpen(false); setReflectionOpen(false); setReflectionLinks(null); setActiveTab(tab); }} />
        <ReflectionSheet
          visible={reflectionOpen}
          traits={data.traitOptions}
          contextTitle={reflectionLinks?.title}
          onClose={() => { setReflectionOpen(false); setReflectionLinks(null); }}
          onSave={(text, traits) => actions.addReflection(text, traits, {
            itemId: reflectionLinks?.itemId,
            projectId: reflectionLinks?.projectId
          })}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    width: "100%",
    backgroundColor: colors.surfaceSoft
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft
  }
});
