import { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

import {
  Avatar,
  DraftCard,
  DraftStatusBar,
  IconGlyph,
  SegmentBar
} from "../../../shared/components/DraftUI";
import { Screen } from "../../../shared/components/Screen";
import { colors } from "../../../shared/theme/colors";
import { styles } from "./FriendsScreen.styles";
import type { AppData, FriendFeedbackMode } from "../../../domain/model/types";
import { isValidHandle, normalizeHandle } from "../../../shared/utils/validation";

type Props = {
  data: AppData;
  onAddFriend: (name: string, handle: string) => void;
  onRemoveFriend: (friendId: string) => void | Promise<void>;
  onToggleFeedback: (friendId: string) => void;
  onAddComment: (targetId: string, comment: string) => void;
  onDeleteComment: (commentId: string) => void;
  remote?: RemoteSocialControls;
};

export type RemoteSocialControls = {
  loading: boolean;
  error?: string;
  requests: Array<{ id: string; direction: "incoming" | "outgoing"; profile: { displayName: string; handle: string } }>;
  sendByHandle(handle: string): Promise<void>;
  respond(requestId: string, accept: boolean): Promise<void>;
  cancelRequest(requestId: string): Promise<void>;
  createFriendInvite(): Promise<string>;
  acceptInvite(code: string): Promise<void>;
  currentUserId?: string;
  comments: Array<{ id: string; friendshipId: string; authorId: string; body: string; createdAt: string }>;
  addComment(friendshipId: string, body: string): Promise<void>;
  deleteComment(commentId: string): Promise<void>;
  toggleFeedback(friendshipId: string, currentMode: FriendFeedbackMode): Promise<void>;
  invites: Array<{ id: string; code: string; kind: "friend" | "collaborator"; projectId?: string; expiresAt: string; useCount: number; maxUses: number }>;
  revokeInvite(inviteId: string): Promise<void>;
};

type FriendPreview = {
  id: string;
  name: string;
  handle: string;
  progress: string;
  done: number;
  attempting: number;
  open: number;
  initial: string;
  focus: string;
  lastSignal: string;
  feedbackMode: FriendFeedbackMode;
};

export function FriendsScreen({ data, onAddFriend, onRemoveFriend, onToggleFeedback, onAddComment, onDeleteComment, remote }: Props) {
  const [selectedFriend, setSelectedFriend] = useState<FriendPreview | null>(null);
  const [manageOpen, setManageOpen] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [friendHandle, setFriendHandle] = useState("");
  const [friendError, setFriendError] = useState("");
  const [removeCandidateId, setRemoveCandidateId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [busy, setBusy] = useState(false);
  const runRemote = (operation: Promise<void>) => operation.catch((cause) => setFriendError(cause instanceof Error ? cause.message : "The request could not be completed."));
  const friends: FriendPreview[] = data.friends.map((friend) => {
    const done = Math.round(friend.progress * 100);
    const attempting = Math.min(8, 100 - done);
    return { id: friend.id, name: friend.name, handle: friend.handle, progress: `${done}%`, done, attempting, open: 100 - done - attempting, initial: friend.name.slice(0, 1).toUpperCase(), focus: friend.focus, lastSignal: friend.lastSignal, feedbackMode: friend.feedbackMode };
  });

  const addFriend = async () => {
    if (!friendHandle.trim() || (!remote && !friendName.trim())) {
      setFriendError(remote ? "Enter an exact handle." : "Enter a name and handle.");
      return;
    }
    if (!isValidHandle(friendHandle)) {
      setFriendError("Handles use 3–32 letters, numbers, or underscores.");
      return;
    }
    const normalizedHandle = normalizeHandle(friendHandle);
    if (data.friends.some((friend) => friend.handle.toLowerCase() === normalizedHandle)) {
      setFriendError("That handle is already in your circle.");
      return;
    }
    setBusy(true);
    try {
      if (remote) await remote.sendByHandle(friendHandle);
      else onAddFriend(friendName, friendHandle);
      setFriendName("");
      setFriendHandle("");
      setFriendError("");
    } catch (cause) {
      setFriendError(cause instanceof Error ? cause.message : "Could not send the request.");
    } finally {
      setBusy(false);
    }
  };

  if (selectedFriend) {
    const currentFriend = friends.find((friend) => friend.id === selectedFriend.id) ?? selectedFriend;
    return <FriendDetail friend={currentFriend} data={data} remote={remote} onToggleFeedback={onToggleFeedback} onAddComment={onAddComment} onDeleteComment={onDeleteComment} onBack={() => setSelectedFriend(null)} />;
  }

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.headingRow}>
        <View><Text style={styles.title}>Friends</Text><Text style={styles.subtitle}>{friends.length} friends</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Manage friends" style={styles.manageButton} onPress={() => setManageOpen(true)}><IconGlyph name="person-add-outline" size={15} color={colors.purple} /><Text style={styles.manageText}>Manage</Text></Pressable>
      </View>

      <View style={styles.list}>
        {friends.map((friend) => (
          <Pressable key={friend.id} accessibilityRole="button" accessibilityLabel={`Open ${friend.name}, ${friend.progress} this week`} onPress={() => setSelectedFriend(friend)}>
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

      <Modal visible={manageOpen} animationType="slide" transparent onRequestClose={() => setManageOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close friend management" style={styles.backdrop} onPress={() => setManageOpen(false)} />
        <View style={styles.manageSheet}>
          <View style={styles.manageHeader}><Text style={styles.detailName}>Manage friends</Text><Pressable accessibilityRole="button" accessibilityLabel="Close friend management" onPress={() => setManageOpen(false)} style={styles.iconButton}><IconGlyph name="close" /></Pressable></View>
          <Text style={styles.manageHelp}>{remote ? "Send a request using an exact handle, or share a private invite code." : "Add someone with their name and handle. Removing a friend always asks for confirmation."}</Text>
          {!remote && <TextInput accessibilityLabel="Friend name" value={friendName} onChangeText={(value) => { setFriendName(value); if (friendError) setFriendError(""); }} placeholder="Name" placeholderTextColor={colors.inactive} style={styles.manageInput} />}
          <TextInput accessibilityLabel="Friend handle" value={friendHandle} onChangeText={(value) => { setFriendHandle(value); if (friendError) setFriendError(""); }} autoCapitalize="none" placeholder="@handle" placeholderTextColor={colors.inactive} style={styles.manageInput} />
          {!!(friendError || remote?.error) && <Text accessibilityRole="alert" style={styles.errorText}>{friendError || remote?.error}</Text>}
          <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy }} disabled={busy} style={styles.addButton} onPress={() => { void addFriend(); }}><Text style={styles.addButtonText}>{busy ? "Working..." : remote ? "Send friend request" : "Add friend"}</Text></Pressable>
          {remote && <>
            <Text style={styles.sectionLabel}>INVITES</Text>
            <View style={styles.inlineRow}>
              <TextInput accessibilityLabel="Friend invite code" value={inviteInput} onChangeText={setInviteInput} autoCapitalize="none" placeholder="Invite code" placeholderTextColor={colors.inactive} style={[styles.manageInput, styles.flexInput]} />
              <Pressable accessibilityRole="button" accessibilityLabel="Accept invite" style={styles.secondaryButton} onPress={() => { void remote.acceptInvite(inviteInput).then(() => setInviteInput("")).catch((cause) => setFriendError(cause.message)); }}><Text style={styles.secondaryText}>Accept</Text></Pressable>
            </View>
            <Pressable accessibilityRole="button" style={styles.inviteButton} onPress={() => { void remote.createFriendInvite().then(setInviteCode).catch((cause) => setFriendError(cause.message)); }}><Text style={styles.secondaryText}>{inviteCode ? `Invite code: ${inviteCode}` : "Create a friend invite"}</Text></Pressable>
            {remote.invites.filter((invite) => invite.kind === "friend").map((invite) => <View key={invite.id} style={styles.requestRow}>
              <View style={styles.friendCopy}><Text style={styles.friendName}>{invite.code}</Text><Text style={styles.friendMeta}>Expires {new Date(invite.expiresAt).toLocaleDateString()} · {invite.useCount}/{invite.maxUses} used</Text></View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Revoke invite ${invite.code}`} style={styles.removeCancel} onPress={() => { void runRemote(remote.revokeInvite(invite.id)); }}><Text style={styles.removeCancelText}>Revoke</Text></Pressable>
            </View>)}
            {!!remote.requests.length && <Text style={styles.sectionLabel}>REQUESTS</Text>}
            {remote.requests.map((request) => <View key={request.id} style={styles.requestRow}>
              <View style={styles.friendCopy}><Text style={styles.friendName}>{request.profile.displayName}</Text><Text style={styles.friendMeta}>{request.profile.handle} · {request.direction}</Text></View>
              {request.direction === "incoming" && <View style={styles.removeActions}>
                <Pressable accessibilityRole="button" accessibilityLabel={`Decline ${request.profile.displayName}`} style={styles.removeCancel} onPress={() => { void runRemote(remote.respond(request.id, false)); }}><Text style={styles.removeCancelText}>Decline</Text></Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Accept ${request.profile.displayName}`} style={styles.addSmall} onPress={() => { void runRemote(remote.respond(request.id, true)); }}><Text style={styles.addButtonText}>Accept</Text></Pressable>
              </View>}
              {request.direction === "outgoing" && <Pressable accessibilityRole="button" accessibilityLabel={`Cancel request to ${request.profile.displayName}`} style={styles.removeCancel} onPress={() => { void runRemote(remote.cancelRequest(request.id)); }}><Text style={styles.removeCancelText}>Cancel</Text></Pressable>}
            </View>)}
          </>}
          <View style={styles.manageList}>{data.friends.map((friend) => (
            <View key={friend.id} style={styles.manageRow}>
              <Avatar label={friend.name.slice(0, 1).toUpperCase()} />
              <View style={styles.friendCopy}><Text style={styles.friendName}>{friend.name}</Text><Text style={styles.friendMeta}>{friend.handle}</Text></View>
              {removeCandidateId === friend.id ? (
                <View style={styles.removeActions}>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Cancel removing ${friend.name}`} onPress={() => setRemoveCandidateId(null)} style={styles.removeCancel}><Text style={styles.removeCancelText}>Cancel</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={`Confirm remove ${friend.name}`} onPress={() => {
                    void Promise.resolve(onRemoveFriend(friend.id)).then(() => setRemoveCandidateId(null)).catch((cause) => setFriendError(cause instanceof Error ? cause.message : "Could not remove the friend."));
                  }} style={styles.removeConfirm}><Text style={styles.removeConfirmText}>Remove</Text></Pressable>
                </View>
              ) : (
                <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${friend.name}`} onPress={() => setRemoveCandidateId(friend.id)} style={styles.iconButton}><IconGlyph name="trash-outline" color="#F87171" /></Pressable>
              )}
            </View>
          ))}</View>
        </View>
      </Modal>
    </Screen>
  );
}

