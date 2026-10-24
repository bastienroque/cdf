import { ReviewForm } from "@/components/admin/review/review-form";
import { db } from "@/db";
import { restaurants, ingredients, tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Star } from "lucide-react";

interface NewReviewPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewReviewPage({ params }: NewReviewPageProps) {
  const { locale } = await params;
  const [restaurantOptions, ingredientOptions, tagOptions, t] =
    await Promise.all([
      db
        .select({ id: restaurants.id, name: restaurants.name })
        .from(restaurants)
        .where(eq(restaurants.status, "published")),
      db.select().from(ingredients),
      db.select().from(tags),
      getTranslations({ locale, namespace: "admin.reviews.newReview" }),
    ]);

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
          <Star className="h-3.5 w-3.5" />
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
          restaurants={restaurantOptions}
          ingredients={ingredientOptions}
          tags={tagOptions}
        />
      </div>
    </div>
  );
}
