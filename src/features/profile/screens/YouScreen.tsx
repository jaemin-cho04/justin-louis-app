import { useState } from "react";
import { Alert, Image, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import {
  Avatar,
  DraftCard,
  DraftStatusBar,
  IconGlyph
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import { styles } from "./YouScreen.styles";
import { summarizeDay, summarizeWeek } from "../../../domain/selectors/progress";
import { todayKey } from "../../../shared/utils/dates";
import type { AppData, NotificationPreferences, UserProfile } from "../../../domain/model/types";
import { isValidHandle, normalizeHandle } from "../../../shared/utils/validation";

type Props = {
  data: AppData;
  persistence: {
    status: "loading" | "saving" | "saved" | "error";
    lastSavedAt?: string;
    message?: string;
    revision?: number;
    diagnostics: Array<{ code: string; severity: "info" | "warning" | "error"; message: string }>;
  };
  onReset: () => void | Promise<void>;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onSetNotificationPreference: (key: keyof NotificationPreferences, enabled: boolean) => void;
  onOpenFriends: () => void;
  onUploadProfilePhoto?: (uri: string) => Promise<{ uri: string; storagePath: string }>;
  onRemoveProfilePhoto?: () => Promise<void>;
  onExportData: () => Promise<string>;
  onDeleteAccount?: () => Promise<void>;
  onSignOut?: () => Promise<void>;
  onChangePassword?: (password: string) => Promise<void>;
};

const settings = [
  { icon: "create-outline" as const, label: "Edit profile" },
  { icon: "people-outline" as const, label: "Manage friends" },
  { icon: "notifications-outline" as const, label: "Notifications" },
  { icon: "lock-closed-outline" as const, label: "Privacy" }
];

export function YouScreen({ data, persistence, onReset, onUpdateProfile, onSetNotificationPreference, onOpenFriends, onUploadProfilePhoto, onRemoveProfilePhoto, onExportData, onDeleteAccount, onSignOut, onChangePassword }: Props) {
  const profile = data.currentUser.profile;
  const name = profile.name || "Cho";
  const handle = profile.handle || "@cho";
  const [panel, setPanel] = useState<"profile" | "notifications" | "privacy" | null>(null);
  const [draftName, setDraftName] = useState(name);
  const [draftHandle, setDraftHandle] = useState(handle);
  const [profileError, setProfileError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountMessage, setAccountMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const weekCompletion = Math.round(summarizeWeek(data).completion * 100);
  const todayCompletion = Math.round(summarizeDay(data, todayKey()).completion * 100);
  const stats = [
    { icon: "trending-up-outline" as const, value: `${weekCompletion}%`, label: "This week", color: colors.purple, bg: colors.purpleDeep },
    { icon: "flash-outline" as const, value: `${todayCompletion}%`, label: "Today", color: colors.mint, bg: "#0F2A1C" },
    { icon: "flag-outline" as const, value: `${data.projects.filter((project) => !project.archivedAt).length}`, label: "Active projects", color: colors.ink, bg: "#1B1B1E" },
    { icon: "checkmark-outline" as const, value: `${data.logs.filter((entry) => entry.status === "done").length}`, label: "Completed all-time", color: colors.mint, bg: "#0F2A1C" }
  ];

  const openSetting = (label: string) => {
    if (label === "Manage friends") return onOpenFriends();
    if (label === "Edit profile") {
      setDraftName(profile.name);
      setDraftHandle(profile.handle);
      setProfileError("");
      setPanel("profile");
    }
    if (label === "Notifications") setPanel("notifications");
    if (label === "Privacy") setPanel("privacy");
  };

  const saveProfile = () => {
    const cleanName = draftName.trim();
    const cleanHandle = draftHandle.trim().replace(/^@+/, "");
    if (!cleanName || !cleanHandle) {
      setProfileError("Enter both a name and handle.");
      return;
    }
    if (!isValidHandle(cleanHandle)) {
      setProfileError("Use 3–32 letters, numbers, or underscores for your handle.");
      return;
    }
    onUpdateProfile({ name: cleanName, handle: normalizeHandle(cleanHandle) });
    setProfileError("");
    setPanel(null);
  };

  const pickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photo access needed", "Allow photo-library access in Settings to choose a profile photo.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAccountBusy(true);
      try {
        const upload = onUploadProfilePhoto ? await onUploadProfilePhoto(result.assets[0].uri) : { uri: result.assets[0].uri, storagePath: undefined };
        onUpdateProfile({ photoUri: upload.uri, photoStoragePath: upload.storagePath });
      } catch (cause) {
        Alert.alert("Upload failed", cause instanceof Error ? cause.message : "The photo could not be uploaded.");
      } finally {
        setAccountBusy(false);
      }
    }
  };

  const exportData = async () => {
    setAccountBusy(true);
    setAccountMessage("");
    try {
      await onExportData();
      setAccountMessage("Your export is ready.");
    } catch (cause) {
      setAccountMessage(cause instanceof Error ? cause.message : "The export could not be created.");
    } finally {
      setAccountBusy(false);
    }
  };

  const removeProfilePhoto = async () => {
    setAccountBusy(true);
    try {
      if (onRemoveProfilePhoto) await onRemoveProfilePhoto();
      else onUpdateProfile({ photoUri: undefined, photoStoragePath: undefined });
      setAccountMessage("Profile photo removed.");
    } catch (cause) {
      setAccountMessage(cause instanceof Error ? cause.message : "The profile photo could not be removed.");
    } finally {
      setAccountBusy(false);
    }
  };

  const signOut = async () => {
    if (!onSignOut) return;
    setAccountBusy(true);
    setAccountMessage("");
    try {
      await onSignOut();
    } catch (cause) {
      setAccountMessage(cause instanceof Error ? cause.message : "Could not sign out.");
      setAccountBusy(false);
    }
  };

  const resetData = async () => {
    setAccountBusy(true);
    setAccountMessage("");
    try {
      await onReset();
      setConfirmReset(false);
      setPanel(null);
    } catch (cause) {
      setAccountMessage(cause instanceof Error ? cause.message : "The app data could not be reset.");
    } finally {
      setAccountBusy(false);
    }
  };

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.profile}>
        <View style={styles.avatarWrap}>
          {profile.photoUri ? <Image source={{ uri: profile.photoUri }} accessibilityLabel={`${name}'s profile photo`} style={styles.profilePhoto} /> : <Avatar label={name.slice(0, 1).toUpperCase()} large />}
          <Pressable accessibilityRole="button" accessibilityLabel="Choose profile photo" onPress={() => { void pickProfilePhoto(); }} style={styles.camera}>
            <View style={styles.cameraVisual}><IconGlyph name="camera-outline" size={12} color={colors.surfaceSoft} /></View>
          </Pressable>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.handle}>{handle}</Text>
        <View style={styles.friendCount}>
          <IconGlyph name="people-outline" size={13} color={colors.inactive} />
          <Text style={styles.friendText}>{data.friends.length} friends</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <DraftCard key={stat.label} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: stat.bg }]}>
              <IconGlyph name={stat.icon} size={14} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </DraftCard>
        ))}
      </View>

      <DraftCard style={styles.settingsCard}>
        {settings.map((setting, index) => (
          <Pressable
            key={setting.label}
            accessibilityRole="button"
            accessibilityLabel={setting.label}
            style={[styles.settingRow, index < settings.length - 1 && styles.settingBorder]}
            onPress={() => openSetting(setting.label)}
          >
            <IconGlyph name={setting.icon} size={17} />
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <IconGlyph name="chevron-forward" size={15} color={colors.inactive} />
          </Pressable>
        ))}
      </DraftCard>

      <Modal visible={panel !== null} animationType="slide" transparent onRequestClose={() => setPanel(null)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close settings" style={styles.backdrop} onPress={() => setPanel(null)} />
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close settings" onPress={() => setPanel(null)} style={styles.closeButton}><IconGlyph name="close" size={18} color={colors.inkMuted} /></Pressable>
            <Text style={styles.modalTitle}>{panel === "profile" ? "Edit profile" : panel === "notifications" ? "Notifications" : "Privacy"}</Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {panel === "profile" && <>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput accessibilityLabel="Name" value={draftName} onChangeText={(value) => { setDraftName(value); if (profileError) setProfileError(""); }} style={styles.input} />
            <Text style={styles.fieldLabel}>HANDLE</Text>
            <TextInput accessibilityLabel="Handle" value={draftHandle} onChangeText={(value) => { setDraftHandle(value); if (profileError) setProfileError(""); }} autoCapitalize="none" style={styles.input} />
            {!!profileError && <Text accessibilityRole="alert" style={styles.errorText}>{profileError}</Text>}
            <Pressable accessibilityRole="button" accessibilityLabel="Save profile" style={styles.primaryButton} onPress={saveProfile}><Text style={styles.primaryText}>Save profile</Text></Pressable>
            {!!profile.photoUri && <Pressable accessibilityRole="button" accessibilityLabel="Remove profile photo" accessibilityState={{ disabled: accountBusy }} disabled={accountBusy} style={styles.resetButton} onPress={() => { void removeProfilePhoto(); }}><Text style={styles.resetText}>Remove profile photo</Text></Pressable>}
          </>}

          {panel === "notifications" && (Object.entries(data.currentUser.notificationPreferences) as Array<[keyof NotificationPreferences, boolean]>).map(([key, enabled]) => (
            <View key={key} style={styles.toggleRow}>
              <Text style={styles.settingLabel}>{preferenceLabel(key)}</Text>
              <Switch accessibilityLabel={preferenceLabel(key)} value={enabled} onValueChange={(value) => onSetNotificationPreference(key, value)} trackColor={{ false: colors.stroke, true: colors.purpleDeep }} thumbColor={enabled ? colors.purple : colors.inactive} />
            </View>
          ))}

          {panel === "privacy" && <>
            <Text style={styles.panelCopy}>Your full summary is private. Friends only see the weekly bar and goals you explicitly share.</Text>
            <View accessibilityLiveRegion="polite" style={[styles.dataStatus, persistence.status === "error" && styles.dataStatusError]}>
              <IconGlyph name={persistence.status === "error" ? "alert-circle-outline" : "cloud-done-outline"} size={16} color={persistence.status === "error" ? colors.coral : colors.mint} />
              <View style={styles.dataStatusCopy}>
                <Text style={styles.dataStatusTitle}>
                  Local data: {persistenceLabel(persistence.status)}{persistence.diagnostics.length ? ` - ${persistence.diagnostics.length} notice${persistence.diagnostics.length === 1 ? "" : "s"}` : ""}
                </Text>
                <Text style={styles.dataStatusText}>
                  {persistence.message ?? persistence.diagnostics[0]?.message ?? "Changes are saved automatically in a versioned local data store."}
                  {persistence.revision ? ` Revision ${persistence.revision}.` : ""}
                </Text>
              </View>
            </View>
            {!!accountMessage && <Text accessibilityLiveRegion="polite" style={styles.accountMessage}>{accountMessage}</Text>}
            <Pressable accessibilityRole="button" accessibilityState={{ disabled: accountBusy }} disabled={accountBusy} style={styles.primaryButton} onPress={() => { void exportData(); }}><Text style={styles.primaryText}>{accountBusy ? "Working..." : "Export my data"}</Text></Pressable>
            {!!onChangePassword && <>
              <Text style={styles.fieldLabel}>NEW PASSWORD</Text>
              <TextInput accessibilityLabel="New password" secureTextEntry autoComplete="new-password" value={newPassword} onChangeText={setNewPassword} placeholder="At least 8 characters" placeholderTextColor={colors.inactive} style={styles.input} />
              <Pressable accessibilityRole="button" accessibilityState={{ disabled: newPassword.length < 8 || accountBusy }} disabled={newPassword.length < 8 || accountBusy} style={styles.resetButton} onPress={() => {
                setAccountBusy(true);
                void onChangePassword(newPassword).then(() => { setNewPassword(""); setAccountMessage("Password updated."); }).catch((cause) => setAccountMessage(cause.message)).finally(() => setAccountBusy(false));
              }}><Text style={styles.resetText}>Change password</Text></Pressable>
            </>}
            {!!onSignOut && <Pressable accessibilityRole="button" accessibilityState={{ disabled: accountBusy }} disabled={accountBusy} style={styles.resetButton} onPress={() => { void signOut(); }}><Text style={styles.resetText}>Sign out</Text></Pressable>}
            {!confirmReset ? (
              <Pressable accessibilityRole="button" style={styles.resetButton} onPress={() => setConfirmReset(true)}><Text style={styles.resetText}>Reset app data</Text></Pressable>
            ) : (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>This permanently resets every goal, log, note, and preference{onDeleteAccount ? " on this device and in your synchronized account" : " on this device"}.</Text>
                <View style={styles.confirmActions}>
                  <Pressable accessibilityRole="button" style={styles.cancelButton} onPress={() => setConfirmReset(false)}><Text style={styles.resetText}>Cancel</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityState={{ disabled: accountBusy }} disabled={accountBusy} style={styles.dangerButton} onPress={() => { void resetData(); }}><Text style={styles.dangerText}>{accountBusy ? "Resetting..." : "Reset everything"}</Text></Pressable>
                </View>
              </View>
            )}
            {!!onDeleteAccount && (!confirmDelete ? (
              <Pressable accessibilityRole="button" style={styles.deleteButton} onPress={() => setConfirmDelete(true)}><Text style={styles.deleteText}>Delete account and cloud data</Text></Pressable>
            ) : (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmText}>This permanently deletes your account, uploaded media, cloud data, friendships, and invites. This cannot be undone.</Text>
                <View style={styles.confirmActions}>
                  <Pressable accessibilityRole="button" style={styles.cancelButton} onPress={() => setConfirmDelete(false)}><Text style={styles.resetText}>Cancel</Text></Pressable>
                  <Pressable accessibilityRole="button" style={styles.dangerButton} onPress={() => { setAccountBusy(true); void onDeleteAccount().catch((cause) => { setAccountMessage(cause.message); setAccountBusy(false); }); }}><Text style={styles.dangerText}>Delete account</Text></Pressable>
                </View>
              </View>
            ))}
          </>}
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}

function preferenceLabel(key: keyof NotificationPreferences): string {
  return ({ weeklyPlanning: "Weekly planning", encouragement: "Encouragement", memories: "Memories", ownTaskReminders: "Task reminders" })[key];
}

function persistenceLabel(status: Props["persistence"]["status"]): string {
  return ({ loading: "loading", saving: "saving", saved: "saved", error: "needs attention" })[status];
}
