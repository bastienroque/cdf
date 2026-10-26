import { getTranslations } from "next-intl/server";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq, desc, count, isNotNull, and } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown } from "lucide-react";
import { Metadata } from "next";

const PAGE_SIZE = 24;
const priceLabels = ["€", "€€", "€€€", "€€€€"];

interface LeaderboardProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: LeaderboardProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.leaderboard" });

  return {
    title: t("title"),
  };
}

async function getLeaderboard(page: number) {
  const offset = (page - 1) * PAGE_SIZE;

  const whereCondition = and(
    eq(restaurants.status, "published"),
    isNotNull(restaurants.avgScore),
  );

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        slug: restaurants.slug,
        city: restaurants.city,
        priceRange: restaurants.priceRange,
        avgScore: restaurants.avgScore,
      })
      .from(restaurants)
      .where(whereCondition)
      .orderBy(desc(restaurants.avgScore))
      .limit(PAGE_SIZE)
      .offset(offset),

    db.select({ total: count() }).from(restaurants).where(whereCondition),
  ]);

  return { rows, total, totalPages: Math.ceil(total / PAGE_SIZE) };
}

interface LeaderboardPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function LeaderboardPage({
  params,
  searchParams,
}: LeaderboardPageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { rows, totalPages } = await getLeaderboard(page);

  const t = await getTranslations({ locale, namespace: "public.leaderboard" });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* ---- Header ---- */}
      <div className="mb-10 border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/35 bg-amber-500/10 px-3.5 py-1 text-xs font-mono tracking-widest text-amber-600 uppercase mb-3">
          <Trophy className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      ) : (
        <ol className="flex flex-col gap-2.5">
          {rows.map((r, i) => {
            const rank = (page - 1) * PAGE_SIZE + i + 1;
            const isTopThree = rank <= 3;

            return (
              <li key={r.id}>
                <Link
                  href={`/restaurants/${r.slug}`}
                  className={`focus-ring flex items-center gap-4 rounded-sm border p-4 transition-all ${
                    isTopThree
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500/70"
                      : "border-border/60 bg-card hover:border-foreground/30"
                  }`}
                >
                  {/* Rank Indicator */}
                  <div className="flex w-10 shrink-0 items-center justify-center font-display text-lg font-bold">
                    {rank === 1 ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : rank === 2 ? (
                      <span className="text-amber-600/80">II</span>
                    ) : rank === 3 ? (
                      <span className="text-amber-700/70">III</span>
                    ) : (
                      <span className="font-mono text-sm text-muted-foreground">
                        #{rank}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-display font-semibold text-foreground text-base">
                      {r.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {r.city} · {priceLabels[r.priceRange - 1]}
                    </p>
                  </div>

                  {r.avgScore ? (
                    <Badge className="bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-sm font-mono font-bold">
                      {r.avgScore} / 10
                    </Badge>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      —
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      )}

      {/* ---- Pagination ---- */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const isActive = p === page;
            return (
              <Link
                key={p}
                href={`/leaderboard?page=${p}`}
                className={`focus-ring rounded-sm px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all ${
                  isActive
                    ? "bg-amber-500 text-black font-semibold"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
