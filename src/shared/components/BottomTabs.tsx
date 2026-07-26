import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import type { AppTab } from "../../domain/model/types";

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: "home", label: "Home", icon: "home" },
  { id: "goals", label: "Goals", icon: "flag" },
  { id: "friends", label: "Friends", icon: "people" },
  { id: "archives", label: "Archives", icon: "archive" },
  { id: "you", label: "You", icon: "person" }
];

export function BottomTabs({ activeTab, onChange }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, isActive && styles.activeTab, pressed && styles.pressed]}
          >
            <Ionicons
              accessible={false}
              name={tab.icon}
              size={21}
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
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 74,
    backgroundColor: colors.surfaceSoft,
    borderTopWidth: 1,
    borderTopColor: "#1E1E22",
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 10
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 16
  },
  activeTab: {
    backgroundColor: colors.purpleDeep
  },
  pressed: {
    backgroundColor: colors.surface
  },
  label: {
    color: colors.inactive,
    fontSize: 10,
    fontWeight: "600"
  },
  activeLabel: {
    color: colors.purple
  }
});
