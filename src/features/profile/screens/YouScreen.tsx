import { useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import {
  Avatar,
  DraftCard,
  DraftStatusBar,
  IconGlyph
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import type { AppData, NotificationPreferences, UserProfile } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onReset: () => void;
  onUpdateProfile: (profile: Partial<UserProfile>) => void;
  onSetNotificationPreference: (key: keyof NotificationPreferences, enabled: boolean) => void;
  onOpenFriends: () => void;
};

const stats = [
  { icon: "trending-up-outline" as const, value: "62%", label: "This week", color: colors.purple, bg: colors.purpleDeep },
  { icon: "flash-outline" as const, value: "56%", label: "Today", color: colors.mint, bg: "#0F2A1C" },
  { icon: "flag-outline" as const, value: "5", label: "Active projects", color: colors.ink, bg: "#1B1B1E" },
  { icon: "checkmark-outline" as const, value: "12", label: "Completed all-time", color: colors.mint, bg: "#0F2A1C" }
];

const settings = [
  { icon: "create-outline" as const, label: "Edit profile" },
  { icon: "people-outline" as const, label: "Manage friends" },
  { icon: "notifications-outline" as const, label: "Notifications" },
  { icon: "color-palette-outline" as const, label: "Appearance" },
  { icon: "lock-closed-outline" as const, label: "Privacy" }
];

export function YouScreen({ data, onReset, onUpdateProfile, onSetNotificationPreference, onOpenFriends }: Props) {
  const profile = data.currentUser.profile;
  const name = profile.name || "Cho";
  const handle = profile.handle || "@cho";
  const [panel, setPanel] = useState<"profile" | "notifications" | "appearance" | "privacy" | null>(null);
  const [draftName, setDraftName] = useState(name);
  const [draftHandle, setDraftHandle] = useState(handle);

  const openSetting = (label: string) => {
    if (label === "Manage friends") return onOpenFriends();
    if (label === "Edit profile") setPanel("profile");
    if (label === "Notifications") setPanel("notifications");
    if (label === "Appearance") setPanel("appearance");
    if (label === "Privacy") setPanel("privacy");
  };

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.profile}>
        <View style={styles.avatarWrap}>
          <Avatar label={name.slice(0, 1).toUpperCase()} large />
          <View style={styles.camera}>
            <IconGlyph name="camera-outline" size={12} color={colors.surfaceSoft} />
          </View>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.handle}>{handle}</Text>
        <View style={styles.friendCount}>
          <IconGlyph name="people-outline" size={13} color={colors.inactive} />
          <Text style={styles.friendText}>5 friends</Text>
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
        <Pressable style={styles.backdrop} onPress={() => setPanel(null)} />
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setPanel(null)}><IconGlyph name="close" size={18} color={colors.inkMuted} /></Pressable>
            <Text style={styles.modalTitle}>{panel === "profile" ? "Edit profile" : panel === "notifications" ? "Notifications" : panel === "appearance" ? "Appearance" : "Privacy"}</Text>
            <View style={styles.spacer} />
          </View>

          {panel === "profile" && <>
            <Text style={styles.fieldLabel}>NAME</Text>
            <TextInput value={draftName} onChangeText={setDraftName} style={styles.input} />
            <Text style={styles.fieldLabel}>HANDLE</Text>
            <TextInput value={draftHandle} onChangeText={setDraftHandle} autoCapitalize="none" style={styles.input} />
            <Pressable style={styles.primaryButton} onPress={() => { onUpdateProfile({ name: draftName.trim(), handle: draftHandle.trim() }); setPanel(null); }}><Text style={styles.primaryText}>Save profile</Text></Pressable>
          </>}

          {panel === "notifications" && (Object.entries(data.currentUser.notificationPreferences) as Array<[keyof NotificationPreferences, boolean]>).map(([key, enabled]) => (
            <View key={key} style={styles.toggleRow}>
              <Text style={styles.settingLabel}>{preferenceLabel(key)}</Text>
              <Switch value={enabled} onValueChange={(value) => onSetNotificationPreference(key, value)} trackColor={{ false: colors.stroke, true: colors.purpleDeep }} thumbColor={enabled ? colors.purple : colors.inactive} />
            </View>
          ))}

          {panel === "appearance" && <Text style={styles.panelCopy}>The approved dark Progress theme is active. Additional themes can be added without changing your data.</Text>}
          {panel === "privacy" && <>
            <Text style={styles.panelCopy}>Your full summary is private. Friends only see the weekly bar and goals you explicitly share.</Text>
            <Pressable style={styles.resetButton} onPress={() => { void onReset(); setPanel(null); }}><Text style={styles.resetText}>Reset local app data</Text></Pressable>
          </>}
        </View>
      </Modal>
    </Screen>
  );
}

function preferenceLabel(key: keyof NotificationPreferences): string {
  return ({ weeklyPlanning: "Weekly planning", encouragement: "Encouragement", memories: "Memories", ownTaskReminders: "Task reminders" })[key];
}

const styles = StyleSheet.create({
  profile: {
    alignItems: "center",
    marginBottom: 18
  },
  avatarWrap: {
    position: "relative",
    marginBottom: 10
  },
  camera: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.surfaceSoft,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: "900"
  },
  handle: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  friendCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6
  },
  friendText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14
  },
  statCard: {
    width: "48%",
    padding: 14
  },
  iconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8
  },
  statValue: {
    fontSize: 20,
    fontWeight: "900"
  },
  statLabel: {
    color: colors.inkMuted,
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2
  },
  settingsCard: {
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 14
  },
  settingRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4
  },
  settingBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke
  },
  settingLabel: {
    color: colors.ink,
    flex: 1,
    fontSize: 14,
    fontWeight: "900"
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  modal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surfaceSoft,
    padding: 20,
    paddingBottom: 34
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  spacer: { width: 18 },
  fieldLabel: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 14
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  primaryText: { color: colors.surfaceSoft, fontWeight: "900" },
  toggleRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.stroke
  },
  panelCopy: {
    color: colors.whiteMuted,
    fontSize: 14,
    lineHeight: 21
  },
  resetButton: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  resetText: { color: colors.inkMuted, fontWeight: "700" }
});
