import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AppButton } from "../../../shared/components/AppButton";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import type { AppData, Visibility } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onMoveProject: (projectId: string, direction: "up" | "down") => void;
  onSetVisibility: (projectId: string, visibility: Visibility) => void;
  onAddProject: (draft: { title: string; description: string }) => void;
};

const visibilityOptions: Array<{ value: Visibility; label: string }> = [
  { value: "private", label: "Private" },
  { value: "closeFriends", label: "Close friends" },
  { value: "sharedCollaborators", label: "Shared" }
];

export function GoalsScreen({ data, onMoveProject, onSetVisibility, onAddProject }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const sortedProjects = [...data.projects].sort((first, second) => first.priority - second.priority);

  const save = () => {
    onAddProject({ title, description });
    setTitle("");
    setDescription("");
    setIsAdding(false);
  };

  return (
    <Screen>
      <View style={styles.heading}>
        <View style={styles.headingText}>
          <Text style={styles.title}>Goals</Text>
          <Text style={styles.subtitle}>Projects contain tasks and habits. Privacy lives here.</Text>
        </View>
        <AppButton label="New" onPress={() => setIsAdding(true)} style={styles.newButton} />
      </View>

      {sortedProjects.map((project, index) => {
        const itemCount = data.workItems.filter((item) => item.projectId === project.id).length;
        return (
          <View key={project.id} style={styles.card}>
            <View style={styles.projectTop}>
              <View style={[styles.colorRail, { backgroundColor: project.color }]} />
              <View style={styles.projectCopy}>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.description}>{project.description}</Text>
                <Text style={styles.meta}>{itemCount} items - priority {project.priority}</Text>
              </View>
              <View style={styles.moveColumn}>
                <Pressable
                  onPress={() => onMoveProject(project.id, "up")}
                  disabled={index === 0}
                  style={[styles.moveButton, index === 0 && styles.moveDisabled]}
                >
                  <Text style={styles.moveText}>Up</Text>
                </Pressable>
                <Pressable
                  onPress={() => onMoveProject(project.id, "down")}
                  disabled={index === sortedProjects.length - 1}
                  style={[styles.moveButton, index === sortedProjects.length - 1 && styles.moveDisabled]}
                >
                  <Text style={styles.moveText}>Down</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.visibilityRow}>
              {visibilityOptions.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => onSetVisibility(project.id, option.value)}
                  style={[styles.visibility, project.visibility === option.value && styles.visibilityActive]}
                >
                  <Text
                    style={[
                      styles.visibilityText,
                      project.visibility === option.value && styles.visibilityTextActive
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      <Modal visible={isAdding} animationType="slide" transparent onRequestClose={() => setIsAdding(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setIsAdding(false)} />
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>New project</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Project title"
            placeholderTextColor="#948CA2"
            style={styles.input}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Short description"
            placeholderTextColor="#948CA2"
            style={[styles.input, styles.textArea]}
            multiline
          />
          <AppButton label="Create project" onPress={save} />
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16
  },
  headingText: {
    flex: 1
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 5
  },
  newButton: {
    minHeight: 42,
    minWidth: 76
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },
  projectTop: {
    flexDirection: "row",
    gap: 12
  },
  colorRail: {
    width: 8,
    borderRadius: 999
  },
  projectCopy: {
    flex: 1
  },
  projectTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  description: {
    color: colors.inkMuted,
    lineHeight: 20,
    fontWeight: "700",
    marginTop: 5
  },
  meta: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8
  },
  moveColumn: {
    gap: 7
  },
  moveButton: {
    borderRadius: 12,
    backgroundColor: colors.lavender,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  moveDisabled: {
    opacity: 0.35
  },
  moveText: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: "900"
  },
  visibilityRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  visibility: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    borderColor: colors.stroke,
    borderWidth: 1,
    paddingVertical: 9
  },
  visibilityActive: {
    backgroundColor: colors.lavender,
    borderColor: colors.purple
  },
  visibilityText: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  visibilityTextActive: {
    color: colors.purple
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,12,24,0.34)"
  },
  modal: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    gap: 12
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: "900"
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 16,
    color: colors.ink,
    backgroundColor: colors.surface,
    fontWeight: "700"
  },
  textArea: {
    minHeight: 92,
    paddingTop: 14
  }
});
