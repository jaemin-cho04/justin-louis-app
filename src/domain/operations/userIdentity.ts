import type { AppData } from "../model/types";

export function bindDataToUser(data: AppData, userId: string): AppData {
  const previousId = data.currentUser.id;
  if (previousId === userId) return data;
  return {
    ...data,
    currentUser: { ...data.currentUser, id: userId },
    projects: data.projects.map((project) => project.ownerId === previousId ? { ...project, ownerId: userId } : project),
    memberships: data.memberships.map((membership) => membership.userId === previousId ? { ...membership, userId } : membership),
    reactions: data.reactions.map((reaction) => reaction.authorId === previousId ? { ...reaction, authorId: userId } : reaction),
    invites: data.invites.map((invite) => invite.senderId === previousId ? { ...invite, senderId: userId } : invite)
  };
}
