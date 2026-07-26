import type { ReactNode } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { colors } from "../theme/colors";

type IconName = keyof typeof Ionicons.glyphMap;

export function DraftStatusBar() {
  return (
    <View style={styles.statusbar}>
      <Text style={styles.wordmark}>PROGRESS</Text>
    </View>
  );
}

export function DraftCard({ children, selected = false, dim = 1, style }: {
  children: ReactNode;
  selected?: boolean;
  dim?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, selected && styles.cardSelected, dim !== 1 && { opacity: dim }, style]}>
      {children}
    </View>
  );
}

export function SegmentBar({
  done,
  attempted = 0,
  open,
  height = 5,
  style
}: {
  done: number;
  attempted?: number;
  open: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segmentTrack, { height }, style]}>
      <View style={[styles.segment, { flex: done, backgroundColor: colors.mint }]} />
      {attempted > 0 && <View style={[styles.segment, { flex: attempted, backgroundColor: colors.purple }]} />}
      <View style={[styles.segment, { flex: open, backgroundColor: colors.slate }]} />
    </View>
  );
}

export function Badge({ label, done = false }: { label: string; done?: boolean }) {
  return (
    <View style={[styles.badge, done && styles.badgeDone]}>
      <Text style={[styles.badgeText, done && styles.badgeDoneText]}>{label}</Text>
    </View>
  );
}

export function Avatar({ label, large = false }: { label: string; large?: boolean }) {
  return (
    <View style={[styles.avatar, large && styles.avatarLarge]}>
      <Text style={[styles.avatarText, large && styles.avatarLargeText]}>{label}</Text>
    </View>
  );
}

export function DraftButton({
  label,
  onPress,
  primary = false,
  icon,
  style
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary && styles.buttonPrimary,
        pressed && styles.pressed,
        style
      ]}
    >
      {icon && <Ionicons accessible={false} name={icon} size={13} color={primary ? colors.surfaceSoft : colors.purple} />}
      <Text style={[styles.buttonText, primary && styles.buttonPrimaryText]}>{label}</Text>
    </Pressable>
  );
}

export function Dot({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

export function IconGlyph({ name, size = 17, color = colors.whiteMuted }: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons accessible={false} name={name} size={size} color={color} />;
}

const styles = StyleSheet.create({
  statusbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  wordmark: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 16,
    padding: 16
  },
  cardSelected: {
    borderColor: colors.inkMuted
  },
  segmentTrack: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: 3,
    backgroundColor: colors.stroke
  },
  segment: {
    minWidth: 2
  },
  badge: {
    borderWidth: 1,
    borderColor: "#333338",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2
  },
  badgeText: {
    color: colors.inkMuted,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  badgeDone: {
    borderColor: colors.mint
  },
  badgeDoneText: {
    color: colors.mint
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.purpleDeep,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarLarge: {
    width: 76,
    height: 76
  },
  avatarText: {
    color: colors.purple,
    fontSize: 15,
    fontWeight: "900"
  },
  avatarLargeText: {
    fontSize: 28
  },
  button: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 13
  },
  buttonPrimary: {
    backgroundColor: colors.purple,
    borderColor: colors.purple
  },
  buttonText: {
    color: colors.whiteMuted,
    fontSize: 13,
    fontWeight: "900"
  },
  buttonPrimaryText: {
    color: colors.surfaceSoft
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999
  }
});
