"use server";

import { db } from "@/db";
import { reviews, ingredients, tags } from "@/db/schema";
import { reviewSchema, type ReviewFormValues } from "@/lib/validations/review";
import { catalogItemSchema } from "@/lib/validations/catalog";
import { requireAdmin } from "@/lib/auth/admin";
import { eq, like } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import {
  sendReviewApprovedEmail,
  sendReviewRejectedEmail,
} from "@/lib/send-review-email";
import { slugify } from "@/lib/slugify";
import { recalculateRestaurantAvgScore } from "@/lib/restaurant-review-score";

// Invalidates everything that displays restaurant scores.
// - updateTag busts unstable_cache entries tagged "restaurants" (homepage top list).
//   If updateTag isn't available in your Next version, use revalidateTag("restaurants", "max").
// - revalidatePath("/[locale]", "layout") covers localized pages (home, restaurants, leaderboard).
function revalidateScoreCaches() {
  updateTag("restaurants");
  revalidatePath("/admin/reviews");
  revalidatePath("/[locale]", "layout");
}

async function generateUniqueIngredientSlug(name: string): Promise<string> {
  const base = slugify(name);
  const existing = await db
    .select({ slug: ingredients.slug })
    .from(ingredients)
    .where(like(ingredients.slug, `${base}%`));

  const taken = new Set(existing.map((item) => item.slug));
  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

async function generateUniqueTagSlug(
  category: string,
  name: string,
): Promise<string> {
  const base = `${category}-${slugify(name)}`;
  const existing = await db
    .select({ slug: tags.slug })
    .from(tags)
    .where(like(tags.slug, `${base}%`));

  const taken = new Set(existing.map((item) => item.slug));
  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

export async function createReview(values: ReviewFormValues) {
  const adminId = await requireAdmin();
  const parsed = reviewSchema.parse(values);

  const ingredientEvaluations = parsed.reviewIngredients?.map((item) => ({
    ingredientId: item.ingredientId || "",
    score: item.score ?? 0,
    tagIds: item.tagIds || [],
  }));

  const experienceScores = [
    { key: "service", score: parsed.scoreService || 0 },
    { key: "digestion", score: parsed.scoreDigestion || 0 },
    { key: "vibe", score: parsed.scoreVibe || 0 },
  ];

  await db.transaction(async (tx) => {
    await tx.insert(reviews).values({
      restaurantFk: parsed.restaurantId,
      authorFk: adminId,
      isOfficial: true,
      status: "published" as const,
      visitDate: parsed.visitDate ?? null,
      pricePaid: parsed.pricePaid?.toString() ?? null,
      francesinhaType: parsed.francesinhaType ?? null,
      text: parsed.text ?? null,
      photos: parsed.photos ?? [],
      ingredientEvaluations,
      experienceScores,
    });

    // Pass tx so the recalculation sees the uncommitted insert
    await recalculateRestaurantAvgScore(parsed.restaurantId, tx);
  });

  revalidateScoreCaches();
  redirect("/admin/reviews");
}

export async function updateReview(reviewId: string, values: ReviewFormValues) {
  await requireAdmin();
  const parsed = reviewSchema.parse(values);

  const ingredientEvaluations = parsed.reviewIngredients?.map((item) => ({
    ingredientId: item.ingredientId || "",
    score: item.score ?? 0,
    tagIds: item.tagIds || [],
  }));

  const experienceScores = [
    { key: "service", score: parsed.scoreService || 0 },
    { key: "digestion", score: parsed.scoreDigestion || 0 },
    { key: "vibe", score: parsed.scoreVibe || 0 },
  ];

  await db.transaction(async (tx) => {
    // Remember the previous restaurant in case the review is moved to another one
    const [previous] = await tx
      .select({ restaurantFk: reviews.restaurantFk })
      .from(reviews)
      .where(eq(reviews.id, reviewId));

    await tx
      .update(reviews)
      .set({
        restaurantFk: parsed.restaurantId,
        status: "published" as const,
        visitDate: parsed.visitDate ?? null,
        pricePaid: parsed.pricePaid?.toString() ?? null,
        francesinhaType: parsed.francesinhaType ?? null,
        text: parsed.text ?? null,
        photos: parsed.photos ?? [],
        ingredientEvaluations,
        experienceScores,
      })
      .where(eq(reviews.id, reviewId));

    await recalculateRestaurantAvgScore(parsed.restaurantId, tx);

    if (previous && previous.restaurantFk !== parsed.restaurantId) {
      await recalculateRestaurantAvgScore(previous.restaurantFk, tx);
    }
  });

  revalidateScoreCaches();
  redirect("/admin/reviews");
}

export async function createIngredientInline(formData: {
  category: string;
  namePt: string;
  nameEn?: string;
  nameFr?: string;
  createdLanguage?: "pt" | "en" | "fr";
}) {
  await requireAdmin();
  const validated = catalogItemSchema.safeParse(formData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { category, namePt, nameEn, nameFr, createdLanguage } = validated.data;
  const slug = await generateUniqueIngredientSlug(namePt);

  try {
    const [newItem] = await db
      .insert(ingredients)
      .values({
        category,
        slug,
        namePt,
        nameEn: nameEn || null,
        nameFr: nameFr || null,
        createdLanguage: createdLanguage || "pt",
        translationStatus: nameEn && nameFr ? "complete" : "pending",
      })
      .returning();

    revalidatePath("/admin/reviews/new");
    return { success: true, data: newItem };
  } catch (error) {
    console.error("Failed to create ingredient inline:", error);
    return { success: false, message: "Failed to create ingredient." };
  }
}

export async function createTagInline(formData: {
  category: string;
  namePt: string;
  nameEn?: string;
  nameFr?: string;
  createdLanguage?: "pt" | "en" | "fr";
}) {
  await requireAdmin();
  const validated = catalogItemSchema.safeParse(formData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { category, namePt, nameEn, nameFr, createdLanguage } = validated.data;
  const slug = await generateUniqueTagSlug(category, namePt);

  try {
    const [newItem] = await db
      .insert(tags)
      .values({
        category,
        slug,
        namePt,
        nameEn: nameEn || null,
        nameFr: nameFr || null,
        createdLanguage: createdLanguage || "pt",
        translationStatus: nameEn && nameFr ? "complete" : "pending",
      })
      .returning();

    revalidatePath("/admin/reviews/new");
    return { success: true, data: newItem };
  } catch (error) {
    console.error("Failed to create tag inline:", error);
    return { success: false, message: "Failed to create tag." };
  }
}

export async function approveReview(reviewId: string) {
  await requireAdmin();

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(reviews)
      .set({ status: "published" })
      .where(eq(reviews.id, reviewId))
      .returning({
        id: reviews.id,
        authorFk: reviews.authorFk,
        restaurantFk: reviews.restaurantFk,
      });

    if (row) {
      await recalculateRestaurantAvgScore(row.restaurantFk, tx);
    }
    return row;
  });

  if (updated) {
    // NOTE: this URL uses the restaurant ID, but public routes use the slug.
    // Select the restaurant's slug and use it here so the email link doesn't 404.
    const reviewUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/restaurants/${updated.restaurantFk}#review-${updated.id}`;
    await sendReviewApprovedEmail(updated.authorFk, reviewUrl);
  }

  revalidateScoreCaches();
}

export async function rejectReview(reviewId: string) {
  await requireAdmin();

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(reviews)
      .set({ status: "rejected" })
      .where(eq(reviews.id, reviewId))
      .returning({
        id: reviews.id,
        authorFk: reviews.authorFk,
        restaurantFk: reviews.restaurantFk,
      });

    // A previously published review must stop counting towards the score
    if (row) {
      await recalculateRestaurantAvgScore(row.restaurantFk, tx);
    }
    return row;
  });

  if (updated) {
    await sendReviewRejectedEmail(updated.authorFk);
  }

  revalidateScoreCaches();
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();

  await db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(reviews)
      .where(eq(reviews.id, reviewId))
      .returning({ restaurantFk: reviews.restaurantFk });

    if (deleted) {
      await recalculateRestaurantAvgScore(deleted.restaurantFk, tx);
    }
  });

  revalidateScoreCaches();
}

export async function updateCatalogTranslation(
  type: "ingredient" | "tag",
  id: string,
  data: {
    namePt: string;
    nameEn?: string | null;
    nameFr?: string | null;
  },
) {
  await requireAdmin();

  const isComplete = Boolean(data.namePt && data.nameEn && data.nameFr);
  const targetTable = type === "ingredient" ? ingredients : tags;

  await db
    .update(targetTable)
    .set({
      namePt: data.namePt,
      nameEn: data.nameEn || null,
      nameFr: data.nameFr || null,
      translationStatus: isComplete ? "complete" : "pending",
    })
    .where(eq(targetTable.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteCatalogItem(
  type: "ingredient" | "tag",
  id: string,
) {
  await requireAdmin();

  const targetTable = type === "ingredient" ? ingredients : tags;
  await db.delete(targetTable).where(eq(targetTable.id, id));

  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reviews");
  return { success: true };
}
