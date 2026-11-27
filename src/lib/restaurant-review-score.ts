import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Works with either the main db or a transaction handle
type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

type ScoreItem = { score?: unknown };

// Every rated component of one review: each ingredient (0 = not included,
// left out), plus the experience scores. All components weigh the same.
export function reviewComponents(
  ingredientEvaluations: unknown,
  experienceScores: unknown,
): number[] {
  const values: number[] = [];
  const add = (v: unknown) => {
    const n = typeof v === "number" ? v : Number(v);
    if (Number.isFinite(n) && n > 0) values.push(n);
  };

  if (Array.isArray(ingredientEvaluations)) {
    (ingredientEvaluations as ScoreItem[]).forEach((item) => add(item?.score));
  }
  if (Array.isArray(experienceScores)) {
    (experienceScores as ScoreItem[]).forEach((item) => add(item?.score));
  } else if (experienceScores && typeof experienceScores === "object") {
    Object.values(experienceScores as Record<string, unknown>).forEach(add);
  }
  return values;
}

// One review's score: the plain average of its components (null if none).
export function reviewScore(
  ingredientEvaluations: unknown,
  experienceScores: unknown,
): number | null {
  const values = reviewComponents(ingredientEvaluations, experienceScores);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function average(scores: number[]): string | null {
  if (scores.length === 0) return null;
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
}

/**
 * Recomputes a restaurant's two scores from its published reviews:
 * - avgScore / reviewCount: the Knights' score (official reviews), which
 *   drives the ranking
 * - communityAvgScore / communityReviewCount: members' reviews, shown beside
 *   it and never used for the ranking
 * Each score is the average of review scores, so a review that rates more
 * ingredients does not count more than one that rates fewer.
 */
export async function recalculateRestaurantAvgScore(
  restaurantId: string,
  executor: DbOrTx = db,
) {
  // Using `executor` (the transaction when provided) means uncommitted changes
  // made earlier in the same transaction are visible here.
  const publishedReviews = await executor
    .select({
      isOfficial: reviews.isOfficial,
      ingredientEvaluations: reviews.ingredientEvaluations,
      experienceScores: reviews.experienceScores,
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.restaurantFk, restaurantId),
        eq(reviews.status, "published"),
      ),
    );

  const knights: number[] = [];
  const community: number[] = [];
  for (const rev of publishedReviews) {
    const score = reviewScore(rev.ingredientEvaluations, rev.experienceScores);
    if (score === null) continue;
    (rev.isOfficial ? knights : community).push(score);
  }

  await executor
    .update(restaurants)
    .set({
      avgScore: average(knights),
      reviewCount: knights.length,
      communityAvgScore: average(community),
      communityReviewCount: community.length,
    })
    .where(eq(restaurants.id, restaurantId));
}
