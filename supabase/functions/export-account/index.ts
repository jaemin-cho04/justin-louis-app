import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);
  const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authorization } }
  });
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) return json({ error: "Authentication required" }, 401);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const queries = await Promise.all([
    client.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    client.from("app_snapshots").select("revision,schema_version,data,updated_at").eq("user_id", user.id).maybeSingle(),
    client.from("friend_requests").select("*").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`),
    client.from("friendships").select("*").or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    client.from("invites").select("*").eq("inviter_id", user.id),
    client.from("project_collaborators").select("*").or(`owner_id.eq.${user.id},user_id.eq.${user.id}`),
    client.from("shared_projects").select("project_id,owner_id,data,revision,updated_at"),
    client.from("media_objects").select("*").eq("owner_id", user.id),
    client.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle(),
    client.from("push_tokens").select("id,platform,enabled,updated_at").eq("user_id", user.id),
    client.from("social_summaries").select("*"),
    client.from("friend_comments").select("*"),
    client.from("friendship_preferences").select("*"),
    admin.from("security_events").select("event_type,metadata,created_at").eq("user_id", user.id),
    admin.from("notification_deliveries").select("sender_id,recipient_id,created_at").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
  ]);
  const failed = queries.find((result) => result.error);
  if (failed?.error) return json({ error: failed.error.message }, 500);
  const [profile, snapshot, friendRequests, friendships, invites, collaborators, sharedProjects, media, preferences, devices, summaries, comments, friendshipPreferences, securityEvents, notificationDeliveries] = queries;
  return json({
    exportedAt: new Date().toISOString(),
    account: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: profile.data,
    snapshot: snapshot.data,
    friendRequests: friendRequests.data,
    friendships: friendships.data,
    invites: invites.data,
    collaborators: collaborators.data,
    sharedProjects: sharedProjects.data,
    media: media.data,
    notificationPreferences: preferences.data,
    registeredDevices: devices.data,
    socialSummaries: summaries.data,
    friendComments: comments.data,
    friendshipPreferences: friendshipPreferences.data,
    securityEvents: securityEvents.data,
    notificationDeliveries: notificationDeliveries.data
  });
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}
