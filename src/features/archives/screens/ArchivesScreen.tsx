import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onUpdateLogNote: (logId: string, note: string) => void;
};

const logs = [
  { title: "5K run", date: "Monday, 1 June", color: colors.mint, note: true },
  { title: "5K run", date: "Saturday, 30 May", color: colors.mint, note: false },
  { title: "3K run", date: "Thursday, 28 May", color: colors.purple, note: true }
];

export function ArchivesScreen({ data, onUpdateLogNote }: Props) {
  const [folder, setFolder] = useState<"root" | "projects" | "habits" | "runs">("root");

  if (folder === "runs") {
    return <RunsArchive data={data} onUpdateLogNote={onUpdateLogNote} onBack={() => setFolder("habits")} />;
  }

  if (folder === "projects" || folder === "habits") {
    return <CategoryArchive data={data} category={folder} onBack={() => setFolder("root")} onOpenRuns={() => setFolder("runs")} />;
  }

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.heading}>
        <Text style={styles.title}>Archives</Text>
        <Text style={styles.subtitle}>Every past and current project and habit</Text>
      </View>

      <View style={styles.folderStack}>
        <Folder
          icon="briefcase-outline"
          title="Projects"
          meta={`${data.projects.length} projects - 1 completed`}
          onPress={() => setFolder("projects")}
        />
        <Folder
          icon="repeat-outline"
          title="Habits"
          meta="3 habits - 106 total logs"
          onPress={() => setFolder("habits")}
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
  icon: "briefcase-outline" | "repeat-outline";
  title: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
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

function CategoryArchive({ data, category, onBack, onOpenRuns }: {
  data: AppData;
  category: "projects" | "habits";
  onBack: () => void;
  onOpenRuns: () => void;
}) {
  const items = category === "projects"
    ? data.projects.filter((project) => project.goalType !== "habit")
    : data.projects.filter((project) => project.goalType === "habit");

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / {category === "projects" ? "Projects" : "Habits"}</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" onPress={onBack}><IconGlyph name="arrow-back" size={18} color={colors.inkMuted} /></Pressable>
        <IconGlyph name={category === "projects" ? "briefcase-outline" : "repeat-outline"} size={20} />
        <Text style={styles.detailTitle}>{category === "projects" ? "Projects" : "Habits"}</Text>
      </View>
      <View style={styles.logStack}>
        {(items.length ? items : [{ id: "runs", title: category === "habits" ? "Runs" : "Research project", description: "Active goal" }]).map((item) => (
          <Pressable key={item.id} onPress={category === "habits" ? onOpenRuns : undefined}>
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

function RunsArchive({ data, onUpdateLogNote, onBack }: {
  data: AppData;
  onUpdateLogNote: (logId: string, note: string) => void;
  onBack: () => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(data.logs[0]?.id ?? null);
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const archiveLogs = data.logs.length ? data.logs : logs.map((log, index) => ({ id: `preview-${index}`, itemId: "habit-run", date: log.date, status: index === 2 ? "attempted" as const : "done" as const, note: log.note ? "Felt strong on this run." : undefined, createdAt: new Date().toISOString() }));

  return (
    <Screen>
      <DraftStatusBar />
      <Text style={styles.crumb}>Archives / Habits / Runs</Text>
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <IconGlyph name="arrow-back" size={18} color={colors.inkMuted} />
        </Pressable>
        <IconGlyph name="walk-outline" size={20} />
        <View>
          <Text style={styles.detailTitle}>Runs</Text>
          <Text style={styles.detailMeta}>42 logs</Text>
        </View>
      </View>

      <View style={styles.logStack}>
        {archiveLogs.map((log, index) => {
          const expanded = expandedId === log.id;
          const note = draftNotes[log.id] ?? log.note ?? "";
          return <Pressable key={log.id} onPress={() => setExpandedId(expanded ? null : log.id)}>
          <DraftCard selected={expanded}>
            <View style={styles.logTop}>
              <Dot color={log.status === "done" ? colors.mint : colors.purple} />
              <View style={styles.logCopy}>
                <Text style={styles.logTitle}>{index === 2 ? "3K run" : "5K run"}</Text>
                <Text style={styles.logDate}>{log.date}</Text>
              </View>
              <IconGlyph name={log.note ? "document-text-outline" : "document-outline"} size={14} color={log.note ? colors.purple : colors.inactive} />
            </View>
            {expanded && (
              <View style={styles.noteBlock}>
                <Text style={styles.noteLine}>Pace: <Text style={styles.noteValue}>5.2km - 27:40</Text></Text>
                <Text style={styles.noteLabel}>NOTE</Text>
                <TextInput
                  multiline
                  value={note}
                  onChangeText={(value) => setDraftNotes((current) => ({ ...current, [log.id]: value }))}
                  placeholder="Add a note about this run..."
                  placeholderTextColor={colors.inactive}
                  style={styles.noteInput}
                />
                {!log.id.startsWith("preview-") && <DraftButton label="Save note" onPress={() => onUpdateLogNote(log.id, note)} style={styles.saveNote} />}
              </View>
            )}
          </DraftCard>
          </Pressable>;
        })}
      </View>
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
  folderStack: {
    gap: 12
  },
  folder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 20
  },
  folderCopy: {
    flex: 1
  },
  folderTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: "900"
  },
  folderMeta: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  crumb: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600",
    marginBottom: 10
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  detailTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  detailMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600"
  },
  logStack: {
    gap: 8
  },
  logTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  logCopy: {
    flex: 1
  },
  logTitle: {
    color: colors.ink,
    fontSize: 14.5,
    fontWeight: "900"
  },
  logDate: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600",
    marginTop: 2
  },
  noteBlock: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.stroke
  },
  noteLine: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6
  },
  noteValue: {
    color: colors.ink,
    fontWeight: "900"
  },
  noteLabel: {
    color: colors.inkMuted,
    fontSize: 10.5,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 6
  },
  noteInput: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "600"
  },
  saveNote: {
    alignSelf: "flex-start",
    marginTop: 8
  }
});