function FriendDetail({ friend, data, remote, onToggleFeedback, onAddComment, onDeleteComment, onBack }: {
  friend: FriendPreview;
  data: AppData;
  remote?: RemoteSocialControls;
  onToggleFeedback: (friendId: string) => void;
  onAddComment: (targetId: string, comment: string) => void;
  onDeleteComment: (commentId: string) => void;
  onBack: () => void;
}) {
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const targetId = `shared-${friend.handle.slice(1)}-runs`;
  const localComments = data.reactions.filter((reaction) => reaction.targetId === targetId && reaction.comment);
  const comments = remote ? remote.comments.filter((entry) => entry.friendshipId === friend.id) : localComments;
  const sendComment = async () => {
    if (!comment.trim()) return;
    try {
      if (remote) await remote.addComment(friend.id, comment);
      else onAddComment(targetId, comment);
      setComment("");
      setCommentError("");
    } catch (cause) {
      setCommentError(cause instanceof Error ? cause.message : "Could not add the comment.");
    }
  };

  return (
    <Screen>
      <DraftStatusBar />
      <View style={styles.detailHeader}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to friends" onPress={onBack} style={styles.iconButton}>
          <IconGlyph name="arrow-back" size={18} color={colors.inkMuted} />
        </Pressable>
        <Avatar label={friend.initial} />
        <View>
          <Text style={styles.detailName}>{friend.name}</Text>
          <Text style={styles.friendMeta}>{friend.handle}</Text>
        </View>
      </View>

      <DraftCard style={styles.friendHero}>
        <Text style={styles.eyebrow}>THIS WEEK</Text>
        <View style={styles.percentRow}>
          <Text style={styles.detailPercent}>{friend.progress.replace("%", "")}</Text>
          <Text style={styles.percentMark}>%</Text>
        </View>
        <SegmentBar done={friend.done} attempted={friend.attempting} open={friend.open} height={10} />
      </DraftCard>
      <Text style={styles.measurement}>Measured against {friend.name}'s own goals, not yours.</Text>

      <Pressable accessibilityRole="button" accessibilityLabel={friend.feedbackMode === "critiqueOpen" ? "Switch to cheers only" : "Allow constructive feedback"} onPress={() => { if (remote) void remote.toggleFeedback(friend.id, friend.feedbackMode).catch((cause) => setCommentError(cause instanceof Error ? cause.message : "Could not update feedback.")); else onToggleFeedback(friend.id); }} style={styles.feedbackButton}>
        <IconGlyph name={friend.feedbackMode === "critiqueOpen" ? "chatbubbles-outline" : "heart-outline"} size={15} color={colors.purple} />
        <View style={styles.friendCopy}>
          <Text style={styles.feedbackTitle}>{friend.feedbackMode === "critiqueOpen" ? "Constructive feedback is welcome" : "Cheers only"}</Text>
          <Text style={styles.friendMeta}>Tap to change what kind of support you share.</Text>
        </View>
      </Pressable>

      <Text style={styles.eyebrow}>SHARED WITH YOU</Text>
      <DraftCard selected style={styles.sharedCard}>
        {!!commentError && <Text accessibilityRole="alert" style={styles.errorText}>{commentError}</Text>}
        <View style={styles.sharedTop}>
          <IconGlyph name="walk-outline" size={16} />
          <Text style={styles.sharedTitle}>{friend.focus}</Text>
          <Text style={styles.done}>Done</Text>
        </View>
        <Text style={styles.sharedMeta}>{friend.lastSignal}</Text>
        <SegmentBar done={100} open={0} height={4} />
        <View style={styles.inputRow}>
          <Avatar label="Y" />
          <TextInput
            value={comment}
            onChangeText={setComment}
            onSubmitEditing={() => { void sendComment(); }}
            returnKeyType="send"
            placeholder="Add a comment..."
            placeholderTextColor={colors.inkMuted}
            style={styles.commentInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Send comment" accessibilityState={{ disabled: !comment.trim() }} onPress={() => { void sendComment(); }} disabled={!comment.trim()} style={styles.sendButton}>
            <IconGlyph name="send" size={15} color={comment.trim() ? colors.purple : colors.inactive} />
          </Pressable>
        </View>
        {comments.map((entry) => (
          <View key={entry.id} style={styles.comment}>
            <Avatar label="Y" />
            <View style={styles.commentBubble}>
              <Text style={styles.commentAuthor}>{remote && entry.authorId !== remote.currentUserId ? friend.name : "You"} <Text style={styles.commentTime}>- {remote ? new Date(entry.createdAt).toLocaleDateString() : "now"}</Text></Text>
              <Text style={styles.commentText}>{"body" in entry ? entry.body : entry.comment}</Text>
            </View>
            {entry.authorId === (remote?.currentUserId ?? data.currentUser.id) && <Pressable accessibilityRole="button" accessibilityLabel="Delete comment" onPress={() => {
              if (remote) void remote.deleteComment(entry.id).catch((cause) => setCommentError(cause instanceof Error ? cause.message : "Could not delete the comment."));
              else onDeleteComment(entry.id);
            }} style={styles.sendButton}><IconGlyph name="trash-outline" size={14} color={colors.coral} /></Pressable>}
          </View>
        ))}
      </DraftCard>
    </Screen>
  );
}
