"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadToStorage(
  bucket: string,
  file: File,
): Promise<string> {
  const supabase = createClient();
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
