import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import {
  Badge,
  Dot,
  DraftButton,
  DraftCard,
  DraftStatusBar,
  IconGlyph
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import { styles } from "./ArchivesScreen.styles";
import { logsForItem } from "../../../domain/selectors/progress";
import { displayDate } from "../../../shared/utils/dates";
import type { AppData, Project, WorkItem } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onUpdateLogNote: (logId: string, note: string) => void;
  onUpdateReflection: (reflectionId: string, text: string) => void;
  onDeleteReflection: (reflectionId: string) => void;
};

export function ArchivesScreen({ data, onUpdateLogNote, onUpdateReflection, onDeleteReflection }: Props) {
  const [folder, setFolder] = useState<"root" | "projects" | "habits" | "reflections" | "item" | "project">("root");
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const habitIds = data.workItems.filter((item) => item.kind === "habit").map((item) => item.id);
  const habitLogCount = data.logs.filter((entry) => habitIds.includes(entry.itemId)).length;

  if (folder === "item") {
    const habit = data.workItems.find((item) => item.id === selectedHabitId);
    return <HabitArchive data={data} habit={habit} onUpdateLogNote={onUpdateLogNote} onBack={() => setFolder("habits")} />;
  }

  if (folder === "project") {
    const project = data.projects.find((item) => item.id === selectedProjectId);
    return <ProjectArchive project={project} onBack={() => setFolder("projects")} />;
  }

  if (folder === "reflections") {
    return <ReflectionsArchive data={data} onUpdateReflection={onUpdateReflection} onDeleteReflection={onDeleteReflection} onBack={() => setFolder("root")} />;
  }

  if (folder === "projects" || folder === "habits") {
    return <CategoryArchive
      data={data}
      category={folder}
      onBack={() => setFolder("root")}
      onOpenHabit={(itemId) => { setSelectedHabitId(itemId); setFolder("item"); }}
      onOpenProject={(projectId) => { setSelectedProjectId(projectId); setFolder("project"); }}
    />;
  }

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.heading}>
        <Text style={styles.title}>Archives</Text>
        <Text style={styles.subtitle}>Your goals, logs, and private reflections</Text>
      </View>

      <View style={styles.folderStack}>
        <Folder
          icon="briefcase-outline"
          title="Projects"
          meta={`${data.projects.filter((project) => project.goalType !== "habit").length} projects`}
          onPress={() => setFolder("projects")}
        />
        <Folder
          icon="repeat-outline"
          title="Habits"
          meta={`${habitIds.length} habits - ${habitLogCount} total logs`}
          onPress={() => setFolder("habits")}
        />
        <Folder
          icon="create-outline"
          title="Reflections"
          meta={`${data.reflections.length} private entries`}
          onPress={() => setFolder("reflections")}
        />
      </View>
    </Screen>
  );
}

