import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";
import type { AppTab } from "../../domain/model/types";

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "home", label: "Home", icon: "home" },
  { id: "log", label: "Log", icon: "checkmark-circle" },
  { id: "friends", label: "Friends", icon: "people" },
  { id: "goals", label: "Goals", icon: "flag" },
  { id: "you", label: "You", icon: "person-circle" }
];

export function BottomTabs({ activeTab, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? colors.purple : colors.inkMuted}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    minHeight: 70,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 }
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 20
  },
  pressed: {
    backgroundColor: colors.surfaceSoft
  },
  label: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "700"
  },
  activeLabel: {
    color: colors.purple
  }
});
