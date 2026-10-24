"use client";

import { createClient } from "@/lib/supabase/client";

export async function uploadRestaurantPhoto(file: File): Promise<string> {
  const supabase = createClient();
  const path = `${crypto.randomUUID()}-${file.name}`;

  const { error } = await supabase.storage
    .from("restaurant-photos")
    .upload(path, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from("restaurant-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}
