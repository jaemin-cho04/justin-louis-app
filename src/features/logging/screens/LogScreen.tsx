import { useState } from "react";
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
  onClear: (itemId: string) => void;
  onClose?: () => void;
};

const statusButtons: Array<{ status: LogStatus; label: string; color: string }> = [
  { status: "done", label: "Done", color: colors.purple },
  { status: "attempted", label: "Tried", color: colors.amber },
  { status: "missed", label: "Missed", color: colors.coral },
  { status: "skipped", label: "Skip", color: colors.stroke },
  { status: "deferred", label: "Defer", color: colors.sky }
];

export function LogScreen({ data, selectedDate, onDateChange, onLog, onClear, onClose }: Props) {
  const [clearCandidateId, setClearCandidateId] = useState<string | null>(null);
  const items = scheduledItems(data, selectedDate);
  const summary = summarizeDay(data, selectedDate);

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.titleRow}>
        {onClose && <Pressable accessibilityRole="button" accessibilityLabel="Close progress log" onPress={onClose} style={styles.iconButton}><IconGlyph name="arrow-back" size={19} /></Pressable>}
        <Text style={styles.title}>Progress Log</Text>
      </View>
      <Text style={styles.subtitle}>Tap a status to add or change it. Clear returns an item to open.</Text>
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
                      accessibilityRole="button"
                      accessibilityLabel={`${button.label} ${item.title}`}
                      accessibilityState={{ selected: isSelected }}
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
              {log && (clearCandidateId === item.id ? (
                <View style={styles.clearConfirm}>
                  <Text style={styles.clearWarning}>Clear this status and its saved note?</Text>
                  <View style={styles.clearActions}>
                    <Pressable accessibilityRole="button" onPress={() => setClearCandidateId(null)} style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Confirm clear status for ${item.title}`}
                      onPress={() => { onClear(item.id); setClearCandidateId(null); }}
                      style={styles.clearButton}
                    >
                      <Text style={styles.clearText}>Clear status</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable accessibilityRole="button" accessibilityLabel={`Clear status for ${item.title}`} onPress={() => setClearCandidateId(item.id)} style={styles.clearLink}>
                  <IconGlyph name="close-circle-outline" size={15} color={colors.inkMuted} />
                  <Text style={styles.clearLinkText}>Clear status</Text>
                </Pressable>
              ))}
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
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
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
    minHeight: 44,
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
  clearLink: {
    minHeight: 44,
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  clearLinkText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  clearConfirm: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    paddingTop: 12
  },
  clearWarning: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 10
  },
  clearActions: {
    flexDirection: "row",
    gap: 8
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelText: {
    color: colors.inkMuted,
    fontWeight: "900"
  },
  clearButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: colors.coral,
    alignItems: "center",
    justifyContent: "center"
  },
  clearText: {
    color: colors.surfaceSoft,
    fontWeight: "900"
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
