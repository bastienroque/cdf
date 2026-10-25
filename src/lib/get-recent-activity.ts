import { db } from "@/db";
import { restaurants, reviews } from "@/db/schema";
import { eq, desc, and, isNotNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getTopRestaurants = unstable_cache(
  async () => {
    return await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        city: restaurants.city,
        priceRange: restaurants.priceRange,
        avgScore: restaurants.avgScore,
        photos: restaurants.photos,
      })
      .from(restaurants)
      .where(
        and(
          eq(restaurants.status, "published"),
          isNotNull(restaurants.avgScore),
        ),
      )
      .orderBy(desc(restaurants.avgScore))
      .limit(6);
  },
  ["top-restaurants-homepage"],
  { revalidate: 300, tags: ["restaurants"] },
);

export const getRecentReviews = unstable_cache(
  async () => {
    return await db
      .select({
        id: reviews.id,
        text: reviews.text,
        isOfficial: reviews.isOfficial,
        createdAt: reviews.createdAt,
        restaurantName: restaurants.name,
        restaurantSlug: restaurants.slug,
      })
      .from(reviews)
      .innerJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
      .where(eq(reviews.status, "published"))
      .orderBy(desc(reviews.createdAt))
      .limit(5);
  },
  ["recent-reviews-homepage"],
  { revalidate: 60, tags: ["reviews"] },
);
