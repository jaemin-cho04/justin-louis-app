import { Pressable, StyleSheet, Text, View } from "react-native";

import { reactionCopy } from "../../../domain/fixtures/seed";
import { AppButton } from "../../../shared/components/AppButton";
import { ProgressBar } from "../../../shared/components/ProgressBar";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onAddFriend: () => void;
  onToggleFeedback: (friendId: string) => void;
};

export function FriendsScreen({ data, onAddFriend, onToggleFeedback }: Props) {
  return (
    <Screen>
      <Text style={styles.title}>Close friends</Text>
      <Text style={styles.subtitle}>Progress relative to each person's own plan, not a leaderboard.</Text>

      {data.friends.map((friend) => (
        <View key={friend.id} style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.name}>{friend.name}</Text>
              <Text style={styles.handle}>{friend.handle} - {friend.focus}</Text>
            </View>
            <Pressable
              onPress={() => onToggleFeedback(friend.id)}
              style={[
                styles.mode,
                friend.feedbackMode === "critiqueOpen" && styles.modeOpen
              ]}
            >
              <Text style={styles.modeText}>
                {friend.feedbackMode === "critiqueOpen" ? "Critique open" : "Cheers only"}
              </Text>
            </Pressable>
          </View>

          <ProgressBar
            summary={{
              totalWeight: 1,
              doneWeight: friend.progress,
              attemptedWeight: 0,
              missedWeight: 0,
              skippedWeight: 0,
              deferredWeight: 0,
              openWeight: 1 - friend.progress,
              completion: friend.progress,
              segments: [
                { status: "done", weight: friend.progress },
                { status: "open", weight: 1 - friend.progress }
              ]
            }}
            height={12}
          />

          <Text style={styles.signal}>{friend.lastSignal}</Text>

          <View style={styles.reactions}>
            <Reaction label="Cheer" helper={reactionCopy.cheer} />
            <Reaction label="Credit" helper={reactionCopy.credit} />
            <Reaction
              label="Critique"
              helper={friend.feedbackMode === "critiqueOpen" ? reactionCopy.critique : "Only when invited"}
              disabled={friend.feedbackMode !== "critiqueOpen"}
            />
          </View>
        </View>
      ))}

      <AppButton label="Add demo friend" onPress={onAddFriend} tone="secondary" />
    </Screen>
  );
}

function Reaction({
  label,
  helper,
  disabled = false
}: {
  label: string;
  helper: string;
  disabled?: boolean;
}) {
  return (
    <Pressable style={[styles.reaction, disabled && styles.reactionDisabled]} disabled={disabled}>
      <Text style={[styles.reactionLabel, disabled && styles.disabledText]}>{label}</Text>
      <Text style={[styles.reactionHelper, disabled && styles.disabledText]} numberOfLines={1}>
        {helper}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.inkMuted,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 16
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.stroke,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14
  },
  name: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  handle: {
    color: colors.inkMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  mode: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surfaceSoft
  },
  modeOpen: {
    borderColor: colors.purple,
    backgroundColor: colors.lavender
  },
  modeText: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: "900"
  },
  signal: {
    color: colors.ink,
    fontWeight: "800",
    marginTop: 13,
    marginBottom: 13
  },
  reactions: {
    flexDirection: "row",
    gap: 8
  },
  reaction: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: 10,
    backgroundColor: colors.surfaceSoft,
    minHeight: 64
  },
  reactionDisabled: {
    opacity: 0.55
  },
  reactionLabel: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 13
  },
  reactionHelper: {
    color: colors.inkMuted,
    fontWeight: "700",
    fontSize: 10,
    marginTop: 4
  },
  disabledText: {
    color: colors.inkMuted
  }
});
