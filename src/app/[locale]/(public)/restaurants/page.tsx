import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { and, count, eq, asc, desc, ilike, or, sql } from "drizzle-orm";
import { EntityCard } from "@/components/ui/entity-card";
import { Shield } from "lucide-react";
import { RestaurantFilters } from "@/components/public/restaurant/restaurant-filters";
import { Metadata } from "next";
import { ScoreBadge } from "@/components/public/restaurant/score-badge";
import { Pagination } from "@/components/ui/pagination";

const PAGE_SIZE = 24;

const priceLabels = ["€", "€€", "€€€", "€€€€"];

interface RestaurantsProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RestaurantsProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.restaurants" });

  return {
    title: t("title"),
  };
}

interface RestaurantsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    city?: string;
    price?: string;
    sort?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function RestaurantsPage({
  params,
  searchParams,
}: RestaurantsPageProps) {
  const { locale } = await params;
  const { city, price, sort, q, page: pageParam } = await searchParams;
  const page = Math.max(1, Math.floor(Number(pageParam)) || 1);

  const t = await getTranslations({ locale, namespace: "public.restaurants" });

  const currentSort = sort === "asc" ? "asc" : "desc";

  const conditions = [eq(restaurants.status, "published")];
  if (city) conditions.push(eq(restaurants.city, city));
  if (price) conditions.push(eq(restaurants.priceRange, Number(price)));
  if (q && q.trim() !== "") {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(ilike(restaurants.name, term), ilike(restaurants.city, term))!,
    );
  }

  // "desc" = best first. Restaurants without a score always come last.
  const orderByClause =
    currentSort === "desc"
      ? sql`${restaurants.avgScore} DESC NULLS LAST`
      : sql`${restaurants.avgScore} ASC NULLS LAST`;

  const where = and(...conditions);

  const [results, [{ total }], cities] = await Promise.all([
    db
      .select()
      .from(restaurants)
      .where(where)
      .orderBy(orderByClause, asc(restaurants.name))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(restaurants).where(where),
    // Only cities that have a published restaurant
    db
      .selectDistinct({ city: restaurants.city })
      .from(restaurants)
      .where(eq(restaurants.status, "published"))
      .orderBy(asc(restaurants.city)),
  ]);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* ---- Header ---- */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Shield className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* ---- Instant Filter & Search Bar ---- */}
      <RestaurantFilters
        cities={cities}
        currentCity={city}
        currentPrice={price}
        currentSort={currentSort}
        currentQuery={q}
        priceLabels={priceLabels}
        labels={{
          filterLabel: t("filterLabel"),
          allCities: t("allCities"),
          anyPrice: t("anyPrice"),
          sortDesc: t("sortDesc"),
          sortAsc: t("sortAsc"),
          searchPlaceholder: t("searchPlaceholder"),
          filtering: t("filtering"),
          cityAria: t("cityAria"),
          priceAria: t("priceAria"),
          sortAria: t("sortAria"),
        }}
      />

      {/* ---- Results Grid ---- */}
      {results.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <EntityCard
              key={r.id}
              href={`/restaurants/${r.slug}`}
              image={r.photos?.[0]}
              title={r.name}
              meta={`${r.city} · ${priceLabels[r.priceRange - 1]}`}
              badge={
                <ScoreBadge
                  score={r.avgScore}
                  noReviewsLabel={t("noReviewsYet")}
                />
              }
            />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        pathname="/restaurants"
        query={{ city, price, sort, q }}
        label={t("paginationLabel")}
      />
    </div>
  );
}
