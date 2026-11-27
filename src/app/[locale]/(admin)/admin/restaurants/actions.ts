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
import { storagePathsFromUrls } from "@/lib/storage-paths";
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
      const filePaths = storagePathsFromUrls("restaurant-photos", removedPhotos);
      if (filePaths.length > 0) {
        const supabase = await createClient();
        await supabase.storage.from("restaurant-photos").remove(filePaths);
      }
    }

    // The slug is set once at creation and never changes, so shared links
    // and search results keep working after a rename.
    await db.update(restaurants).set(dbValues).where(eq(restaurants.id, id));
  } else {
    const slug = await generateUniqueSlug(parsed.name);
    await db.insert(restaurants).values({ ...dbValues, slug });
  }

  revalidatePath("/admin/restaurants");
  revalidatePath("/[locale]", "layout");
  redirect("/admin/restaurants");
}

export async function deleteRestaurant(id: string) {
  await requireAdmin();

  // Collect photo URLs before the rows disappear
  const [restaurant] = await db
    .select({ photos: restaurants.photos })
    .from(restaurants)
    .where(eq(restaurants.id, id))
    .limit(1);
  const reviewRows = await db
    .select({ photos: reviews.photos })
    .from(reviews)
    .where(eq(reviews.restaurantFk, id));

  await db.transaction(async (tx) => {
    // 1. Delete dependent reviews first to satisfy foreign key constraints
    await tx.delete(reviews).where(eq(reviews.restaurantFk, id));

    // 2. Delete the restaurant
    await tx.delete(restaurants).where(eq(restaurants.id, id));
  });

  // 3. Remove the photos from storage (after the database delete succeeded)
  const supabase = await createClient();
  const restaurantPaths = storagePathsFromUrls("restaurant-photos", restaurant?.photos ?? []);
  const reviewPaths = storagePathsFromUrls(
    "review-photos",
    reviewRows.flatMap((r) => r.photos ?? []),
  );
  if (restaurantPaths.length > 0) {
    await supabase.storage.from("restaurant-photos").remove(restaurantPaths);
  }
  if (reviewPaths.length > 0) {
    await supabase.storage.from("review-photos").remove(reviewPaths);
  }

  revalidatePath("/admin/restaurants");
  revalidatePath("/[locale]", "layout");
}

// Called by the address search after each Google Places details request,
// so the dashboard counts real Places calls.
export async function recordPlacesLookup() {
  await requireAdmin();
  await logApiUsage("google_places");
}