function Folder({
  icon,
  title,
  meta,
  onPress
}: {
  icon: "briefcase-outline" | "repeat-outline" | "create-outline";
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}, ${meta}`} onPress={onPress}>
      <DraftCard style={styles.folder}>
        <IconGlyph name={icon} size={26} />
        <View style={styles.folderCopy}>
          <Text style={styles.folderTitle}>{title}</Text>
          <Text style={styles.folderMeta}>{meta}</Text>
        </View>
        <IconGlyph name="chevron-forward" size={17} color={colors.inactive} />
      </DraftCard>
    </Pressable>
  );
}

function ReflectionsArchive({ data, onUpdateReflection, onDeleteReflection, onBack }: {
  data: AppData;
  onUpdateReflection: (reflectionId: string, text: string) => void;
  onDeleteReflection: (reflectionId: string) => void;
  onBack: () => void;
}) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState("");

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / Reflections</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to archives" onPress={onBack} style={styles.iconButton}><IconGlyph name="arrow-back" size={18} color={colors.inkMuted} /></Pressable>
        <IconGlyph name="create-outline" size={20} />
        <Text style={styles.detailTitle}>Private reflections</Text>
      </View>
      <Text style={styles.archiveHelp}>Reflections are private. Delete removes one permanently after confirmation.</Text>
      <View style={styles.logStack}>
        {data.reflections.length === 0 && <DraftCard><Text style={styles.emptyText}>No reflections saved yet.</Text></DraftCard>}
        {data.reflections.map((reflection) => {
          const traitNames = reflection.traits.map((traitId) => data.traitOptions.find((trait) => trait.id === traitId)?.name ?? traitId);
          return (
            <DraftCard key={reflection.id}>
              <View style={styles.reflectionTop}>
                <View style={styles.logCopy}>
                  <Text style={styles.logDate}>{displayDate(reflection.date)}</Text>
                  {editingId === reflection.id ? (
                    <>
                      <TextInput accessibilityLabel="Reflection text" multiline value={draftText} onChangeText={setDraftText} style={styles.reflectionInput} />
                      <View style={styles.reflectionEditActions}>
                        <Pressable accessibilityRole="button" onPress={() => setEditingId(null)} style={styles.reflectionCancel}><Text style={styles.reflectionCancelText}>Cancel</Text></Pressable>
                        <Pressable accessibilityRole="button" accessibilityState={{ disabled: !draftText.trim() }} disabled={!draftText.trim()} onPress={() => { onUpdateReflection(reflection.id, draftText); setEditingId(null); }} style={styles.reflectionSave}><Text style={styles.reflectionSaveText}>Save</Text></Pressable>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={styles.reflectionText}>{reflection.text}</Text>
                      <Pressable accessibilityRole="button" accessibilityLabel={`Edit reflection from ${displayDate(reflection.date)}`} onPress={() => { setEditingId(reflection.id); setDraftText(reflection.text); setDeleteCandidateId(null); }} style={styles.reflectionEdit}><IconGlyph name="create-outline" size={13} color={colors.purple} /><Text style={styles.reflectionEditText}>Edit reflection</Text></Pressable>
                    </>
                  )}
                  {traitNames.length > 0 && <Text style={styles.reflectionTraits}>{traitNames.join(" - ")}</Text>}
                </View>
                {deleteCandidateId === reflection.id ? (
                  <View style={styles.reflectionDeleteActions}>
                    <Pressable accessibilityRole="button" accessibilityLabel="Cancel deleting reflection" onPress={() => setDeleteCandidateId(null)} style={styles.reflectionCancel}><Text style={styles.reflectionCancelText}>Cancel</Text></Pressable>
                    <Pressable accessibilityRole="button" accessibilityLabel={`Confirm delete reflection from ${displayDate(reflection.date)}`} onPress={() => { onDeleteReflection(reflection.id); setDeleteCandidateId(null); }} style={styles.reflectionDelete}><Text style={styles.reflectionDeleteText}>Delete</Text></Pressable>
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" accessibilityLabel={`Delete reflection from ${displayDate(reflection.date)}`} onPress={() => setDeleteCandidateId(reflection.id)} style={styles.iconButton}>
                    <IconGlyph name="trash-outline" size={17} color="#F87171" />
                  </Pressable>
                )}
              </View>
            </DraftCard>
          );
        })}
      </View>
    </Screen>
  );
}

function CategoryArchive({ data, category, onBack, onOpenHabit, onOpenProject }: {
  data: AppData;
  category: "projects" | "habits";
  onBack: () => void;
  onOpenHabit: (itemId: string) => void;
  onOpenProject: (projectId: string) => void;
}) {
  const items: Array<{ id: string; title: string; description: string }> = category === "projects"
    ? data.projects.filter((project) => project.goalType !== "habit").map((project) => ({ id: project.id, title: project.title, description: project.description }))
    : data.workItems.filter((item) => item.kind === "habit").map((item) => {
      const count = data.logs.filter((entry) => entry.itemId === item.id).length;
      return { id: item.id, title: item.title, description: `${count} logs` };
    });

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / {category === "projects" ? "Projects" : "Habits"}</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to archives" onPress={onBack} style={styles.iconButton}><IconGlyph name="arrow-back" size={18} color={colors.inkMuted} /></Pressable>
        <IconGlyph name={category === "projects" ? "briefcase-outline" : "repeat-outline"} size={20} />
        <Text style={styles.detailTitle}>{category === "projects" ? "Projects" : "Habits"}</Text>
      </View>
      <View style={styles.logStack}>
        {items.length === 0 && <DraftCard><Text style={styles.emptyText}>Nothing archived in this category yet.</Text></DraftCard>}
        {items.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Open ${item.title}, ${item.description}`} onPress={() => category === "habits" ? onOpenHabit(item.id) : onOpenProject(item.id)}>
            <DraftCard>
              <View style={styles.logTop}>
                <IconGlyph name={category === "projects" ? "flag-outline" : "walk-outline"} />
                <View style={styles.logCopy}><Text style={styles.logTitle}>{item.title}</Text><Text style={styles.logDate}>{item.description}</Text></View>
                <Badge label={category === "projects" ? "ACTIVE" : "ONGOING"} />
                <IconGlyph name="chevron-forward" size={15} color={colors.inactive} />
              </View>
            </DraftCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

