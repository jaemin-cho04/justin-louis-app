import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import {
  Badge,
  DraftButton,
  DraftCard,
  DraftStatusBar,
  IconGlyph
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import type { AppData, Milestone, Visibility } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onMoveProject: (projectId: string, direction: "up" | "down") => void;
  onSetVisibility: (projectId: string, visibility: Visibility) => void;
  onAddProject: (draft: {
    title: string;
    description: string;
    goalType: "habit" | "project";
    cadence?: "Daily" | "Weekly" | "Monthly";
    tracking?: string;
    target?: string;
    duration?: string;
    milestones?: Array<Omit<Milestone, "id">>;
  }) => void;
};

type GoalType = "habit" | "project";
type MilestoneDraft = { title: string; timing: string };

export function GoalsScreen({ data, onAddProject }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("project");
  const [cadence, setCadence] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [tracking, setTracking] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "", timing: "Week 1" }
  ]);

  const goals = [...data.projects].sort((a, b) => a.priority - b.priority);
  const habitCount = goals.filter((goal) => goal.goalType === "habit").length;
  const projectCount = goals.length - habitCount;

  const createDraftGoal = () => {
    if (!title.trim()) return;

    onAddProject({
      title,
      description: goalType === "habit" ? `${cadence} - ${tracking || "habit"}` : `${duration || "Project"} - ${milestones.length} milestones`,
      goalType,
      cadence: goalType === "habit" ? cadence : undefined,
      tracking: goalType === "habit" ? tracking : undefined,
      target: goalType === "habit" ? target : undefined,
      duration: goalType === "project" ? duration : undefined,
      milestones: goalType === "project"
        ? milestones.filter((item) => item.title.trim()).map((item) => ({ ...item }))
        : undefined
    });
    setIsAdding(false);
    setTitle("");
    setGoalType("project");
    setDuration("");
    setMilestones([{ title: "", timing: "Week 1" }]);
  };

  const updateMilestone = (index: number, field: keyof MilestoneDraft, value: string) => {
    setMilestones((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>{habitCount} habits - {projectCount} projects</Text>
        </View>
        <DraftButton label="New goal" icon="add" onPress={() => setIsAdding(true)} />
      </View>

      <View style={styles.list}>
        {goals.map((goal) => {
          const isHabit = goal.goalType === "habit";
          const completed = goal.milestones?.filter((item) => item.completedAt).length ?? 0;
          const total = goal.milestones?.length ?? 0;
          const progress = total ? (completed / total) * 100 : 0;
          const meta = isHabit
            ? `${goal.cadence ?? "Daily"} - ${goal.tracking ?? goal.description}`
            : `${goal.duration ?? goal.termLabel ?? "Project"} - ${completed} of ${total} milestones`;

          return <DraftCard key={goal.id}>
            <View style={styles.rowTop}>
              <IconGlyph name={isHabit ? "repeat-outline" : "flag-outline"} />
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{goal.title}</Text>
                <Text style={styles.rowMeta}>{meta}</Text>
              </View>
              <Badge label={isHabit ? "HABIT" : "PROJECT"} />
              <IconGlyph name="reorder-three-outline" size={15} color={colors.inactive} />
            </View>
            {!isHabit && (
              <View style={styles.projectTrack}>
                <View style={[styles.projectFill, { width: `${progress}%` }]} />
              </View>
            )}
          </DraftCard>;
        })}
      </View>

      <Modal visible={isAdding} animationType="slide" transparent onRequestClose={() => setIsAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setIsAdding(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeader}>
            <Pressable accessibilityRole="button" onPress={() => setIsAdding(false)}>
              <IconGlyph name="close" size={18} color={colors.inkMuted} />
            </Pressable>
            <Text style={styles.sheetTitle}>New goal</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Label text="TITLE" />
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Research project" placeholderTextColor={colors.inactive} style={styles.input} />

          <Label text="TYPE" />
          <View style={styles.typeRow}>
            <Pressable onPress={() => setGoalType("habit")} style={[styles.typeButton, goalType === "habit" && styles.typeActive]}>
              <Text style={goalType === "habit" ? styles.typeActiveText : styles.typeMuted}>Habit - repeats</Text>
            </Pressable>
            <Pressable onPress={() => setGoalType("project")} style={[styles.typeButton, goalType === "project" && styles.typeActive]}>
              <Text style={goalType === "project" ? styles.typeActiveText : styles.typeMuted}>Project - has an end</Text>
            </Pressable>
          </View>

          {goalType === "habit" ? (
            <>
              <Label text="HOW OFTEN" />
              <View style={styles.typeRow}>
                {(["Daily", "Weekly", "Monthly"] as const).map((value) => (
                  <Pressable key={value} onPress={() => setCadence(value)} style={[styles.cadenceButton, cadence === value && styles.cadenceActive]}>
                    <Text style={[styles.typeMuted, cadence === value && styles.cadenceActiveText]}>{value}</Text>
                  </Pressable>
                ))}
              </View>
              <Label text="WHAT YOU'RE TRACKING" />
              <TextInput value={tracking} onChangeText={setTracking} placeholder="e.g. distance, hours, pages" placeholderTextColor={colors.inactive} style={styles.input} />
              <Label text="TARGET" />
              <TextInput value={target} onChangeText={setTarget} placeholder="e.g. 5km or 2 hours" placeholderTextColor={colors.inactive} style={styles.input} />
            </>
          ) : (
            <>
              <Label text="DURATION" />
              <TextInput value={duration} onChangeText={setDuration} placeholder="e.g. 6 weeks" placeholderTextColor={colors.inactive} style={styles.input} />
              <Label text="MILESTONES" />
              {milestones.map((milestone, index) => (
                <View key={index} style={styles.milestone}>
                  <View style={styles.emptyCircle} />
                  <TextInput value={milestone.title} onChangeText={(value) => updateMilestone(index, "title", value)} placeholder="Milestone name" placeholderTextColor={colors.inactive} style={[styles.input, styles.milestoneTitle]} />
                  <TextInput value={milestone.timing} onChangeText={(value) => updateMilestone(index, "timing", value)} style={[styles.input, styles.weekInput]} />
                  <Pressable accessibilityLabel="Remove milestone" onPress={() => setMilestones((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <IconGlyph name="close" size={14} color={colors.inactive} />
                  </Pressable>
                </View>
              ))}
              <DraftButton label="Add milestone" icon="add" onPress={() => setMilestones((current) => [...current, { title: "", timing: `Week ${current.length + 1}` }])} style={styles.dashed} />
            </>
          )}
          <DraftButton label="Create goal" primary onPress={createDraftGoal} style={styles.createButton} />
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
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
  list: {
    gap: 10,
    marginBottom: 20
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  copy: {
    flex: 1
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  rowMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2
  },
  projectTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.stroke,
    overflow: "hidden",
    marginLeft: 27,
    marginTop: 10
  },
  projectFill: {
    height: "100%",
    backgroundColor: colors.mint
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)"
  },
  modal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceSoft,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 18,
    paddingBottom: 26
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  sheetTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  headerSpacer: {
    width: 18
  },
  label: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    minHeight: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: "700"
  },
  typeRow: {
    flexDirection: "row",
    gap: 8
  },
  typeButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333338",
    alignItems: "center",
    justifyContent: "center"
  },
  typeActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple
  },
  typeMuted: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  typeActiveText: {
    color: colors.surfaceSoft,
    fontSize: 12,
    fontWeight: "900"
  },
  cadenceButton: {
    flex: 1,
    minHeight: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#333338",
    alignItems: "center",
    justifyContent: "center"
  },
  cadenceActive: {
    backgroundColor: colors.surface,
    borderColor: colors.purple
  },
  cadenceActiveText: {
    color: colors.purple
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6
  },
  emptyCircle: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.inactive
  },
  milestoneTitle: {
    flex: 1,
    minHeight: 35,
    fontSize: 12
  },
  weekInput: {
    width: 62,
    minHeight: 35,
    textAlign: "center",
    fontSize: 11,
    paddingHorizontal: 4
  },
  dashed: {
    borderStyle: "dashed",
    marginTop: 2
  },
  createButton: {
    marginTop: 10
  }
});
