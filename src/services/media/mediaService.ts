import { getSupabaseClient } from "../remote/supabaseClient";

const BUCKET = "progress-media";

export type PrivateImage = { uri: string; storagePath: string };

export async function uploadPrivateImage(userId: string, uri: string, purpose: "profile" | "log" | "reflection" = "profile"): Promise<PrivateImage> {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("The selected image could not be read.");
  const body = await response.arrayBuffer();
  if (body.byteLength > 10 * 1024 * 1024) throw new Error("Choose an image smaller than 10 MB.");
  const mimeType = response.headers.get("content-type") || inferMimeType(uri);
  const extension = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${purpose}/${Date.now()}-${randomSuffix()}.${extension}`;
  const client = getSupabaseClient();
  const { error: uploadError } = await client.storage.from(BUCKET).upload(path, body, { contentType: mimeType, upsert: false });
  if (uploadError) throw new Error(uploadError.message);
  const { error: recordError } = await client.from("media_objects").insert({
    owner_id: userId, storage_path: path, mime_type: mimeType, byte_size: body.byteLength
  });
  if (recordError) {
    await client.storage.from(BUCKET).remove([path]);
    throw new Error(recordError.message);
  }
  const { data, error: signedError } = await client.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 7);
  if (signedError) throw new Error(signedError.message);
  return { uri: data.signedUrl, storagePath: path };
}

export async function createPrivateImageUrl(storagePath: string): Promise<string> {
  const { data, error } = await getSupabaseClient().storage.from(BUCKET).createSignedUrl(storagePath, 60 * 60 * 24 * 7);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deletePrivateImage(storagePath: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error(error.message);
  const { error: recordError } = await client.from("media_objects").delete().eq("storage_path", storagePath);
  if (recordError) throw new Error(recordError.message);
}

function inferMimeType(uri: string): string {
  if (/\.png(?:\?|$)/i.test(uri)) return "image/png";
  if (/\.webp(?:\?|$)/i.test(uri)) return "image/webp";
  return "image/jpeg";
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}
