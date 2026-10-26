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

type ParsedReview = ReturnType<typeof reviewSchema.parse>;

type CatalogType = "ingredient" | "tag";

type CatalogFormData = {
  category: string;
  namePt: string;
  nameEn?: string;
  nameFr?: string;
  createdLanguage?: "pt" | "en" | "fr";
};

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

// Invalidates everything that displays restaurant scores.
// - updateTag busts unstable_cache entries tagged "restaurants" (homepage top list).
//   If updateTag isn't available in your Next version, use revalidateTag("restaurants", "max").
// - revalidatePath("/[locale]", "layout") covers localized pages (home, restaurants, leaderboard).
function revalidateScoreCaches() {
  updateTag("restaurants");
  revalidatePath("/admin/reviews");
  revalidatePath("/[locale]", "layout");
}

function revalidateAdminCatalog() {
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/reviews");
}

function getCatalogTable(type: CatalogType) {
  return type === "ingredient" ? ingredients : tags;
}

// Returns `base`, or `base-2`, `base-3`... if the slug is already taken
function pickUniqueSlug(base: string, existing: { slug: string }[]): string {
  const taken = new Set(existing.map((item) => item.slug));
  if (!taken.has(base)) return base;

  let counter = 2;
  while (taken.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}

async function generateUniqueIngredientSlug(name: string): Promise<string> {
  const base = slugify(name);
  const existing = await db
    .select({ slug: ingredients.slug })
    .from(ingredients)
    .where(like(ingredients.slug, `${base}%`));

  return pickUniqueSlug(base, existing);
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

  return pickUniqueSlug(base, existing);
}

// Fields shared by createReview and updateReview
function buildReviewFields(parsed: ParsedReview) {
  return {
    restaurantFk: parsed.restaurantId,
    status: "published" as const, // admin-created and admin-edited reviews are published
    visitDate: parsed.visitDate ?? null,
    pricePaid: parsed.pricePaid?.toString() ?? null,
    francesinhaType: parsed.francesinhaType ?? null,
    text: parsed.text ?? null,
    photos: parsed.photos ?? [],
    ingredientEvaluations: parsed.reviewIngredients?.map((item) => ({
      ingredientId: item.ingredientId || "",
      score: item.score ?? 0,
      tagIds: item.tagIds || [],
    })),
    experienceScores: [
      { key: "service", score: parsed.scoreService || 0 },
      { key: "digestion", score: parsed.scoreDigestion || 0 },
      { key: "vibe", score: parsed.scoreVibe || 0 },
    ],
  };
}

// Shared by approveReview and rejectReview: change the status and keep the
// restaurant score in sync, atomically.
async function setReviewStatus(
  reviewId: string,
  status: "published" | "rejected",
) {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(reviews)
      .set({ status })
      .where(eq(reviews.id, reviewId))
      .returning({
        id: reviews.id,
        authorFk: reviews.authorFk,
        restaurantFk: reviews.restaurantFk,
      });

    // Publishing adds the review to the score; rejecting a published one removes it
    if (row) {
      await recalculateRestaurantAvgScore(row.restaurantFk, tx);
    }
    return row;
  });
}

// Shared by createIngredientInline and createTagInline
async function createCatalogItemInline(
  type: CatalogType,
  formData: CatalogFormData,
) {
  await requireAdmin();
  const validated = catalogItemSchema.safeParse(formData);

  if (!validated.success) {
    return {
      success: false,
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { category, namePt, nameEn, nameFr, createdLanguage } = validated.data;
  const slug =
    type === "ingredient"
      ? await generateUniqueIngredientSlug(namePt)
      : await generateUniqueTagSlug(category, namePt);

  try {
    const [newItem] = await db
      .insert(getCatalogTable(type))
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
    console.error(`Failed to create ${type} inline:`, error);
    return { success: false, message: `Failed to create ${type}.` };
  }
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function createReview(values: ReviewFormValues) {
  const adminId = await requireAdmin();
  const parsed = reviewSchema.parse(values);
  const fields = buildReviewFields(parsed);

  await db.transaction(async (tx) => {
    await tx
      .insert(reviews)
      .values({ ...fields, authorFk: adminId, isOfficial: true });

    // Pass tx so the recalculation sees the uncommitted insert
    await recalculateRestaurantAvgScore(parsed.restaurantId, tx);
  });

  revalidateScoreCaches();
  redirect("/admin/reviews");
}

export async function updateReview(reviewId: string, values: ReviewFormValues) {
  await requireAdmin();
  const parsed = reviewSchema.parse(values);
  const fields = buildReviewFields(parsed);

  await db.transaction(async (tx) => {
    // Remember the previous restaurant in case the review is moved to another one
    const [previous] = await tx
      .select({ restaurantFk: reviews.restaurantFk })
      .from(reviews)
      .where(eq(reviews.id, reviewId));

    await tx.update(reviews).set(fields).where(eq(reviews.id, reviewId));

    await recalculateRestaurantAvgScore(parsed.restaurantId, tx);

    if (previous && previous.restaurantFk !== parsed.restaurantId) {
      await recalculateRestaurantAvgScore(previous.restaurantFk, tx);
    }
  });

  revalidateScoreCaches();
  redirect("/admin/reviews");
}

export async function approveReview(reviewId: string) {
  await requireAdmin();

  const updated = await setReviewStatus(reviewId, "published");

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

  const updated = await setReviewStatus(reviewId, "rejected");

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

// ---------------------------------------------------------------------------
// Catalog (ingredients and tags)
// ---------------------------------------------------------------------------

export async function createIngredientInline(formData: CatalogFormData) {
  return createCatalogItemInline("ingredient", formData);
}

export async function createTagInline(formData: CatalogFormData) {
  return createCatalogItemInline("tag", formData);
}

export async function updateCatalogTranslation(
  type: CatalogType,
  id: string,
  data: {
    namePt: string;
    nameEn?: string | null;
    nameFr?: string | null;
  },
) {
  await requireAdmin();

  const isComplete = Boolean(data.namePt && data.nameEn && data.nameFr);
  const targetTable = getCatalogTable(type);

  await db
    .update(targetTable)
    .set({
      namePt: data.namePt,
      nameEn: data.nameEn || null,
      nameFr: data.nameFr || null,
      translationStatus: isComplete ? "complete" : "pending",
    })
    .where(eq(targetTable.id, id));

  revalidateAdminCatalog();
  return { success: true };
}

export async function deleteCatalogItem(type: CatalogType, id: string) {
  await requireAdmin();

  const targetTable = getCatalogTable(type);
  await db.delete(targetTable).where(eq(targetTable.id, id));

  revalidateAdminCatalog();
  return { success: true };
}
