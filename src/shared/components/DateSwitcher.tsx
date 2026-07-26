import { Pressable, StyleSheet, Text, View } from "react-native";

import { displayDate, offsetDateKey, todayKey } from "../utils/dates";
import { colors } from "../theme/colors";

type Props = {
  date: string;
  onChange: (date: string) => void;
};

export function DateSwitcher({ date, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel="Previous log date" style={styles.button} onPress={() => onChange(offsetDateKey(date, -1))}>
        <Text style={styles.buttonText}>Prev</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Return to today" style={styles.current} onPress={() => onChange(todayKey())}>
        <Text style={styles.date}>{displayDate(date)}</Text>
        <Text style={styles.today}>Tap for today</Text>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Next log date" style={styles.button} onPress={() => onChange(offsetDateKey(date, 1))}>
        <Text style={styles.buttonText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14
  },
  button: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: colors.surface
  },
  buttonText: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900"
  },
  current: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  date: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "900"
  },
  today: {
    color: colors.inkMuted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2
  }
});
