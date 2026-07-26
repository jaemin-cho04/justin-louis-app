import { useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import {
  Badge,
  DraftButton,
  DraftCard,
  DraftStatusBar,
  IconGlyph
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import { styles } from "./GoalsScreen.styles";
import { GoalManagementControls, visibilityLabel } from "../components/GoalManagementControls";
import type { AppData, Milestone, Project, Visibility } from "../../../domain/model/types";
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
  onUpdateProject: (projectId: string, draft: Parameters<Props["onAddProject"]>[0]) => void | Promise<void>;
  onDeleteProject: (projectId: string) => void | Promise<void>;
  onCreateCollaborationInvite?: (project: Project) => Promise<string>;
  collaborators?: Array<{ projectId: string; userId: string; role: "viewer" | "editor"; profile: { displayName: string; handle: string }; action: "remove" | "leave" }>;
  collaborationInvites?: Array<{ id: string; code: string; projectId?: string; expiresAt: string }>;
  onRemoveCollaborator?: (projectId: string, userId: string) => Promise<void>;
  onRevokeCollaborationInvite?: (inviteId: string) => Promise<void>;
};
type GoalType = "habit" | "project";
type MilestoneDraft = { title: string; timing: string; completedAt?: string };

export function GoalsScreen({ data, onMoveProject, onSetVisibility, onAddProject, onUpdateProject, onDeleteProject, onCreateCollaborationInvite, collaborators = [], collaborationInvites = [], onRemoveCollaborator, onRevokeCollaborationInvite }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("project");
  const [cadence, setCadence] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [tracking, setTracking] = useState("");
  const [target, setTarget] = useState("");
  const [duration, setDuration] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([
    { title: "", timing: "Week 1" }
  ]);
  const [validationError, setValidationError] = useState("");
  const [collaborationCode, setCollaborationCode] = useState("");

  const goals = [...data.projects].sort((a, b) => a.priority - b.priority);
  const editingGoal = goals.find((goal) => goal.id === editingId);
  const editingIndex = goals.findIndex((goal) => goal.id === editingId);
  const habitCount = goals.filter((goal) => goal.goalType === "habit").length;
  const projectCount = goals.length - habitCount;

  const saveGoal = async () => {
    if (!title.trim()) {
      setValidationError("Enter a title before creating this goal.");
      return;
    }

    const validMilestones = milestones.filter((item) => item.title.trim());
    const draft = {
      title,
      description: goalType === "habit" ? `${cadence} - ${tracking || "habit"}` : `${duration || "Project"} - ${validMilestones.length} milestones`,
      goalType,
      cadence: goalType === "habit" ? cadence : undefined,
      tracking: goalType === "habit" ? tracking : undefined,
      target: goalType === "habit" ? target : undefined,
      duration: goalType === "project" ? duration : undefined,
      milestones: goalType === "project"
        ? validMilestones.map((item) => ({ ...item }))
        : undefined
    };

    try {
      if (editingId) await onUpdateProject(editingId, draft);
      else onAddProject(draft);
    } catch (cause) {
      setValidationError(cause instanceof Error ? cause.message : "Could not save the goal.");
      return;
    }

    setIsAdding(false);
    setEditingId(null);
    setTitle("");
    setValidationError("");
    setCollaborationCode("");
    setGoalType("project");
    setDuration("");
    setMilestones([{ title: "", timing: "Week 1" }]);
  };

  const openNewGoal = () => {
    setEditingId(null);
    setConfirmDelete(false);
    setTitle("");
    setGoalType("project");
    setCadence("Daily");
    setTracking("");
    setTarget("");
    setDuration("");
    setMilestones([{ title: "", timing: "Week 1" }]);
    setValidationError("");
    setCollaborationCode("");
    setIsAdding(true);
  };

  const openEditGoal = (goal: Project) => {
    setEditingId(goal.id);
    setConfirmDelete(false);
    setTitle(goal.title);
    setGoalType(goal.goalType ?? "project");
    setCadence(goal.cadence ?? "Daily");
    setTracking(goal.tracking ?? "");
    setTarget(goal.target ?? "");
    setDuration(goal.duration ?? "");
    setMilestones(goal.milestones?.map((item) => ({ title: item.title, timing: item.timing, completedAt: item.completedAt })) ?? [{ title: "", timing: "Week 1" }]);
    setValidationError("");
    setIsAdding(true);
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
        <DraftButton label="New goal" icon="add" onPress={openNewGoal} />
      </View>
      <Text style={styles.editHelp}>Tap a goal to edit its details, milestones, or sharing.</Text>

      <View style={styles.list}>
        {goals.map((goal) => {
          const isHabit = goal.goalType === "habit";
          const completed = goal.milestones?.filter((item) => item.completedAt).length ?? 0;
          const total = goal.milestones?.length ?? 0;
          const progress = total ? (completed / total) * 100 : 0;
          const meta = isHabit
            ? `${goal.cadence ?? "Daily"} · ${goal.tracking ?? goal.description} · ${visibilityLabel(goal.visibility)}`
            : `${goal.duration ?? goal.termLabel ?? "Project"} · ${completed}/${total} milestones · ${visibilityLabel(goal.visibility)}`;

          return <Pressable key={goal.id} accessibilityRole="button" accessibilityLabel={`Edit ${goal.title}`} onPress={() => openEditGoal(goal)}>
          <DraftCard>
            <View style={styles.rowTop}>
              <IconGlyph name={isHabit ? "repeat-outline" : "flag-outline"} />
              <View style={styles.copy}>
                <Text style={styles.rowTitle}>{goal.title}</Text>
                <Text style={styles.rowMeta}>{meta}</Text>
              </View>
              <Badge label={isHabit ? "HABIT" : "PROJECT"} />
            </View>
            {!isHabit && (
              <View style={styles.projectTrack}>
                <View style={[styles.projectFill, { width: `${progress}%` }]} />
              </View>
            )}
          </DraftCard>
          </Pressable>;
        })}
      </View>

      <Modal visible={isAdding} animationType="slide" transparent onRequestClose={() => setIsAdding(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close new goal" style={styles.backdrop} onPress={() => setIsAdding(false)} />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modal}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.sheetHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Close new goal" onPress={() => setIsAdding(false)} style={styles.closeButton}>
              <IconGlyph name="close" size={18} color={colors.inkMuted} />
            </Pressable>
            <Text style={styles.sheetTitle}>{editingId ? "Edit goal" : "New goal"}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Label text="TITLE" />
          <TextInput accessibilityLabel="Goal title" value={title} onChangeText={(value) => { setTitle(value); if (validationError) setValidationError(""); }} placeholder="e.g. Research project" placeholderTextColor={colors.inactive} style={styles.input} />
          {!!validationError && <Text accessibilityRole="alert" style={styles.errorText}>{validationError}</Text>}

          <Label text="TYPE" />
          <View style={styles.typeRow}>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: goalType === "habit" }} onPress={() => setGoalType("habit")} style={[styles.typeButton, goalType === "habit" && styles.typeActive]}>
              <Text style={goalType === "habit" ? styles.typeActiveText : styles.typeMuted}>Habit - repeats</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityState={{ selected: goalType === "project" }} onPress={() => setGoalType("project")} style={[styles.typeButton, goalType === "project" && styles.typeActive]}>
              <Text style={goalType === "project" ? styles.typeActiveText : styles.typeMuted}>Project - has an end</Text>
            </Pressable>
          </View>

          {editingGoal && (
            <GoalManagementControls
              project={editingGoal}
              index={editingIndex}
              total={goals.length}
              onMove={onMoveProject}
              onSetVisibility={onSetVisibility}
            />
          )}

          {goalType === "habit" ? (
            <>
              <Label text="HOW OFTEN" />
              <View style={styles.typeRow}>
                {(["Daily", "Weekly", "Monthly"] as const).map((value) => (
                  <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: cadence === value }} onPress={() => setCadence(value)} style={[styles.cadenceButton, cadence === value && styles.cadenceActive]}>
                    <Text style={[styles.typeMuted, cadence === value && styles.cadenceActiveText]}>{value}</Text>
                  </Pressable>
                ))}
              </View>
              <Label text="WHAT YOU'RE TRACKING" />
              <TextInput accessibilityLabel="Tracking unit" value={tracking} onChangeText={setTracking} placeholder="e.g. distance, hours, pages" placeholderTextColor={colors.inactive} style={styles.input} />
              <Label text="TARGET" />
              <TextInput accessibilityLabel="Habit target" value={target} onChangeText={setTarget} placeholder="e.g. 5km or 2 hours" placeholderTextColor={colors.inactive} style={styles.input} />
            </>
          ) : (
            <>
              <Label text="DURATION" />
              <TextInput accessibilityLabel="Project duration" value={duration} onChangeText={setDuration} placeholder="e.g. 6 weeks" placeholderTextColor={colors.inactive} style={styles.input} />
              <Label text="MILESTONES" />
              {milestones.map((milestone, index) => (
                <View key={index} style={styles.milestone}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Milestone ${index + 1} complete`}
                    accessibilityState={{ selected: Boolean(milestone.completedAt) }}
                    onPress={() => updateMilestone(index, "completedAt", milestone.completedAt ? "" : new Date().toISOString())}
                    style={[styles.milestoneCheck, milestone.completedAt && styles.milestoneCheckDone]}
                  >
                    {milestone.completedAt && <IconGlyph name="checkmark" size={16} color={colors.surfaceSoft} />}
                  </Pressable>
                  <TextInput accessibilityLabel={`Milestone ${index + 1} name`} value={milestone.title} onChangeText={(value) => updateMilestone(index, "title", value)} placeholder="Milestone name" placeholderTextColor={colors.inactive} style={[styles.input, styles.milestoneTitle]} />
                  <TextInput accessibilityLabel={`Milestone ${index + 1} timing`} value={milestone.timing} onChangeText={(value) => updateMilestone(index, "timing", value)} style={[styles.input, styles.weekInput]} />
                  <Pressable accessibilityRole="button" accessibilityLabel="Remove milestone" onPress={() => setMilestones((current) => current.filter((_, itemIndex) => itemIndex !== index))} style={styles.removeMilestone}>
                    <IconGlyph name="close" size={14} color={colors.inactive} />
                  </Pressable>
                </View>
              ))}
              <DraftButton label="Add milestone" icon="add" onPress={() => setMilestones((current) => [...current, { title: "", timing: `Week ${current.length + 1}` }])} style={styles.dashed} />
            </>
          )}
          <DraftButton label={editingId ? "Save changes" : "Create goal"} primary onPress={() => { void saveGoal(); }} style={styles.createButton} />
          {editingGoal && onCreateCollaborationInvite && <>
            <DraftButton label={collaborationCode ? `Collaborator invite: ${collaborationCode}` : "Invite a collaborator"} onPress={() => {
              void onCreateCollaborationInvite(editingGoal).then(setCollaborationCode).catch((cause) => setValidationError(cause instanceof Error ? cause.message : "Could not create the invite."));
            }} style={styles.deleteButton} />
            <Text style={styles.inviteHelp}>Anyone with this private code can join this goal as an editor for seven days.</Text>
            {collaborationInvites.filter((invite) => invite.projectId === editingGoal.id).map((invite) => <View key={invite.id} style={styles.collaboratorRow}>
              <View style={styles.copy}><Text style={styles.rowTitle}>Invite {invite.code}</Text><Text style={styles.rowMeta}>Expires {new Date(invite.expiresAt).toLocaleDateString()}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Revoke collaborator invite ${invite.code}`} style={styles.removeMilestone} onPress={() => {
                if (onRevokeCollaborationInvite) void onRevokeCollaborationInvite(invite.id).catch((cause) => setValidationError(cause instanceof Error ? cause.message : "Could not revoke the invite."));
              }}><IconGlyph name="close" size={14} color={colors.coral} /></Pressable>
            </View>)}
            {collaborators.filter((member) => member.projectId === editingGoal.id).map((member) => <View key={member.userId} style={styles.collaboratorRow}>
              <View style={styles.copy}><Text style={styles.rowTitle}>{member.profile.displayName}</Text><Text style={styles.rowMeta}>{member.profile.handle} · {member.role}</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel={member.action === "leave" ? `Leave collaboration with ${member.profile.displayName}` : `Remove collaborator ${member.profile.displayName}`} style={styles.removeMilestone} onPress={() => {
                if (onRemoveCollaborator) void onRemoveCollaborator(editingGoal.id, member.userId).catch((cause) => setValidationError(cause instanceof Error ? cause.message : "Could not update collaborators."));
              }}><IconGlyph name={member.action === "leave" ? "exit-outline" : "trash-outline"} size={14} color={colors.coral} /></Pressable>
            </View>)}
          </>}
          {editingId && (!confirmDelete ? (
            <DraftButton label="Delete goal" onPress={() => setConfirmDelete(true)} style={styles.deleteButton} />
          ) : (
            <View style={styles.deleteConfirm}>
              <Text style={styles.deleteWarning}>Delete this goal and all of its schedules, logs, and linked reflections?</Text>
              <View style={styles.deleteActions}>
                <DraftButton label="Cancel" onPress={() => setConfirmDelete(false)} style={styles.deleteAction} />
                <Pressable accessibilityRole="button" style={[styles.deleteAction, styles.deleteDanger]} onPress={() => {
                  void Promise.resolve(onDeleteProject(editingId)).then(() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setConfirmDelete(false);
                  }).catch((cause) => setValidationError(cause instanceof Error ? cause.message : "Could not delete the goal."));
                }}><Text style={styles.deleteDangerText}>Delete permanently</Text></Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </Screen>
  );
}

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}
