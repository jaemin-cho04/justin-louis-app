import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (request) => {
  if (request.method !== "POST") return response({ error: "Method not allowed" }, 405);
  const authorization = request.headers.get("Authorization");
  if (!authorization) return response({ error: "Authentication required" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const publicKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const userClient = createClient(url, publicKey, { global: { headers: { Authorization: authorization } } });
  const admin = createClient(url, serviceKey);
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return response({ error: "Authentication required" }, 401);
  const issuedAt = tokenIssuedAt(authorization);
  if (!issuedAt || Date.now() / 1000 - issuedAt > 10 * 60) {
    return response({ error: "Sign in again before deleting your account" }, 403);
  }

  const { data: media } = await admin.from("media_objects").select("storage_path").eq("owner_id", user.id);
  const paths = (media ?? []).map((item: { storage_path: string }) => item.storage_path);
  for (let index = 0; index < paths.length; index += 100) {
    const { error: storageError } = await admin.storage.from("progress-media").remove(paths.slice(index, index + 100));
    if (storageError) return response({ error: "Stored media deletion failed" }, 500);
  }
  await admin.from("security_events").insert({ user_id: user.id, event_type: "account_deleted" });
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return response({ error: "Account deletion failed" }, 500);
  return response({ deleted: true });
});

function response(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function tokenIssuedAt(authorization: string): number | undefined {
  try {
    const payload = authorization.replace(/^Bearer\s+/i, "").split(".")[1];
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))).iat;
  } catch { return undefined; }
}
