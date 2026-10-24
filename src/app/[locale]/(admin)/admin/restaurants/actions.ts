"use server";

import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import {
  restaurantSchema,
  type RestaurantFormValues,
} from "@/lib/validations/restaurant";
import { generateUniqueSlug } from "@/lib/slugify";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logApiUsage } from "@/lib/log-api-usage";

export async function upsertRestaurant(
  id: string | null,
  values: RestaurantFormValues,
) {
  await requireAdmin();
  const parsed = restaurantSchema.parse(values);

  const dbValues = {
    ...parsed,
    lat: parsed.lat.toString(),
    lng: parsed.lng.toString(),
  };

  if (id) {
    // 1. Fetch existing photos to check for deletions
    const [existing] = await db
      .select({ photos: restaurants.photos })
      .from(restaurants)
      .where(eq(restaurants.id, id))
      .limit(1);

    const oldPhotos = existing?.photos ?? [];
    const newPhotos = parsed.photos ?? [];
    const removedPhotos = oldPhotos.filter((url) => !newPhotos.includes(url));

    // 2. Delete removed images from Supabase storage
    if (removedPhotos.length > 0) {
      const supabase = await createClient();
      const filePaths = removedPhotos
        .map((url) => {
          try {
            const parsedUrl = new URL(url);
            const parts = parsedUrl.pathname.split("/restaurant-photos/");
            return parts[1];
          } catch {
            return null;
          }
        })
        .filter((p): p is string => Boolean(p));

      if (filePaths.length > 0) {
        await supabase.storage.from("restaurant-photos").remove(filePaths);
      }
    }

    const slug = await generateUniqueSlug(parsed.name, id);
    await db
      .update(restaurants)
      .set({ ...dbValues, slug })
      .where(eq(restaurants.id, id));
  } else {
    const slug = await generateUniqueSlug(parsed.name);
    await db.insert(restaurants).values({ ...dbValues, slug });
    await logApiUsage("google_places");
  }

  revalidatePath("/admin/restaurants");
  redirect("/admin/restaurants");
}

export async function deleteRestaurant(id: string) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    // 1. Delete dependent reviews first to satisfy foreign key constraints
    await tx.delete(reviews).where(eq(reviews.restaurantFk, id));

    // 2. Delete the restaurant
    await tx.delete(restaurants).where(eq(restaurants.id, id));
  });

  revalidatePath("/admin/restaurants");
}
