"use client";

import { createClient } from "@/lib/supabase/client";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 2 * 1024 * 1024; // matches the bucket limit (2 MB)

export async function uploadToStorage(
  bucket: string,
  file: File,
): Promise<string> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Only JPEG, PNG or WebP images can be uploaded.");
  if (file.size > MAX_BYTES) throw new Error("Images must be 2 MB or smaller.");

  // Random name + known extension: the original file name never reaches storage.
  const path = `${crypto.randomUUID()}.${ext}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
