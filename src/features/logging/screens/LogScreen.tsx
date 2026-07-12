import { Pressable, StyleSheet, Text, View } from "react-native";

import { DateSwitcher } from "../../../shared/components/DateSwitcher";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { Screen } from "../../../shared/components/Screen";
import { logForItem, scheduledItems, summarizeDay } from "../../../domain/selectors/progress";
import { colors } from "../../../shared/theme/colors";
import { DraftStatusBar, IconGlyph } from "../../../shared/components/DraftUI";
import type { AppData, LogStatus } from "../../../domain/model/types";

type Props = {
  data: AppData;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onLog: (itemId: string, status: LogStatus) => void;
  onClose?: () => void;
};

const statusButtons: Array<{ status: LogStatus; label: string; color: string }> = [
  { status: "done", label: "Done", color: colors.purple },
  { status: "attempted", label: "Tried", color: colors.amber },
  { status: "missed", label: "Missed", color: colors.coral },
  { status: "skipped", label: "Skip", color: colors.stroke },
  { status: "deferred", label: "Defer", color: colors.sky }
];

export function LogScreen({ data, selectedDate, onDateChange, onLog, onClose }: Props) {
  const items = scheduledItems(data, selectedDate);
  const summary = summarizeDay(data, selectedDate);

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.titleRow}>
        {onClose && <Pressable accessibilityLabel="Close progress log" onPress={onClose}><IconGlyph name="arrow-back" size={19} /></Pressable>}
        <Text style={styles.title}>Progress Log</Text>
      </View>
      <Text style={styles.subtitle}>Retroactive logging is allowed. You stay in control.</Text>
      <DateSwitcher date={selectedDate} onChange={onDateChange} />

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Your colored cells, condensed.</Text>
        <ProgressBar summary={summary} height={14} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing to log today</Text>
          <Text style={styles.emptyBody}>BreakDays and unscheduled days stay neutral, not red.</Text>
        </View>
      ) : (
        items.map((item) => {
          const project = data.projects.find((candidate) => candidate.id === item.projectId);
          const log = logForItem(data, item.id, selectedDate);

          return (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.projectPill, { backgroundColor: project?.color ?? colors.purple }]} />
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemMeta}>
                    {project?.title} - {item.kind} - effort {item.effort}
                  </Text>
                </View>
                <Text style={styles.current}>{log?.status ?? "open"}</Text>
              </View>
              <View style={styles.actions}>
                {statusButtons.map((button) => {
                  const isSelected = log?.status === button.status;
                  return (
                    <Pressable
                      key={button.status}
                      onPress={() => onLog(item.id, button.status)}
                      style={[
                        styles.statusButton,
                        isSelected && { borderColor: button.color, backgroundColor: `${button.color}1F` }
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: button.color }]} />
                      <Text style={[styles.statusLabel, isSelected && styles.selectedLabel]}>
                        {button.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 14
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderColor: colors.stroke,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14
  },
  summaryTitle: {
    color: colors.ink,
    fontWeight: "900",
    marginBottom: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderColor: colors.stroke,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  projectPill: {
    width: 8,
    alignSelf: "stretch",
    borderRadius: 999
  },
  itemText: {
    flex: 1
  },
  itemTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  itemMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  current: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  statusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 12,
    backgroundColor: colors.surface
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999
  },
  statusLabel: {
    color: colors.inkMuted,
    fontWeight: "800",
    fontSize: 12
  },
  selectedLabel: {
    color: colors.ink
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderColor: colors.stroke,
    borderWidth: 1
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  emptyBody: {
    color: colors.inkMuted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6
  }
});
