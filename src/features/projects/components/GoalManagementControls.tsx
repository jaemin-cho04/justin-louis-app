import { Pressable, StyleSheet, Text, View } from "react-native";

import { IconGlyph } from "../../../shared/components/DraftUI";
import { colors } from "../../../shared/theme/colors";
import type { Project, Visibility } from "../../../domain/model/types";

type Props = {
  project: Project;
  index: number;
  total: number;
  onMove: (projectId: string, direction: "up" | "down") => void;
  onSetVisibility: (projectId: string, visibility: Visibility) => void;
};

export function GoalManagementControls({ project, index, total, onMove, onSetVisibility }: Props) {
  const cannotMoveUp = index <= 0;
  const cannotMoveDown = index < 0 || index >= total - 1;

  return (
    <>
      <Text style={styles.label}>WHO CAN SEE THIS</Text>
      <View style={styles.visibilityRow}>
        {(["private", "closeFriends", "sharedCollaborators"] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{ selected: project.visibility === value }}
            onPress={() => onSetVisibility(project.id, value)}
            style={[styles.visibilityButton, project.visibility === value && styles.visibilityActive]}
          >
            <Text style={[styles.controlText, project.visibility === value && styles.activeText]}>{visibilityLabel(value)}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>PRIORITY</Text>
      <View style={styles.priorityRow}>
        <PriorityButton label="Move up" icon="arrow-up" disabled={cannotMoveUp} onPress={() => onMove(project.id, "up")} />
        <PriorityButton label="Move down" icon="arrow-down" disabled={cannotMoveDown} onPress={() => onMove(project.id, "down")} />
      </View>
    </>
  );
}

function PriorityButton({ label, icon, disabled, onPress }: {
  label: string;
  icon: "arrow-up" | "arrow-down";
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.priorityButton, disabled && styles.disabled]}
    >
      <IconGlyph name={icon} size={15} color={colors.purple} />
      <Text style={styles.controlText}>{label}</Text>
    </Pressable>
  );
}

export function visibilityLabel(visibility: Visibility): string {
  return ({ private: "Only me", closeFriends: "Close friends", sharedCollaborators: "Collaborators" })[visibility];
}

const styles = StyleSheet.create({
  label: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 10
  },
  visibilityRow: { flexDirection: "row", gap: 6 },
  visibilityButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  visibilityActive: { borderColor: colors.purple, backgroundColor: colors.surface },
  activeText: { color: colors.purple },
  priorityRow: { flexDirection: "row", gap: 8 },
  priorityButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7
  },
  controlText: { color: colors.inkMuted, fontSize: 12, fontWeight: "800" },
  disabled: { opacity: 0.35 }
});
