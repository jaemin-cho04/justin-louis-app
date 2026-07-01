import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors } from "../theme/colors";

type Props = {
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
};

export function AppButton({ label, onPress, tone = "primary", style }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[tone],
        pressed && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.label, tone !== "primary" && styles.darkLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.purple
  },
  secondary: {
    backgroundColor: colors.lavender
  },
  ghost: {
    backgroundColor: "transparent",
    borderColor: colors.stroke,
    borderWidth: 1
  },
  label: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 15
  },
  darkLabel: {
    color: colors.ink
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.88
  }
});
