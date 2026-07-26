import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type NotificationBody = { recipientId?: string; title?: string; body?: string; screen?: string };

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization) return json({ error: "Authentication required" }, 401);
  const url = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, anonKey, { global: { headers: { Authorization: authorization } } });
  const admin = createClient(url, serviceKey);
  const { data: { user } } = await userClient.auth.getUser();
  let payload: NotificationBody;
  try { payload = await request.json() as NotificationBody; } catch { return json({ error: "Invalid JSON" }, 400); }
  if (!user || !isUuid(payload.recipientId) || typeof payload.title !== "string" || typeof payload.body !== "string" || !payload.title.trim() || !payload.body.trim()) {
    return json({ error: "Invalid request" }, 400);
  }

  const [{ data: friendship }, { data: friendRequest }, { data: collaboration }] = await Promise.all([
    admin.from("friendships").select("id").or(`and(user_a.eq.${user.id},user_b.eq.${payload.recipientId}),and(user_a.eq.${payload.recipientId},user_b.eq.${user.id})`).maybeSingle(),
    admin.from("friend_requests").select("id").eq("sender_id", user.id).eq("recipient_id", payload.recipientId).eq("status", "pending").maybeSingle(),
    admin.from("project_collaborators").select("project_id").or(`and(owner_id.eq.${user.id},user_id.eq.${payload.recipientId}),and(owner_id.eq.${payload.recipientId},user_id.eq.${user.id})`).limit(1).maybeSingle()
  ]);
  if (!friendship && !friendRequest && !collaboration) return json({ error: "Recipient is not connected" }, 403);

  const { data: preferences } = await admin.from("notification_preferences").select("encouragement").eq("user_id", payload.recipientId).maybeSingle();
  if (preferences && !preferences.encouragement) return json({ delivered: 0, reason: "recipient_preferences" });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin.from("notification_deliveries").select("id", { count: "exact", head: true })
    .eq("sender_id", user.id).eq("recipient_id", payload.recipientId).gte("created_at", since);
  if ((count ?? 0) >= 10) return json({ error: "Notification rate limit reached" }, 429);
  await admin.from("notification_deliveries").insert({ sender_id: user.id, recipient_id: payload.recipientId });

  const { data: tokens } = await admin.from("push_tokens").select("expo_push_token").eq("user_id", payload.recipientId).eq("enabled", true);
  if (!tokens?.length) return json({ delivered: 0 });
  const messages = tokens.map(({ expo_push_token }) => ({
    to: expo_push_token,
    sound: "default",
    title: payload.title.slice(0, 80),
    body: payload.body.slice(0, 180),
    data: { screen: payload.screen ?? "friends" }
  }));
  const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(messages)
  });
  if (!pushResponse.ok) return json({ error: "Push provider rejected the request" }, 502);
  const pushResult = await pushResponse.json() as { data?: Array<{ status: string; details?: { error?: string } }> };
  const invalidTokens = tokens.filter((_, index) => pushResult.data?.[index]?.details?.error === "DeviceNotRegistered").map((token) => token.expo_push_token);
  if (invalidTokens.length) await admin.from("push_tokens").update({ enabled: false }).in("expo_push_token", invalidTokens);
  return json({ delivered: messages.length });
});

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
