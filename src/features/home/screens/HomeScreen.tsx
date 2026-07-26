import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import {
  Dot,
  DraftButton,
  DraftCard,
  DraftStatusBar,
  IconGlyph,
  SegmentBar
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import { isBreakDay, logForItem, scheduledItems, summarizeWeek } from "../../../domain/selectors/progress";
import { formatBreakdownLabel, offsetDateKey, parseDateKey, todayKey, weekKeys } from "../../../shared/utils/dates";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToggleBreakDay: () => void;
  onOpenLog: () => void;
  onOpenReflection: (context?: { itemId: string; projectId: string; title: string }) => void;
};

export function HomeScreen({ data, selectedDate, onDateChange, onToggleBreakDay, onOpenLog, onOpenReflection }: Props) {
  const profile = data.currentUser.profile;
  const { height } = useWindowDimensions();
  const compactHeight = height < 820;
  const name = profile.name || "Cho";
  const today = todayKey();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const taskStackOffset = useRef(0);
  const itemOffsets = useRef<Record<string, number>>({});
  const dayOffset = Math.round((parseDateKey(selectedDate).getTime() - parseDateKey(today).getTime()) / 86400000);
  const breakdownLabel = formatBreakdownLabel(selectedDate, today);
  const items = scheduledItems(data, selectedDate);
  const breakDay = isBreakDay(data, selectedDate);
  const selectedId = items.some((item) => item.id === selectedItemId) ? selectedItemId : null;
  const week = summarizeWeek(data);
  const weekItemCount = weekKeys().reduce((count, date) => count + scheduledItems(data, date).length, 0);
  const completion = Math.round(week.completion * 100);

  useEffect(() => {
    setSelectedItemId(null);
  }, [selectedDate]);

  return (
    <Screen scrollRef={scrollRef}>
      <DraftStatusBar />
      <View style={[styles.heading, compactHeight && styles.headingCompact]}>
        <Text style={styles.title}>Hi {name}</Text>
        <Text style={styles.subtitle}>{parseDateKey(today).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} - {profile.termLabel || "Summer term"}</Text>
      </View>

      <DraftCard style={[styles.hero, compactHeight && styles.heroCompact]}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <View style={styles.percentRow}>
          <Text style={styles.percent}>{completion}</Text>
          <Text style={styles.percentMark}>%</Text>
        </View>
        <SegmentBar done={week.doneWeight} attempted={week.attemptedWeight} open={week.openWeight + week.missedWeight} height={14} style={styles.weekBar} />
        <View style={styles.legend}>
          <Text style={styles.legendText}><Text style={styles.doneText}>{week.doneWeight}</Text> done</Text>
          <Text style={styles.legendText}><Text style={styles.purpleText}>{week.attemptedWeight}</Text> attempting</Text>
          <Text style={styles.legendText}><Text style={styles.dimText}>{week.openWeight + week.missedWeight}</Text> remaining</Text>
        </View>
        <Text style={styles.footnote}>{weekItemCount} tasks scheduled this week</Text>
      </DraftCard>

      <View style={[styles.actionStack, compactHeight && styles.actionStackCompact]}>
        <DraftButton label={breakDay ? "Undo BreakDay" : "Take a BreakDay"} icon="moon-outline" onPress={onToggleBreakDay} />
        <DraftButton label="Progress Log" primary onPress={onOpenLog} />
        <DraftButton label="Add reflection" icon="create-outline" onPress={onOpenReflection} />
      </View>

      <View style={styles.breakdownHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous day" disabled={dayOffset <= -2} onPress={() => onDateChange(offsetDateKey(selectedDate, -1))} style={styles.dayButton}>
          <IconGlyph name="chevron-back" size={14} color={dayOffset <= -2 ? colors.stroke : colors.inactive} />
        </Pressable>
        <Text style={styles.eyebrow}>{breakdownLabel}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Next day" disabled={dayOffset >= 2} onPress={() => onDateChange(offsetDateKey(selectedDate, 1))} style={styles.dayButton}>
          <IconGlyph name="chevron-forward" size={14} color={dayOffset >= 2 ? colors.stroke : colors.inactive} />
        </Pressable>
      </View>
      {items.length > 0 && <Text style={styles.breakdownHint}>Tap a task to show or hide its details.</Text>}

      <View
        style={[styles.taskStack, compactHeight && styles.taskStackCompact]}
        onLayout={(event) => { taskStackOffset.current = event.nativeEvent.layout.y; }}
      >
        {breakDay && (
          <DraftCard selected style={styles.breakCard}>
            <View style={styles.taskTop}>
              <IconGlyph name="moon-outline" size={17} color={colors.sky} />
              <View style={styles.breakCopy}>
                <Text style={styles.taskTitle}>BreakDay</Text>
                <Text style={styles.breakText}>Unlogged work stays neutral so rest does not count as failure.</Text>
              </View>
            </View>
          </DraftCard>
        )}
        {items.length === 0 && <DraftCard><Text style={styles.emptyText}>Nothing scheduled for this day.</Text></DraftCard>}
        {items.map((item, index) => {
          const log = logForItem(data, item.id, selectedDate);
          const status = log?.status ?? (breakDay ? "deferred" : dayOffset < 0 ? "missed" : "open");
          const active = item.id === selectedId;
          const color = status === "done" ? colors.mint : status === "attempted" ? colors.purple : colors.inactive;
          const progress = status === "done" ? 100 : status === "attempted" ? 55 : 0;
          const project = data.projects.find((candidate) => candidate.id === item.projectId);
          const linkedReflections = data.reflections.filter((reflection) => reflection.itemId === item.id);
          const latestReflection = linkedReflections[0];

          return (
            <View key={item.id} onLayout={(event) => { itemOffsets.current[item.id] = event.nativeEvent.layout.y; }}>
            <DraftCard selected={active} dim={active ? 1 : Math.max(0.55, 0.85 - index * 0.08)}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.title}, ${statusLabel(status)}. ${active ? "Hide" : "Show"} details`}
                accessibilityState={{ expanded: active }}
                onPress={() => setSelectedItemId((current) => {
                  const next = current === item.id ? null : item.id;
                  if (next) {
                    requestAnimationFrame(() => scrollRef.current?.scrollTo({
                      y: Math.max(0, taskStackOffset.current + (itemOffsets.current[item.id] ?? 0) - 280),
                      animated: true
                    }));
                  }
                  return next;
                })}
                style={({ pressed }) => pressed && styles.taskPressed}
              >
                <View style={styles.taskTop}>
                  <Dot color={color} />
                  <IconGlyph name={item.kind === "habit" ? "repeat-outline" : "flag-outline"} size={16} />
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  {active && <Text style={[styles.statusDone, { color }]}>{statusLabel(status)}</Text>}
                  <IconGlyph name={active ? "chevron-up" : "chevron-down"} size={15} color={colors.inactive} />
                </View>
                <View style={styles.miniTrack}><View style={[styles.miniFill, { width: `${progress}%`, backgroundColor: color }]} /></View>
              </Pressable>
              {active && <View style={styles.details}>
                  <Text style={styles.detailLine}>Goal: <Text style={styles.detailValue}>{project?.title ?? "Unassigned"}</Text></Text>
                  <Text style={styles.detailLine}>Effort: <Text style={styles.detailValue}>{item.effort}</Text></Text>
                  <Text style={styles.detailLine}>Note: <Text style={styles.detailNote}>{log?.note || "No note added."}</Text></Text>
                  {latestReflection && (
                    <View style={styles.reflectionSummary}>
                      <Text style={styles.reflectionCount}>{linkedReflections.length} {linkedReflections.length === 1 ? "reflection" : "reflections"} saved</Text>
                      <Text numberOfLines={2} style={styles.reflectionPreview}>{latestReflection.text}</Text>
                    </View>
                  )}
                  <DraftButton
                    label="Add task reflection"
                    icon="create-outline"
                    onPress={() => onOpenReflection({ itemId: item.id, projectId: item.projectId, title: item.title })}
                    style={styles.reflectionButton}
                  />
                </View>}
            </DraftCard>
            </View>
          );
        })}
      </View>

    </Screen>
  );
}

function statusLabel(status: "done" | "attempted" | "missed" | "skipped" | "deferred" | "open"): string {
  return ({
    done: "Done",
    attempted: "Attempting",
    missed: "Missed",
    skipped: "Skipped",
    deferred: "Deferred",
    open: "Not started"
  })[status];
}

const styles = StyleSheet.create({
  dayButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center"
  },
  heading: {
    marginBottom: 18
  },
  headingCompact: {
    marginBottom: 10
  },
  title: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  hero: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 20
  },
  heroCompact: {
    paddingVertical: 14,
    marginBottom: 12
  },
  eyebrow: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 8,
    marginBottom: 14
  },
  percent: {
    color: colors.ink,
    fontSize: 44,
    lineHeight: 46,
    fontWeight: "900"
  },
  percentMark: {
    color: colors.inkMuted,
    fontSize: 20,
    fontWeight: "900"
  },
  weekBar: {
    marginBottom: 10
  },
  legend: {
    flexDirection: "row",
    gap: 16
  },
  legendText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  doneText: {
    color: colors.mint,
    fontWeight: "900"
  },
  purpleText: {
    color: colors.purple,
    fontWeight: "900"
  },
  dimText: {
    color: colors.inactive,
    fontWeight: "900"
  },
  footnote: {
    color: colors.inactive,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8
  },
  breakdownHint: {
    color: colors.inactive,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 10
  },
  taskStack: {
    gap: 8,
    marginBottom: 16
  },
  taskStackCompact: {
    gap: 6,
    marginBottom: 10
  },
  breakCard: {
    borderColor: colors.sky
  },
  breakCopy: {
    flex: 1
  },
  breakText: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  emptyText: {
    color: colors.inkMuted,
    fontSize: 13,
    textAlign: "center"
  },
  taskTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  taskPressed: {
    opacity: 0.75
  },
  taskTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    flex: 1
  },
  statusDone: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900"
  },
  miniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stroke,
    overflow: "hidden",
    marginTop: 10
  },
  miniFill: {
    height: "100%"
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: colors.stroke,
    marginTop: 10,
    paddingTop: 10,
    gap: 6
  },
  detailLine: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600"
  },
  detailValue: {
    color: colors.ink,
    fontWeight: "900"
  },
  detailNote: {
    color: colors.whiteMuted,
    fontWeight: "600"
  },
  reflectionSummary: {
    borderLeftWidth: 2,
    borderLeftColor: colors.purple,
    paddingLeft: 10,
    marginTop: 4,
    gap: 2
  },
  reflectionCount: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: "900"
  },
  reflectionPreview: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 17
  },
  reflectionButton: {
    marginTop: 6
  },
  actionStack: {
    gap: 12,
    marginBottom: 18
  },
  actionStackCompact: {
    gap: 10,
    marginBottom: 28
  }
});