function HabitArchive({ data, habit, onUpdateLogNote, onBack }: {
  data: AppData;
  habit?: WorkItem;
  onUpdateLogNote: (logId: string, note: string) => void;
  onBack: () => void;
}) {
  const archiveLogs = habit ? logsForItem(data, habit.id) : [];
  const [expandedId, setExpandedId] = useState<string | null>(archiveLogs[0]?.id ?? null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / Habits / {habit?.title ?? "Item"}</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to habits" onPress={onBack} style={styles.iconButton}>
          <IconGlyph name="arrow-back" size={18} color={colors.inkMuted} />
        </Pressable>
        <IconGlyph name="walk-outline" size={20} />
        <View>
          <Text style={styles.detailTitle}>{habit?.title ?? "Habit"}</Text>
          <Text style={styles.detailMeta}>{archiveLogs.length} logs</Text>
        </View>
      </View>

      <View style={styles.logStack}>
        {archiveLogs.length === 0 && <DraftCard><Text style={styles.emptyText}>No logs recorded for this habit yet.</Text></DraftCard>}
        {archiveLogs.map((log, index) => {
          const expanded = expandedId === log.id;
          const note = draftNotes[log.id] ?? log.note ?? "";
          return <DraftCard key={log.id} selected={expanded}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${expanded ? "Collapse" : "Open"} ${habit?.title ?? "habit"} log from ${log.date}`} onPress={() => setExpandedId(expanded ? null : log.id)}>
              <View style={styles.logTop}>
                <Dot color={log.status === "done" ? colors.mint : colors.purple} />
                <View style={styles.logCopy}>
                  <Text style={styles.logTitle}>{habit?.title ?? "Habit log"}</Text>
                  <Text style={styles.logDate}>{log.date}</Text>
                </View>
                <IconGlyph name={log.note ? "document-text-outline" : "document-outline"} size={14} color={log.note ? colors.purple : colors.inactive} />
              </View>
            </Pressable>
            {expanded && (
              <View style={styles.noteBlock}>
                <Text style={styles.noteLine}>Status: <Text style={styles.noteValue}>{log.status}</Text></Text>
                <Text style={styles.noteLabel}>NOTE</Text>
                <TextInput
                  multiline
                  value={note}
                  onChangeText={(value) => { setDraftNotes((current) => ({ ...current, [log.id]: value })); setSavedId(null); }}
                  placeholder="Add a note about this entry..."
                  placeholderTextColor={colors.inactive}
                  style={styles.noteInput}
                />
                <DraftButton label={savedId === log.id ? "Saved" : "Save note"} onPress={() => { onUpdateLogNote(log.id, note); setSavedId(log.id); }} style={styles.saveNote} />
              </View>
            )}
          </DraftCard>;
        })}
      </View>
    </Screen>
  );
}

function ProjectArchive({ project, onBack }: { project?: Project; onBack: () => void }) {
  const milestones = project?.milestones ?? [];

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / Projects / {project?.title ?? "Project"}</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to projects" onPress={onBack} style={styles.iconButton}><IconGlyph name="arrow-back" size={18} color={colors.inkMuted} /></Pressable>
        <IconGlyph name="flag-outline" size={20} />
        <View><Text style={styles.detailTitle}>{project?.title ?? "Project"}</Text><Text style={styles.detailMeta}>{milestones.length} milestones</Text></View>
      </View>
      <View style={styles.logStack}>
        {milestones.length === 0 && <DraftCard><Text style={styles.emptyText}>No milestones recorded for this project yet.</Text></DraftCard>}
        {milestones.map((milestone) => <DraftCard key={milestone.id} dim={milestone.completedAt ? 1 : 0.55}>
          <View style={styles.logTop}><Dot color={milestone.completedAt ? colors.mint : colors.inactive} /><View style={styles.logCopy}><Text style={styles.logTitle}>{milestone.title}</Text><Text style={styles.logDate}>{milestone.completedAt ?? milestone.timing}</Text></View></View>
        </DraftCard>)}
      </View>
    </Screen>
  );
}
