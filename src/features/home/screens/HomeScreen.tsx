import { Pressable, StyleSheet, Text, View } from "react-native";

import { getBrandKicker } from "../../../config/brand";
import { AppButton } from "../../../shared/components/AppButton";
import { DateSwitcher } from "../../../shared/components/DateSwitcher";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { Screen } from "../../../shared/components/Screen";
import { isBreakDay, scheduledItems, summarizeDay } from "../../../domain/selectors/progress";
import { colors } from "../../../shared/theme/colors";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToggleBreakDay: () => void;
  onOpenLog: () => void;
  onOpenReflection: () => void;
};

export function HomeScreen({
  data,
  selectedDate,
  onDateChange,
  onToggleBreakDay,
  onOpenLog,
  onOpenReflection
}: Props) {
  const day = summarizeDay(data, selectedDate);
  const restDay = isBreakDay(data, selectedDate);
  const todayItems = scheduledItems(data, selectedDate).slice(0, 2);
  const profile = data.currentUser.profile;

  return (
    <Screen>
      <Text style={styles.kicker}>{getBrandKicker()}</Text>
      <Text style={styles.title}>Hi {profile.name || "there"}</Text>
      <Text style={styles.subtitle}>{profile.termLabel}</Text>
      <DateSwitcher date={selectedDate} onChange={onDateChange} />

      <View style={styles.todayCard}>
        <RowHeader label="Today" value={`${Math.round(day.completion * 100)}%`} />
        <ProgressBar summary={day} height={13} />
        <View style={styles.legend}>
          <Legend color={colors.purple} label="Done" />
          <Legend color={colors.amber} label="Attempted" />
          <Legend color={colors.coral} label="Missed" />
          <Legend color={colors.stroke} label="Deferred" />
        </View>

        <View style={styles.nextBlock}>
          <Text style={styles.nextTitle}>Next up</Text>
          {todayItems.length === 0 ? (
            <Text style={styles.empty}>Nothing scheduled today.</Text>
          ) : (
            todayItems.map((item) => {
              const project = data.projects.find((candidate) => candidate.id === item.projectId);
              return (
                <View key={item.id} style={styles.itemRow}>
                  <View style={[styles.dot, { backgroundColor: project?.color ?? colors.purple }]} />
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemMeta}>{project?.title} - effort {item.effort}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.actionRow}>
        <AppButton label="Log today" onPress={onOpenLog} style={styles.actionButton} />
        <AppButton
          label="Add reflection"
          onPress={onOpenReflection}
          tone="secondary"
          style={styles.actionButton}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onToggleBreakDay}
        style={[styles.restToggle, restDay && styles.restActive]}
      >
        <Text style={[styles.restText, restDay && styles.restActiveText]}>
          {restDay ? "Rest day is on" : "Take a rest day"}
        </Text>
      </Pressable>
    </Screen>
  );
}

function RowHeader({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.rowHeader}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 8
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 2,
    marginBottom: 16
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    marginTop: 14
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 11
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  value: {
    color: colors.purple,
    fontWeight: "900"
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 999
  },
  legendLabel: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  nextBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    marginTop: 16,
    paddingTop: 14
  },
  nextTitle: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 4
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 10
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999
  },
  itemCopy: {
    flex: 1
  },
  itemTitle: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 15
  },
  itemMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  empty: {
    color: colors.inkMuted,
    fontWeight: "700",
    lineHeight: 20
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  actionButton: {
    flex: 1
  },
  restToggle: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    backgroundColor: colors.surface
  },
  restActive: {
    borderColor: colors.purple,
    backgroundColor: colors.lavender
  },
  restText: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "800"
  },
  restActiveText: {
    color: colors.purple
  }
});
