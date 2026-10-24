import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface IngredientEvalJSON {
  score?: number;
}

interface ExperienceScoreJSON {
  score?: number;
}

export async function recalculateRestaurantAvgScore(restaurantId: string) {
  // Fetch all published reviews for this restaurant
  const publishedReviews = await db
    .select({
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

  if (publishedReviews.length === 0) {
    // If no published reviews exist, set avgScore to null
    await db
      .update(restaurants)
      .set({ avgScore: null })
      .where(eq(restaurants.id, restaurantId));
    return;
  }

  let totalScoreSum = 0;
  let totalScoreCount = 0;

  publishedReviews.forEach((rev) => {
    // 1. Accumulate ingredient evaluation scores
    const ingEvals = (rev.ingredientEvaluations as IngredientEvalJSON[]) || [];
    ingEvals.forEach((item) => {
      if (typeof item.score === "number" && item.score > 0) {
        totalScoreSum += item.score;
        totalScoreCount++;
      }
    });

    // 2. Accumulate experience scores (Array or Object)
    const expScores = rev.experienceScores;
    if (Array.isArray(expScores)) {
      (expScores as ExperienceScoreJSON[]).forEach((item) => {
        if (typeof item.score === "number" && item.score > 0) {
          totalScoreSum += item.score;
          totalScoreCount++;
        }
      });
    } else if (expScores && typeof expScores === "object") {
      Object.values(expScores as Record<string, unknown>).forEach((val) => {
        const num = Number(val);
        if (num > 0) {
          totalScoreSum += num;
          totalScoreCount++;
        }
      });
    }
  });

  const avgScore =
    totalScoreCount > 0 ? (totalScoreSum / totalScoreCount).toFixed(1) : null;

  // Update restaurant avg_score in database
  await db
    .update(restaurants)
    .set({ avgScore })
    .where(eq(restaurants.id, restaurantId));
}
