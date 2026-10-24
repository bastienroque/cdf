import { db } from "@/db";
import { ingredients, tags, restaurants, reviews, users } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RestaurantHeader } from "@/components/public/restaurant/restaurant-header";
import { RestaurantGallery } from "@/components/public/restaurant/restaurant-gallery";
import { RestaurantInfo } from "@/components/public/restaurant/restaurant-info";
import {
  RestaurantReviews,
  type FormattedReview,
} from "@/components/public/restaurant/restaurant-reviews";
import { EXPERIENCE_LABELS } from "@/lib/restaurant-labels";

const priceLabels = ["€", "€€", "€€€", "€€€€"];

async function getRestaurant(slug: string) {
  const [restaurant] = await db
    .select()
    .from(restaurants)
    .where(and(eq(restaurants.slug, slug), eq(restaurants.status, "published")))
    .limit(1);
  return restaurant ?? null;
}

// Define rigid types matching our JSONB schemas
interface IngredientEvaluationItem {
  ingredientId?: string;
  ingredient_id?: string;
  score: number;
  tagIds?: string[];
  tag_ids?: string[];
}

interface ExperienceScoreItem {
  key?: string;
  id?: string;
  category?: string;
  label?: string;
  name?: string;
  score: number;
}

async function getRestaurantReviews(
  restaurantId: string,
): Promise<FormattedReview[]> {
  const reviewRows = await db
    .select({
      id: reviews.id,
      text: reviews.text,
      photos: reviews.photos,
      isOfficial: reviews.isOfficial,
      visitDate: reviews.visitDate,
      authorName: users.display_name,
      ingredientEvaluations: reviews.ingredientEvaluations,
      experienceScores: reviews.experienceScores,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.authorFk, users.id))
    .where(
      and(
        eq(reviews.restaurantFk, restaurantId),
        eq(reviews.status, "published"),
      ),
    )
    .orderBy(desc(reviews.createdAt));

  // 1. Extract unique ingredient UUIDs
  const allIngredientIds = Array.from(
    new Set(
      reviewRows.flatMap((r) => {
        const evals =
          (r.ingredientEvaluations as IngredientEvaluationItem[]) || [];
        return evals
          .map((i) => i.ingredientId || i.ingredient_id)
          .filter((id): id is string => Boolean(id));
      }),
    ),
  );

  // 2. Extract unique tag UUIDs
  const allTagIds = Array.from(
    new Set(
      reviewRows.flatMap((r) => {
        const evals =
          (r.ingredientEvaluations as IngredientEvaluationItem[]) || [];
        return evals
          .flatMap((i) => i.tagIds || i.tag_ids || [])
          .filter((id): id is string => Boolean(id));
      }),
    ),
  );

  // Batch fetch ingredient details
  const ingredientMap = new Map<string, string>();
  if (allIngredientIds.length > 0) {
    const ingredientList = await db
      .select({ id: ingredients.id, namePt: ingredients.namePt })
      .from(ingredients)
      .where(inArray(ingredients.id, allIngredientIds));

    ingredientList.forEach((ing) => {
      ingredientMap.set(ing.id, ing.namePt);
    });
  }

  // Batch fetch tag details
  const tagMap = new Map<string, string>();
  if (allTagIds.length > 0) {
    const tagList = await db
      .select({ id: tags.id, namePt: tags.namePt })
      .from(tags)
      .where(inArray(tags.id, allTagIds));

    tagList.forEach((t) => {
      tagMap.set(t.id, t.namePt);
    });
  }

  return reviewRows.map((r) => {
    const evaluations =
      (r.ingredientEvaluations as IngredientEvaluationItem[]) || [];

    // Map JSONB evaluations to scores and associated tags
    const ingredientScores = evaluations.map((evalItem) => {
      const ingId = evalItem.ingredientId || evalItem.ingredient_id || "";
      const rawTagIds = evalItem.tagIds || evalItem.tag_ids || [];

      const label = ingredientMap.get(ingId) ?? "Ingrediente";
      const tagNames = rawTagIds
        .map((tid: string) => tagMap.get(tid))
        .filter((name: string | undefined): name is string => Boolean(name));

      return {
        label,
        score: Number(evalItem.score) || 0,
        tags: tagNames,
      };
    });

    // Map Experience Matrix scores from JSONB (handles both Array and Object forms)
    const rawExperiences = r.experienceScores;
    const experienceScores: { label: string; score: number }[] = [];

    if (Array.isArray(rawExperiences)) {
      (rawExperiences as ExperienceScoreItem[]).forEach((exp) => {
        const rawKey =
          exp.key || exp.id || exp.category || exp.label || exp.name;
        if (!rawKey) return;

        const labelKey = rawKey as keyof typeof EXPERIENCE_LABELS;
        const label = EXPERIENCE_LABELS[labelKey] || rawKey;
        const score = Number(exp.score);

        if (score > 0) {
          experienceScores.push({
            label,
            score,
          });
        }
      });
    } else if (rawExperiences && typeof rawExperiences === "object") {
      Object.entries(rawExperiences as Record<string, unknown>).forEach(
        ([key, val]) => {
          const score = Number(val);
          if (score > 0) {
            const labelKey = key as keyof typeof EXPERIENCE_LABELS;
            const label = EXPERIENCE_LABELS[labelKey] || key;
            experienceScores.push({ label, score });
          }
        },
      );
    }

    return {
      id: r.id,
      text: r.text,
      photos: r.photos ?? [],
      isOfficial: r.isOfficial,
      visitDate: r.visitDate,
      authorName: r.authorName,
      ingredientScores,
      experienceScores,
    };
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) return {};

  const title = `${restaurant.name} — Cavaleiros da Francesinha`;
  const ratingText = restaurant.avgScore
    ? ` Rating: ${restaurant.avgScore}/10.`
    : "";
  const description = `Francesinha in ${restaurant.city}.${ratingText}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images:
        restaurant.photos && restaurant.photos[0] ? [restaurant.photos[0]] : [],
      type: "website",
    },
  };
}

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const restaurant = await getRestaurant(slug);

  if (!restaurant) notFound();

  const [restaurantReviews, t] = await Promise.all([
    getRestaurantReviews(restaurant.id),
    getTranslations("public.restaurantDetails"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: restaurant.lat,
      longitude: restaurant.lng,
    },
    telephone: restaurant.phone ?? undefined,
    url: restaurant.website ?? undefined,
    priceRange: priceLabels[restaurant.priceRange - 1],
    image: restaurant.photos ?? [],
  };

  const metaLine = `${restaurant.city} · ${
    priceLabels[restaurant.priceRange - 1]
  }${restaurant.avgScore ? ` · ${restaurant.avgScore}/10` : ""}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <RestaurantHeader
        name={restaurant.name}
        metaLine={metaLine}
        verifiedLabel={t("verifiedTag")}
      />

      <RestaurantGallery photos={restaurant.photos} name={restaurant.name} />

      <RestaurantInfo
        address={restaurant.address}
        phone={restaurant.phone}
        website={restaurant.website}
        lat={Number(restaurant.lat)}
        lng={Number(restaurant.lng)}
        name={restaurant.name}
        labels={{
          coordinatesHeader: t("coordinatesHeader"),
          noPhone: t("noPhone"),
          visitPortal: t("visitPortal"),
          noWebsite: t("noWebsite"),
        }}
      />

      <RestaurantReviews
        reviews={restaurantReviews}
        labels={{
          decreesHeader: t("decreesHeader"),
          recordsBadge: t("recordsBadge", { count: restaurantReviews.length }),
          noDecrees: t("noDecrees"),
          officialDecree: t("officialDecree"),
          communityScroll: t("communityScroll"),
        }}
      />
    </div>
  );
}
