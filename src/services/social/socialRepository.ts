import { getSupabaseClient } from "../remote/supabaseClient";
import type { Project } from "../../domain/model/types";

export type SocialProfile = {
  id: string;
  handle: string;
  displayName: string;
  avatarPath?: string;
};

export type FriendRequest = {
  id: string;
  direction: "incoming" | "outgoing";
  profile: SocialProfile;
  createdAt: string;
};

export type FriendComment = { id: string; friendshipId: string; authorId: string; body: string; createdAt: string };
export type ActiveInvite = { id: string; code: string; kind: "friend" | "collaborator"; projectId?: string; expiresAt: string; useCount: number; maxUses: number };
export type ProjectCollaborator = { projectId: string; userId: string; role: "viewer" | "editor"; profile: SocialProfile; action: "remove" | "leave" };

type ProfileRow = { id: string; handle: string; display_name: string; avatar_path: string | null };

export async function loadSocialGraph(userId: string) {
  const client = getSupabaseClient();
  const [{ data: friendships, error: friendsError }, { data: requests, error: requestsError }, { data: sharedProjects, error: projectsError }, { data: invites, error: invitesError }, { data: collaborators, error: collaboratorsError }] = await Promise.all([
    client.from("friendships").select("id,user_a,user_b,created_at").or(`user_a.eq.${userId},user_b.eq.${userId}`),
    client.from("friend_requests").select("id,sender_id,recipient_id,created_at").eq("status", "pending").or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
    client.from("shared_projects").select("project_id,data,revision,updated_at").order("updated_at", { ascending: false }),
    client.from("invites").select("id,code,kind,project_id,expires_at,use_count,max_uses").eq("inviter_id", userId).is("revoked_at", null).gt("expires_at", new Date().toISOString()),
    client.from("project_collaborators").select("project_id,owner_id,user_id,role").or(`owner_id.eq.${userId},user_id.eq.${userId}`)
  ]);
  if (friendsError) throw new Error(friendsError.message);
  if (requestsError) throw new Error(requestsError.message);
  if (projectsError) throw new Error(projectsError.message);
  if (invitesError) throw new Error(invitesError.message);
  if (collaboratorsError) throw new Error(collaboratorsError.message);

  const profileIds = new Set<string>();
  friendships?.forEach((row) => profileIds.add(row.user_a === userId ? row.user_b : row.user_a));
  requests?.forEach((row) => profileIds.add(row.sender_id === userId ? row.recipient_id : row.sender_id));
  collaborators?.forEach((row) => profileIds.add(row.owner_id === userId ? row.user_id : row.owner_id));
  const profiles = await loadProfiles([...profileIds]);
  const [{ data: summaries, error: summariesError }, { data: comments, error: commentsError }, { data: preferences, error: preferencesError }] = await Promise.all([
    profileIds.size ? client.from("social_summaries").select("user_id,completion,focus,last_signal").in("user_id", [...profileIds]) : Promise.resolve({ data: [], error: null }),
    friendships?.length ? client.from("friend_comments").select("id,friendship_id,author_id,body,created_at").in("friendship_id", friendships.map((row) => row.id)).order("created_at", { ascending: false }).limit(500) : Promise.resolve({ data: [], error: null }),
    friendships?.length ? client.from("friendship_preferences").select("friendship_id,feedback_mode").eq("user_id", userId).in("friendship_id", friendships.map((row) => row.id)) : Promise.resolve({ data: [], error: null })
  ]);
  if (summariesError) throw new Error(summariesError.message);
  if (commentsError) throw new Error(commentsError.message);
  if (preferencesError) throw new Error(preferencesError.message);
  const summaryByUser = new Map((summaries ?? []).map((summary) => [summary.user_id, summary]));
  const preferenceByFriendship = new Map((preferences ?? []).map((preference) => [preference.friendship_id, preference.feedback_mode]));

  return {
    friends: (friendships ?? []).flatMap((row) => {
      const otherId = row.user_a === userId ? row.user_b : row.user_a;
      const profile = profiles.get(otherId);
      const summary = summaryByUser.get(otherId);
      return profile ? [{ friendshipId: row.id, profile, summary, feedbackMode: preferenceByFriendship.get(row.id) }] : [];
    }),
    requests: (requests ?? []).flatMap((row): FriendRequest[] => {
      const incoming = row.recipient_id === userId;
      const profile = profiles.get(incoming ? row.sender_id : row.recipient_id);
      return profile ? [{ id: row.id, direction: incoming ? "incoming" : "outgoing", profile, createdAt: row.created_at }] : [];
    }),
    sharedProjects: (sharedProjects ?? []).map((row) => row.data as Project),
    comments: [...(comments ?? [])].reverse().map((comment): FriendComment => ({
      id: comment.id, friendshipId: comment.friendship_id, authorId: comment.author_id, body: comment.body, createdAt: comment.created_at
    })),
    invites: (invites ?? []).map((invite): ActiveInvite => ({
      id: invite.id, code: invite.code, kind: invite.kind, projectId: invite.project_id ?? undefined,
      expiresAt: invite.expires_at, useCount: invite.use_count, maxUses: invite.max_uses
    })),
    collaborators: (collaborators ?? []).flatMap((membership): ProjectCollaborator[] => {
      const otherId = membership.owner_id === userId ? membership.user_id : membership.owner_id;
      const profile = profiles.get(otherId);
      return profile ? [{ projectId: membership.project_id, userId: membership.user_id, role: membership.role, profile, action: membership.owner_id === userId ? "remove" : "leave" }] : [];
    })
  };
}

