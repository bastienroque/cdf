import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { restaurants, reviews, users, ingredients, tags } from "@/db/schema";
import { count, countDistinct, desc, eq } from "drizzle-orm";
import {
  ShieldAlert,
  UtensilsCrossed,
  MessageSquare,
  Users as UsersIcon,
  MapPin,
} from "lucide-react";

import { MetricsGrid } from "@/components/admin/dashboard/metrics-grid";
import { PendingReviewsSection } from "@/components/admin/dashboard/pending-reviews-section";
import { LocalizationSummaryCard } from "@/components/admin/dashboard/localization-summary-card";
import { TranslationHubSection } from "@/components/admin/dashboard/translation-hub-section";
import { ApiUsageSection } from "@/components/admin/dashboard/api-usage-section";

interface AdminDashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminDashboardPage({
  params,
}: AdminDashboardPageProps) {
  const { locale } = await params;

  const [tStats, tAdmin, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: "admin.dashboard.sections" }),
    getTranslations({ locale, namespace: "admin.dashboard" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const [
    [{ totalRestaurants = 0 } = {}],
    [{ totalReviews = 0 } = {}],
    [{ totalUsers = 0 } = {}],
    [{ totalCities = 0 } = {}],
    pendingReviewsList,
    allIngredients,
    allTags,
  ] = await Promise.all([
    db.select({ totalRestaurants: count() }).from(restaurants),
    db.select({ totalReviews: count() }).from(reviews),
    db.select({ totalUsers: count() }).from(users),
    db
      .select({ totalCities: countDistinct(restaurants.city) })
      .from(restaurants),
    db
      .select({
        id: reviews.id,
        text: reviews.text,
        visitDate: reviews.visitDate,
        restaurantName: restaurants.name,
        authorName: users.display_name,
      })
      .from(reviews)
      .leftJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
      .leftJoin(users, eq(reviews.authorFk, users.id))
      .where(eq(reviews.status, "pending"))
      .orderBy(desc(reviews.createdAt))
      .limit(5),
    db.select().from(ingredients),
    db.select().from(tags),
  ]);

  const stats = [
    {
      title: tStats("restaurants") || "Restaurants",
      value: totalRestaurants,
      icon: UtensilsCrossed,
      description:
        tStats("restaurantsDesc") || "Total registered establishments",
    },
    {
      title: tStats("reviews") || "Reviews",
      value: totalReviews,
      icon: MessageSquare,
      description: tStats("reviewsDesc") || "Total submitted evaluations",
    },
    {
      title: tStats("users") || "Users",
      value: totalUsers,
      icon: UsersIcon,
      description: tStats("usersDesc") || "Total registered accounts",
    },
    {
      title: tStats("cities") || "Cities",
      value: totalCities,
      icon: MapPin,
      description: tStats("citiesDesc") || "Unique locations covered",
    },
  ];

  const combinedCatalog = [
    ...allIngredients.map((item) => ({ ...item, type: "ingredient" as const })),
    ...allTags.map((item) => ({ ...item, type: "tag" as const })),
  ];

  const pendingTranslations = combinedCatalog.filter(
    (item) => item.translationStatus === "pending",
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10 space-y-12 md:space-y-24 ">
      {/* Header Bar */}
      <div className="border-b border-border/65 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
            <ShieldAlert className="h-4 w-4" />
            <span>{tAdmin("subtitle")}</span>
          </div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
            {tAdmin("title")}
          </h1>
        </div>
      </div>

      <MetricsGrid stats={stats} />
      {/* Metrics Grid */}

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PendingReviewsSection
            reviews={pendingReviewsList}
            labels={{
              title: tAdmin("pendingReviewsTitle") || "Pending Reviews",
              viewAll: tAdmin("viewAllReviews") || "View All",
              empty:
                tAdmin("noPendingReviews") ||
                "No reviews pending moderation. All clear!",
              approve: tCommon("actions.approve") || "Approve",
              reject: tCommon("actions.reject") || "Reject",
            }}
          />
        </div>

        <div>
          <LocalizationSummaryCard
            pendingCount={pendingTranslations.length}
            labels={{
              title: tAdmin("translationSummaryTitle") || "Localization Status",
              pendingLabel: tAdmin("pendingLocalizations") || "Pending Items",
              description:
                tAdmin("translationDesc") ||
                "Keep ingredient and tag catalog names synchronized across Portuguese, English, and French.",
            }}
          />
        </div>
      </div>

      {/* Translation & Catalog Hub Full List */}
      <TranslationHubSection
        items={combinedCatalog}
        labels={{
          title: tAdmin("catalogHubTitle"),
          subtitle: tAdmin("catalogHubSubtitle"),
          status: tCommon("status.status"),
          type: tCommon("actions.type"),
          empty: tAdmin("noCatalogItems") || "No catalog items registered yet.",
          completeStatus: tAdmin("completeStatus") || "Complete",
          pendingStatus: tAdmin("pendingStatus") || "Pending Translation",
        }}
      />

      <ApiUsageSection />
    </div>
  );
}
