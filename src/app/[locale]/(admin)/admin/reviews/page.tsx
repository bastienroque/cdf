import { db } from "@/db";
import { reviews, restaurants, users } from "@/db/schema";
import { and, count, desc, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { approveReview, rejectReview, deleteReview } from "./actions";
import {
  MessageSquare,
  Check,
  X,
  Plus,
  ShieldCheck,
  Search,
  Pencil,
  ExternalLink,
} from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import { Pagination } from "@/components/ui/pagination";
import { reviewScore } from "@/lib/restaurant-review-score";

const PAGE_SIZE = 20;
const STATUSES = ["all", "pending", "published", "rejected"] as const;
const TYPES = ["all", "official", "community"] as const;
type Status = (typeof STATUSES)[number];
type ReviewType = (typeof TYPES)[number];

interface AdminReviewsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
    sort?: string;
    page?: string;
  }>;
}

const pick = <T extends readonly string[]>(list: T, value: string | undefined): T[number] =>
  list.includes(value as T[number]) ? (value as T[number]) : list[0];

const STATUS_STYLE: Record<string, string> = {
  published: "bg-emerald-500",
  pending: "bg-yellow-500",
  rejected: "bg-red-500",
};

export default async function AdminReviewsPage({
  params,
  searchParams,
}: AdminReviewsPageProps) {
  const { locale } = await params;
  const sp = await searchParams;
  const status: Status = pick(STATUSES, sp.status);
  const type: ReviewType = pick(TYPES, sp.type);
  const sort = sp.sort === "oldest" ? "oldest" : "newest";
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  const [t, tCommon] = await Promise.all([
    getTranslations("admin.reviews"),
    getTranslations("common"),
  ]);

  // Filters other than status, so the status tabs can show their own counts
  const baseConditions: SQL[] = [];
  if (type !== "all") baseConditions.push(eq(reviews.isOfficial, type === "official"));
  if (q) {
    const term = `%${q}%`;
    baseConditions.push(
      or(ilike(restaurants.name, term), ilike(users.display_name, term), ilike(reviews.text, term))!,
    );
  }
  const conditions =
    status === "all" ? baseConditions : [...baseConditions, eq(reviews.status, status)];

  const [data, [{ total }], statusCounts] = await Promise.all([
    db
      .select({
        id: reviews.id,
        status: reviews.status,
        isOfficial: reviews.isOfficial,
        visitDate: reviews.visitDate,
        pricePaid: reviews.pricePaid,
        francesinhaType: reviews.francesinhaType,
        text: reviews.text,
        createdAt: reviews.createdAt,
        ingredientEvaluations: reviews.ingredientEvaluations,
        experienceScores: reviews.experienceScores,
        restaurantName: restaurants.name,
        restaurantSlug: restaurants.slug,
        authorName: users.display_name,
      })
      .from(reviews)
      .leftJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
      .leftJoin(users, eq(reviews.authorFk, users.id))
      .where(and(...conditions))
      .orderBy(sort === "oldest" ? asc(reviews.createdAt) : desc(reviews.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(reviews)
      .leftJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
      .leftJoin(users, eq(reviews.authorFk, users.id))
      .where(and(...conditions)),
    db
      .select({ status: reviews.status, n: count() })
      .from(reviews)
      .leftJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
      .leftJoin(users, eq(reviews.authorFk, users.id))
      .where(and(...baseConditions))
      .groupBy(reviews.status),
  ]);

  const countFor = (s: Status) =>
    s === "all"
      ? statusCounts.reduce((sum, r) => sum + r.n, 0)
      : (statusCounts.find((r) => r.status === s)?.n ?? 0);

  // Builds a link that changes one filter and keeps the others
  const hrefWith = (changes: Record<string, string | undefined>) => {
    const next: Record<string, string | undefined> = {
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      q: q || undefined,
      sort: sort === "newest" ? undefined : sort,
      ...changes,
    };
    const qs = new URLSearchParams(
      Object.entries(next).filter((e): e is [string, string] => Boolean(e[1])),
    ).toString();
    return qs ? `/admin/reviews?${qs}` : "/admin/reviews";
  };

  const formatDate = (d: string | Date | null) =>
    d
      ? new Date(d).toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
      : null;

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1 font-mono text-[11px] uppercase transition-colors ${
      active
        ? "border-amber-500 bg-amber-500/15 text-amber-600 font-bold"
        : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
            <MessageSquare className="h-3.5 w-3.5" />
            <span>{t("tag")}</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
            {t("title")}
          </h1>
        </div>
        <CustomButton href="/admin/reviews/new" intent="amber" size="md">
          <Plus className="h-4 w-4" />
          <span>{t("newOfficial")}</span>
        </CustomButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-sm border border-border/60 bg-card p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("statusFilterLabel")}>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={hrefWith({ status: s === "all" ? undefined : s })}
              aria-current={status === s ? "page" : undefined}
              className={chip(status === s)}
            >
              {s !== "all" && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLE[s]}`} />}
              {t(`filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
              <span className="text-muted-foreground">{countFor(s)}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {TYPES.map((ty) => (
            <Link
              key={ty}
              href={hrefWith({ type: ty === "all" ? undefined : ty })}
              aria-current={type === ty ? "page" : undefined}
              className={chip(type === ty)}
            >
              {t(`type.${ty}`)}
            </Link>
          ))}
          <Link
            href={hrefWith({ sort: sort === "newest" ? "oldest" : undefined })}
            className={chip(false)}
          >
            {sort === "newest" ? t("sort.newest") : t("sort.oldest")}
          </Link>
        </div>

        {/* Plain GET form: works without JavaScript and keeps the other filters */}
        <form action={`/${locale}/admin/reviews`} className="relative w-full lg:w-64">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          {type !== "all" && <input type="hidden" name="type" value={type} />}
          {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full rounded-sm border border-border bg-background py-1.5 pl-8 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none"
          />
        </form>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {t("resultCount", { count: total })}
      </p>

      {/* Review cards */}
      {data.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("noReviews")}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
          {data.map((r) => {
            const score = reviewScore(r.ingredientEvaluations, r.experienceScores);
            const meta = [
              r.authorName ?? t("anonymousKnight"),
              r.visitDate && t("visited", { date: formatDate(r.visitDate) ?? "" }),
              r.pricePaid && `${Number(r.pricePaid).toFixed(2)} €`,
              r.francesinhaType,
            ].filter(Boolean);

            return (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-sm border border-border/60 bg-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${STATUS_STYLE[r.status]}`}
                        aria-hidden="true"
                      />
                      <span className="truncate font-display text-base font-semibold text-foreground">
                        {r.restaurantName ?? t("unknownRestaurant")}
                      </span>
                      {r.isOfficial && (
                        <ShieldCheck
                          className="h-3.5 w-3.5 shrink-0 text-amber-600"
                          aria-label={t("officialBadge")}
                        />
                      )}
                    </div>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                      <span className="sr-only">{tCommon(`status.${r.status}`)} · </span>
                      {meta.join(" · ")}
                    </p>
                  </div>
                  {score !== null && (
                    <span className="shrink-0 rounded-sm border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-xs font-bold text-amber-600">
                      {score.toFixed(1)}
                    </span>
                  )}
                </div>

                {r.text && (
                  <p className="line-clamp-2 font-body text-sm text-foreground/80">{r.text}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {t("submitted", { date: formatDate(r.createdAt) ?? "" })}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {r.status === "pending" && (
                      <>
                        <form action={approveReview.bind(null, r.id)}>
                          <CustomButton type="submit" variant="secondary" intent="amber" size="sm">
                            <Check className="h-3.5 w-3.5" />
                            {t("table.actions.approve")}
                          </CustomButton>
                        </form>
                        <form action={rejectReview.bind(null, r.id)}>
                          <CustomButton type="submit" variant="secondary" intent="destructive" size="sm">
                            <X className="h-3.5 w-3.5" />
                            {t("table.actions.reject")}
                          </CustomButton>
                        </form>
                      </>
                    )}
                    {r.status === "published" && r.restaurantSlug && (
                      <Link
                        href={`/restaurants/${r.restaurantSlug}#review-${r.id}`}
                        className="focus-ring inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono text-[11px] uppercase text-muted-foreground hover:border-amber-500/40 hover:text-foreground"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("view")}
                      </Link>
                    )}
                    <Link
                      href={`/admin/reviews/${r.id}/edit`}
                      className="focus-ring inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 font-mono text-[11px] uppercase text-muted-foreground hover:border-amber-500/40 hover:text-foreground"
                    >
                      <Pencil className="h-3 w-3" />
                      {t("table.actions.edit")}
                    </Link>
                    <DeleteRowButton
                      label={t("table.actions.delete")}
                      confirmMessage={t("table.actions.confirmDelete")}
                      action={deleteReview.bind(null, r.id)}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={page}
        totalPages={Math.ceil(total / PAGE_SIZE)}
        pathname="/admin/reviews"
        query={{
          status: status === "all" ? undefined : status,
          type: type === "all" ? undefined : type,
          q: q || undefined,
          sort: sort === "newest" ? undefined : sort,
        }}
        label={t("paginationLabel")}
      />
    </div>
  );
}
