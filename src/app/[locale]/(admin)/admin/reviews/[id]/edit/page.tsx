import { ReviewForm } from "@/components/admin/review/review-form";
import { db } from "@/db";
import { reviews, restaurants, ingredients, tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Edit3 } from "lucide-react";

interface IngredientEvalJSON {
  ingredientId?: string;
  ingredient_id?: string;
  score?: number | null;
  isNotIncluded?: boolean;
  tagIds?: string[];
  tag_ids?: string[];
}

interface ExperienceScoreJSON {
  key?: string;
  score?: number;
}

interface EditReviewPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditReviewPage({ params }: EditReviewPageProps) {
  const { locale, id } = await params;
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) notFound();

  const [restaurantOptions, ingredientOptions, tagOptions, t] =
    await Promise.all([
      db
        .select({ id: restaurants.id, name: restaurants.name })
        .from(restaurants)
        .where(eq(restaurants.status, "published")),
      db.select().from(ingredients),
      db.select().from(tags),
      getTranslations({ locale, namespace: "admin.reviews.editReview" }),
    ]);

  const ingredientMap = new Map(
    ingredientOptions.map((ing) => [ing.id, ing.namePt ?? ing.slug]),
  );

  const rawEvaluations =
    (review.ingredientEvaluations as IngredientEvalJSON[]) || [];

  const reviewIngredients = rawEvaluations.map((item) => {
    const ingId = item.ingredientId || item.ingredient_id || "";
    const rawTagIds = item.tagIds || item.tag_ids || [];
    return {
      id: ingId,
      ingredientId: ingId,
      name: ingredientMap.get(ingId) ?? "",
      score: item.score ?? 5,
      isNotIncluded: item.isNotIncluded ?? false,
      tagIds: rawTagIds,
    };
  });

  const rawExperiences = review.experienceScores;
  let scoreService = 5;
  let scoreDigestion = 5;
  let scoreVibe = 5;

  if (Array.isArray(rawExperiences)) {
    (rawExperiences as ExperienceScoreJSON[]).forEach((exp) => {
      if (exp.key === "service") scoreService = exp.score ?? 5;
      if (exp.key === "digestion") scoreDigestion = exp.score ?? 5;
      if (exp.key === "vibe") scoreVibe = exp.score ?? 5;
    });
  } else if (rawExperiences && typeof rawExperiences === "object") {
    const expObj = rawExperiences as Record<string, number>;
    if (expObj.service !== undefined) scoreService = Number(expObj.service);
    if (expObj.digestion !== undefined)
      scoreDigestion = Number(expObj.digestion);
    if (expObj.vibe !== undefined) scoreVibe = Number(expObj.vibe);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Link
          href="/admin/reviews"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
          {t("backLink")}
        </Link>
      </div>

      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Edit3 className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-sm border border-amber-500/30 bg-card p-4 sm:p-8">
        <ReviewForm
          reviewId={review.id}
          restaurants={restaurantOptions}
          ingredients={ingredientOptions}
          tags={tagOptions}
          defaultValues={{
            restaurantId: review.restaurantFk ?? "",
            visitDate: review.visitDate ?? "",
            pricePaid: review.pricePaid ? Number(review.pricePaid) : undefined,
            francesinhaType: review.francesinhaType ?? "",
            text: review.text ?? "",
            photos: review.photos ?? [],
            scoreService,
            scoreDigestion,
            scoreVibe,
            reviewIngredients,
          }}
        />
      </div>
    </div>
  );
}
