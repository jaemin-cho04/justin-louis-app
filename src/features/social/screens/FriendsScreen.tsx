import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import {
  Avatar,
  DraftCard,
  DraftStatusBar,
  IconGlyph,
  SegmentBar
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import type { AppData } from "../../../domain/model/types";

type Props = {
  data: AppData;
  onAddFriend: () => void;
  onToggleFeedback: (friendId: string) => void;
  onAddComment: (targetId: string, comment: string) => void;
};

const friends = [
  { name: "Louis", handle: "@louis", progress: "71%", done: 60, attempting: 11, open: 29, initial: "L" },
  { name: "Michelle", handle: "@michelle", progress: "88%", done: 80, attempting: 8, open: 12, initial: "M" },
  { name: "Raymond", handle: "@ray", progress: "54%", done: 40, attempting: 14, open: 46, initial: "R" }
];

export function FriendsScreen({ data, onAddComment }: Props) {
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);

  if (selectedFriend === "Louis") {
    return <FriendDetail data={data} onAddComment={onAddComment} onBack={() => setSelectedFriend(null)} />;
  }

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.heading}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>5 friends</Text>
      </View>

      <View style={styles.list}>
        {friends.map((friend) => (
          <Pressable key={friend.name} accessibilityRole="button" onPress={() => setSelectedFriend(friend.name)}>
            <DraftCard style={styles.friendCard}>
              <Avatar label={friend.initial} />
              <View style={styles.friendCopy}>
                <View style={styles.friendTop}>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.progressValue}>{friend.progress}</Text>
                </View>
                <Text style={styles.friendMeta}>{friend.handle} - this week</Text>
                <SegmentBar done={friend.done} attempted={friend.attempting} open={friend.open} />
              </View>
            </DraftCard>
          </Pressable>
        ))}
      </View>

      <View style={styles.noteRow}>
        <IconGlyph name="chatbox-outline" size={12} color={colors.inactive} />
        <Text style={styles.note}>Everyone's percent is measured against their own goals.</Text>
      </View>
    </Screen>
  );
}

function FriendDetail({ data, onAddComment, onBack }: {
  data: AppData;
  onAddComment: (targetId: string, comment: string) => void;
  onBack: () => void;
}) {
  const [comment, setComment] = useState("");
  const comments = data.reactions.filter((reaction) => reaction.targetId === "shared-louis-runs" && reaction.comment);
  const sendComment = () => {
    if (!comment.trim()) return;
    onAddComment("shared-louis-runs", comment);
    setComment("");
  };

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" onPress={onBack}>
          <IconGlyph name="arrow-back" size={18} color={colors.inkMuted} />
        </Pressable>
        <Avatar label="L" />
        <View>
          <Text style={styles.detailName}>Louis</Text>
          <Text style={styles.friendMeta}>@louis</Text>
        </View>
      </View>

      <DraftCard style={styles.friendHero}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <View style={styles.percentRow}>
          <Text style={styles.detailPercent}>71</Text>
          <Text style={styles.percentMark}>%</Text>
        </View>
        <SegmentBar done={60} attempted={11} open={29} height={10} />
      </DraftCard>
      <Text style={styles.measurement}>Measured against Louis's own goals, not yours.</Text>

      <Text style={styles.eyebrow}>SHARED WITH YOU</Text>
      <DraftCard selected style={styles.sharedCard}>
        <View style={styles.sharedTop}>
          <IconGlyph name="walk-outline" size={16} />
          <Text style={styles.sharedTitle}>Runs</Text>
          <Text style={styles.done}>Done</Text>
        </View>
        <Text style={styles.sharedMeta}>5K, easy pace - 27:40</Text>
        <SegmentBar done={100} open={0} height={4} />
        <View style={styles.comment}>
          <Avatar label="M" />
          <View style={styles.commentBubble}>
            <Text style={styles.commentAuthor}>Michelle <Text style={styles.commentTime}>- 2h</Text></Text>
            <Text style={styles.commentText}>Nice pace, solid time for an easy run.</Text>
          </View>
        </View>
        <View style={styles.inputRow}>
          <Avatar label="Y" />
          <TextInput
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={sendComment}
            returnKeyType="send"
            placeholder="Add a comment..."
            placeholderTextColor={colors.inkMuted}
            style={styles.commentInput}
          />
          <Pressable accessibilityLabel="Send comment" onPress={sendComment} disabled={!comment.trim()}>
            <IconGlyph name="send" size={15} color={comment.trim() ? colors.purple : colors.inactive} />
          </Pressable>
        </View>
        {comments.map((entry) => (
          <View key={entry.id} style={styles.comment}>
            <Avatar label="Y" />
            <View style={styles.commentBubble}>
              <Text style={styles.commentAuthor}>You <Text style={styles.commentTime}>- now</Text></Text>
              <Text style={styles.commentText}>{entry.comment}</Text>
            </View>
          </View>
        ))}
      </DraftCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 16
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
    marginBottom: 14
  },
  friendCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  friendCopy: {
    flex: 1
  },
  friendTop: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between"
  },
  friendName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  progressValue: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "900"
  },
  friendMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 7
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  note: {
    color: colors.inactive,
    fontSize: 10.5,
    fontWeight: "600"
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16
  },
  detailName: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "900"
  },
  friendHero: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 6
  },
  eyebrow: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    marginBottom: 8
  },
  percentRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 10
  },
  detailPercent: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: "900"
  },
  percentMark: {
    color: colors.inkMuted,
    fontSize: 14,
    fontWeight: "900"
  },
  measurement: {
    color: colors.inactive,
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 14
  },
  sharedCard: {
    marginTop: 0
  },
  sharedTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 2
  },
  sharedTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    flex: 1
  },
  done: {
    color: colors.mint,
    fontSize: 11,
    fontWeight: "900"
  },
  sharedMeta: {
    color: colors.inkMuted,
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 25,
    marginBottom: 8
  },
  comment: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 8
  },
  commentBubble: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  commentAuthor: {
    color: colors.ink,
    fontSize: 10.5,
    fontWeight: "900"
  },
  commentTime: {
    color: colors.inactive,
    fontWeight: "600"
  },
  commentText: {
    color: colors.whiteMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  commentInput: {
    flex: 1,
    minHeight: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: colors.surfaceSoft,
    color: colors.ink,
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: "600"
  }
});
