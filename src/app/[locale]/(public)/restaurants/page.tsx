import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { and, eq, asc, desc } from "drizzle-orm";
import { EntityCard } from "@/components/ui/entity-card";
import { Badge } from "@/components/ui/badge";
import { Shield, Filter, Search, ArrowUp, ArrowDown } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

const priceLabels = ["€", "€€", "€€€", "€€€€"];

interface RestaurantsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ city?: string; price?: string; sort?: string }>;
}

export default async function RestaurantsPage({
  params,
  searchParams,
}: RestaurantsPageProps) {
  const { locale } = await params;
  const { city, price, sort } = await searchParams;

  const t = await getTranslations({ locale, namespace: "public.restaurants" });

  const currentSort = sort === "asc" ? "asc" : "desc";

  const conditions = [eq(restaurants.status, "published")];
  if (city) conditions.push(eq(restaurants.city, city));
  if (price) conditions.push(eq(restaurants.priceRange, Number(price)));

  const orderByClause =
    currentSort === "asc"
      ? asc(restaurants.avgScore)
      : desc(restaurants.avgScore);

  const [results, cities] = await Promise.all([
    db
      .select()
      .from(restaurants)
      .where(and(...conditions))
      .orderBy(orderByClause),
    db.selectDistinct({ city: restaurants.city }).from(restaurants),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* ---- Header ---- */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Shield className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* ---- Filter Command Bar ---- */}
      <form className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-3 rounded-sm border border-amber-500/30 bg-card p-4">
        <div className="mr-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Filter className="h-4 w-4" />
          <span>{t("filterLabel")}</span>
        </div>

        <select
          name="city"
          defaultValue={city ?? ""}
          aria-label="Filter restaurants by city"
          className="focus-ring rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-amber-500/40"
        >
          <option value="">{t("allCities")}</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.city}
            </option>
          ))}
        </select>

        <select
          name="price"
          defaultValue={price ?? ""}
          aria-label="Filter restaurants by price range"
          className="focus-ring rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-amber-500/40"
        >
          <option value="">{t("anyPrice")}</option>
          {[1, 2, 3, 4].map((p) => (
            <option key={p} value={p}>
              {priceLabels[p - 1]}
            </option>
          ))}
        </select>

        {/* Sort Direction Toggle Selector */}
        <div className="relative inline-flex items-center">
          <select
            name="sort"
            defaultValue={currentSort}
            aria-label="Sort restaurants by score"
            className="focus-ring appearance-none rounded-sm border border-amber-500/30 bg-amber-500/10 pl-8 pr-3 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 transition-colors hover:bg-amber-500/20 cursor-pointer"
          >
            <option value="desc">{t("sortDesc")}</option>
            <option value="asc">{t("sortAsc")}</option>
          </select>
          {currentSort === "desc" ? (
            <ArrowDown className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-amber-600" />
          ) : (
            <ArrowUp className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-amber-600" />
          )}
        </div>
        <CustomButton
          type="submit"
          variant="primary"
          intent="amber"
          size="md"
          className="ml-auto"
        >
          <Search className="h-3.5 w-3.5" />
          {t("filterButton")}
        </CustomButton>
      </form>

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
                r.avgScore && (
                  <Badge className="rounded-sm border border-amber-500/30 bg-amber-500/20 font-mono font-bold text-amber-600">
                    {r.avgScore} / 10
                  </Badge>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
