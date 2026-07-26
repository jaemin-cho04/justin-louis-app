import { useCallback, useEffect, useState } from "react";

import type { Friend } from "../../domain/model/types";
import type { Project } from "../../domain/model/types";
import { getSupabaseClient } from "../remote/supabaseClient";
import {
  acceptInvite,
  addFriendComment,
  cancelFriendRequest,
  deleteFriendComment,
  deleteSharedProject,
  createInvite,
  createCollaborationInvite,
  saveSharedProject,
  setFriendFeedbackMode,
  findProfileByHandle,
  loadSocialGraph,
  removeFriend,
  removeProjectCollaborator,
  revokeInvite,
  respondToFriendRequest,
  sendFriendRequest,
  type FriendComment,
  type FriendRequest
} from "./socialRepository";

export function useSocialGraph(userId?: string) {
  const [friends, setFriends] = useState<Array<Friend & { friendshipId: string }>>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
  const [comments, setComments] = useState<FriendComment[]>([]);
  const [invites, setInvites] = useState<Awaited<ReturnType<typeof loadSocialGraph>>["invites"]>([]);
  const [collaborators, setCollaborators] = useState<Awaited<ReturnType<typeof loadSocialGraph>>["collaborators"]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const graph = await loadSocialGraph(userId);
      setFriends(graph.friends.map(({ friendshipId, profile, summary, feedbackMode }) => ({
        id: friendshipId,
        friendshipId,
        userId: profile.id,
        name: profile.displayName,
        handle: profile.handle,
        progress: (summary?.completion ?? 0) / 100,
        feedbackMode: feedbackMode === "critiqueOpen" ? "critiqueOpen" : "cheersOnly",
        focus: summary?.focus ?? "Shared progress",
        lastSignal: summary?.last_signal ?? "Connected through Progress"
      })));
      setRequests(graph.requests);
      setSharedProjects(graph.sharedProjects);
      setComments(graph.comments);
      setInvites(graph.invites);
      setCollaborators(graph.collaborators);
      setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not refresh friends.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void refresh(); }, [refresh]);

  useEffect(() => {
    if (!userId) return;
    const client = getSupabaseClient();
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => { void refresh(); }, 150);
    };
    let channel = client.channel(`social:${userId}`);
    for (const table of ["friend_requests", "friendships", "friend_comments", "friendship_preferences", "social_summaries", "invites", "project_collaborators", "shared_projects"]) {
      channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleRefresh);
    }
    channel.subscribe();
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      void client.removeChannel(channel).catch(() => undefined);
    };
  }, [refresh, userId]);

  const run = useCallback(async (operation: () => Promise<void>) => {
    setError(undefined);
    try {
      await operation();
      await refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The request could not be completed.";
      setError(message);
      throw new Error(message);
    }
  }, [refresh]);

  return {
    enabled: Boolean(userId), currentUserId: userId, friends, requests, sharedProjects, comments, invites, collaborators, loading, error, refresh,
    sendByHandle: async (handle: string) => run(async () => {
      if (!userId) return;
      const profile = await findProfileByHandle(handle, userId);
      if (!profile) throw new Error("No Progress user has that exact handle.");
      await sendFriendRequest(userId, profile.id);
    }),
    respond: (requestId: string, accept: boolean) => run(() => respondToFriendRequest(requestId, accept)),
    cancelRequest: (requestId: string) => run(() => cancelFriendRequest(requestId)),
    remove: (friendshipId: string) => run(() => removeFriend(friendshipId)),
    createFriendInvite: async () => {
      if (!userId) throw new Error("Sign in to create an invite.");
      return createInvite(userId);
    },
    createProjectInvite: async (project: Project) => {
      if (!userId) throw new Error("Sign in to invite a collaborator.");
      return createCollaborationInvite(userId, project);
    },
    revokeInvite: (inviteId: string) => run(() => revokeInvite(inviteId)),
    removeCollaborator: (projectId: string, collaboratorUserId: string) => run(() => removeProjectCollaborator(projectId, collaboratorUserId)),
    saveSharedProject,
    deleteSharedProject: (projectId: string) => run(() => deleteSharedProject(projectId)),
    addComment: (friendshipId: string, body: string) => run(async () => {
      if (!userId) return;
      await addFriendComment(friendshipId, userId, body);
    }),
    deleteComment: (commentId: string) => run(() => deleteFriendComment(commentId)),
    toggleFeedback: (friendshipId: string, currentMode: "cheersOnly" | "critiqueOpen") => run(async () => {
      if (!userId) return;
      await setFriendFeedbackMode(friendshipId, userId, currentMode === "critiqueOpen" ? "cheersOnly" : "critiqueOpen");
    }),
    acceptInvite: (code: string) => run(() => acceptInvite(code))
  };
}