export async function publishSocialSummary(userId: string, completion: number, focus: string, lastSignal: string): Promise<void> {
  const { error } = await getSupabaseClient().from("social_summaries").upsert({
    user_id: userId,
    completion: Math.max(0, Math.min(100, Math.round(completion))),
    focus: focus.slice(0, 120) || "Shared progress",
    last_signal: lastSignal.slice(0, 180) || "No recent signal",
    updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}

export async function addFriendComment(friendshipId: string, userId: string, body: string): Promise<void> {
  const cleanBody = body.trim();
  if (!cleanBody) return;
  const client = getSupabaseClient();
  const { data: connection, error: connectionError } = await client.from("friendships").select("user_a,user_b").eq("id", friendshipId).single();
  if (connectionError) throw new Error(connectionError.message);
  const { error } = await client.from("friend_comments").insert({ friendship_id: friendshipId, author_id: userId, body: cleanBody });
  if (error) throw new Error(error.message);
  const recipientId = connection.user_a === userId ? connection.user_b : connection.user_a;
  void client.functions.invoke("send-notification", {
    body: { recipientId, title: "New encouragement", body: cleanBody.slice(0, 120), screen: "friends" }
  });
}

export async function deleteFriendComment(commentId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("friend_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
}

export async function setFriendFeedbackMode(friendshipId: string, userId: string, feedbackMode: "cheersOnly" | "critiqueOpen"): Promise<void> {
  const { error } = await getSupabaseClient().from("friendship_preferences").upsert({
    friendship_id: friendshipId, user_id: userId, feedback_mode: feedbackMode, updated_at: new Date().toISOString()
  });
  if (error) throw new Error(error.message);
}

export async function findProfileByHandle(handle: string, currentUserId: string): Promise<SocialProfile | null> {
  const cleanHandle = handle.trim().replace(/^@+/, "");
  if (!cleanHandle) return null;
  const { data, error } = await getSupabaseClient().rpc("find_profile_by_handle", { exact_handle: cleanHandle }).maybeSingle();
  if (error) throw new Error(error.message);
  const profile = data as ProfileRow | null;
  return profile && profile.id !== currentUserId ? mapProfile(profile) : null;
}

export async function sendFriendRequest(userId: string, recipientId: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from("friend_requests").insert({ sender_id: userId, recipient_id: recipientId });
  if (error) throw new Error(humanizeSocialError(error.message));
  void client.functions.invoke("send-notification", {
    body: { recipientId, title: "New friend request", body: "Someone wants to connect with you on Progress.", screen: "friends" }
  });
}

export async function respondToFriendRequest(requestId: string, accept: boolean): Promise<void> {
  const client = getSupabaseClient();
  const request = accept ? await client.from("friend_requests").select("sender_id").eq("id", requestId).maybeSingle() : undefined;
  const { error } = await client.rpc(accept ? "accept_friend_request" : "decline_friend_request", { request_id: requestId });
  if (error) throw new Error(error.message);
  if (accept && request?.data?.sender_id) void client.functions.invoke("send-notification", {
    body: { recipientId: request.data.sender_id, title: "Friend request accepted", body: "You are now connected on Progress.", screen: "friends" }
  });
}

export async function cancelFriendRequest(requestId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("cancel_friend_request", { request_id: requestId });
  if (error) throw new Error(error.message);
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("friendships").delete().eq("id", friendshipId);
  if (error) throw new Error(error.message);
}

export async function createInvite(userId: string, projectId?: string): Promise<string> {
  const query = getSupabaseClient().from("invites");
  const result = projectId
    ? await query.insert({ inviter_id: userId, kind: "collaborator", project_id: projectId, role: "editor" }).select("code").single()
    : await query.insert({ inviter_id: userId, kind: "friend" }).select("code").single();
  const { data, error } = result;
  if (error) throw new Error(error.message);
  return data.code;
}

export async function createCollaborationInvite(userId: string, project: Project): Promise<string> {
  const { error } = await getSupabaseClient().from("shared_projects").upsert({
    project_id: project.id,
    owner_id: userId,
    data: project,
    updated_at: new Date().toISOString()
  }, { onConflict: "project_id" });
  if (error) throw new Error(error.message);
  return createInvite(userId, project.id);
}

export async function saveSharedProject(project: Project): Promise<void> {
  const { error } = await getSupabaseClient().rpc("update_shared_project", {
    target_project_id: project.id,
    project_data: project
  });
  if (error) throw new Error(error.message);
}

export async function deleteSharedProject(projectId: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("delete_shared_project", { target_project_id: projectId });
  if (error) throw new Error(error.message);
}

export async function acceptInvite(code: string): Promise<void> {
  const { error } = await getSupabaseClient().rpc("accept_invite", { invite_code: code.trim().toLowerCase() });
  if (error) throw new Error(error.message);
}

export async function revokeInvite(inviteId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("invites").update({ revoked_at: new Date().toISOString() }).eq("id", inviteId);
  if (error) throw new Error(error.message);
}

export async function removeProjectCollaborator(projectId: string, userId: string): Promise<void> {
  const { error } = await getSupabaseClient().from("project_collaborators").delete().eq("project_id", projectId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function synchronizeProfile(userId: string, name: string, handle: string, avatarPath?: string): Promise<void> {
  const { error } = await getSupabaseClient().from("profiles").update({
    display_name: name.trim(),
    handle: handle.trim().replace(/^@+/, ""),
    avatar_path: avatarPath ?? null,
    updated_at: new Date().toISOString()
  }).eq("id", userId);
  if (error) throw new Error(error.message);
}

async function loadProfiles(ids: string[]): Promise<Map<string, SocialProfile>> {
  if (!ids.length) return new Map();
  const { data, error } = await getSupabaseClient().from("profiles").select("id,handle,display_name,avatar_path").in("id", ids);
  if (error) throw new Error(error.message);
  return new Map((data as ProfileRow[]).map((row) => [row.id, mapProfile(row)]));
}

function mapProfile(row: ProfileRow): SocialProfile {
  return { id: row.id, handle: `@${row.handle}`, displayName: row.display_name, avatarPath: row.avatar_path ?? undefined };
}

function humanizeSocialError(message: string): string {
  return message.includes("friend_requests_one_pending_pair") ? "A friend request is already pending." : message;
}
