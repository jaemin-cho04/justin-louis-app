import { Pressable, StyleSheet, Text, View } from "react-native";

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
import { offsetDateKey, parseDateKey, todayKey } from "../../../shared/utils/dates";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onToggleBreakDay: () => void;
  onOpenLog: () => void;
  onOpenReflection: () => void;
};

const expandedTask = {
  icon: "walk-outline" as const,
  title: "Runs",
  status: "Done",
  color: colors.mint,
  progress: 100,
  target: "5km run",
  logged: "5.2km - 27:40",
  note: "Felt strong on the last km, legs still a bit sore from Saturday."
};

const compressedTasks = [
  {
    icon: "book-outline" as const,
    title: "Study 2hrs",
    color: colors.purple,
    progress: 55,
    dim: 0.55
  },
  {
    icon: "briefcase-outline" as const,
    title: "Jobs",
    color: colors.inactive,
    progress: 0,
    dim: 0.3
  }
];

export function HomeScreen({ data, selectedDate, onDateChange, onOpenLog }: Props) {
  const profile = data.currentUser.profile;
  const name = profile.name || "Cho";
  const today = todayKey();
  const dayOffset = Math.round((parseDateKey(selectedDate).getTime() - parseDateKey(today).getTime()) / 86400000);
  const breakdownLabel = dayOffset === 0 ? "TODAY'S BREAKDOWN" : dayOffset === -1 ? "YESTERDAY'S BREAKDOWN" : dayOffset === 1 ? "TOMORROW'S BREAKDOWN" : `${parseDateKey(selectedDate).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }).toUpperCase()} BREAKDOWN`;

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.heading}>
        <Text style={styles.title}>Hi {name}</Text>
        <Text style={styles.subtitle}>Monday, 1 June - {profile.termLabel || "Summer term"}</Text>
      </View>

      <DraftCard style={styles.hero}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <View style={styles.percentRow}>
          <Text style={styles.percent}>62</Text>
          <Text style={styles.percentMark}>%</Text>
        </View>
        <SegmentBar done={44} attempted={18} open={38} height={14} style={styles.weekBar} />
        <View style={styles.legend}>
          <Text style={styles.legendText}><Text style={styles.doneText}>18</Text> done</Text>
          <Text style={styles.legendText}><Text style={styles.purpleText}>6</Text> attempting</Text>
          <Text style={styles.legendText}><Text style={styles.dimText}>11</Text> remaining</Text>
        </View>
        <Text style={styles.footnote}>35 tasks scheduled this week</Text>
      </DraftCard>

      <View style={styles.breakdownHeader}>
        <Pressable accessibilityRole="button" disabled={dayOffset <= -2} onPress={() => onDateChange(offsetDateKey(selectedDate, -1))}>
          <IconGlyph name="chevron-back" size={14} color={dayOffset <= -2 ? colors.stroke : colors.inactive} />
        </Pressable>
        <Text style={styles.eyebrow}>{breakdownLabel}</Text>
        <Pressable accessibilityRole="button" disabled={dayOffset >= 2} onPress={() => onDateChange(offsetDateKey(selectedDate, 1))}>
          <IconGlyph name="chevron-forward" size={14} color={dayOffset >= 2 ? colors.stroke : colors.inactive} />
        </Pressable>
      </View>

      <View style={styles.taskStack}>
        <DraftCard selected>
          <View style={styles.taskTop}>
            <Dot color={expandedTask.color} />
            <IconGlyph name={expandedTask.icon} size={16} />
            <Text style={styles.taskTitle}>{expandedTask.title}</Text>
            <Text style={styles.statusDone}>{expandedTask.status}</Text>
          </View>
          <View style={styles.miniTrack}>
            <View style={[styles.miniFill, { width: `${expandedTask.progress}%`, backgroundColor: expandedTask.color }]} />
          </View>
          <View style={styles.details}>
            <Text style={styles.detailLine}>Target: <Text style={styles.detailValue}>{expandedTask.target}</Text></Text>
            <Text style={styles.detailLine}>Logged: <Text style={styles.detailValue}>{expandedTask.logged}</Text></Text>
            <Text style={styles.detailLine}>Note: <Text style={styles.detailNote}>{expandedTask.note}</Text></Text>
          </View>
        </DraftCard>

        {compressedTasks.map((task) => (
          <DraftCard key={task.title} dim={task.dim}>
            <View style={styles.taskTop}>
              <Dot color={task.color} />
              <IconGlyph name={task.icon} size={16} />
              <Text style={styles.taskTitle}>{task.title}</Text>
            </View>
            <View style={styles.miniTrack}>
              <View style={[styles.miniFill, { width: `${task.progress}%`, backgroundColor: task.color }]} />
            </View>
          </DraftCard>
        ))}
      </View>

      <DraftButton label="Progress Log" onPress={onOpenLog} style={styles.logButton} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 18
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
  taskStack: {
    gap: 8,
    marginBottom: 16
  },
  taskTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
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
  logButton: {
    marginBottom: 18
  }
});
