import { db } from "@/db";
import { reviews, restaurants, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { approveReview, rejectReview, deleteReview } from "./actions";
import {
  MessageSquare,
  Utensils,
  User,
  Edit,
  Check,
  X,
  Plus,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/ui/custom-button";

interface AdminReviewsPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminReviewsPage({
  searchParams,
}: AdminReviewsPageProps) {
  const { status: statusFilter } = await searchParams;
  const [t, tCommon] = await Promise.all([
    getTranslations("admin.reviews"),
    getTranslations("common"),
  ]);

  const data = await db
    .select({
      id: reviews.id,
      status: reviews.status,
      isOfficial: reviews.isOfficial,
      visitDate: reviews.visitDate,
      pricePaid: reviews.pricePaid,
      text: reviews.text,
      createdAt: reviews.createdAt,
      restaurantName: restaurants.name,
      restaurantId: restaurants.id,
      authorName: users.display_name,
    })
    .from(reviews)
    .leftJoin(restaurants, eq(reviews.restaurantFk, restaurants.id))
    .leftJoin(users, eq(reviews.authorFk, users.id))
    .where(
      statusFilter && statusFilter !== "all"
        ? eq(
            reviews.status,
            statusFilter as "published" | "pending" | "rejected",
          )
        : undefined,
    )
    .orderBy(desc(reviews.createdAt));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-6">
      {/* Header Section */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{t("tag")}</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              {t("title")}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-1 font-mono text-xs">
              {["all", "published", "pending", "rejected"].map((s) => {
                const active = (statusFilter ?? "all") === s;
                return (
                  <Link
                    key={s}
                    href={
                      s === "all"
                        ? "/admin/reviews"
                        : `/admin/reviews?status=${s}`
                    }
                    className={`rounded-sm border px-3 py-1.5 uppercase transition-colors ${
                      active
                        ? "border-amber-500 bg-amber-500/15 text-amber-500 font-bold"
                        : "border-border bg-card text-muted-foreground hover:border-amber-500/40"
                    }`}
                  >
                    {t(`filter${s.charAt(0).toUpperCase() + s.slice(1)}`)}
                  </Link>
                );
              })}
            </div>

            {/* Create Official Review */}
            <CustomButton href="/admin/reviews/new" intent="amber" size="md">
              <Plus className="h-4 w-4" />
              <span>{t("newOfficial")}</span>
            </CustomButton>
          </div>
        </div>
      </div>

      {/* Review Grid */}
      {data.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("noReviews")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.map((r) => {
            const isPublished = r.status === "published";
            const isPending = r.status === "pending";

            return (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm border border-border/60 bg-card p-4 sm:p-5"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={
                        isPublished
                          ? "border-amber-500/40 bg-amber-500/10 font-mono text-[10px] uppercase text-amber-600"
                          : isPending
                            ? "border-yellow-500/40 bg-yellow-500/10 font-mono text-[10px] uppercase text-yellow-600"
                            : "border-red-500/40 bg-red-500/10 font-mono text-[10px] uppercase text-red-500"
                      }
                    >
                      {tCommon(`status.${r.status}`)}
                    </Badge>
                    {r.isOfficial && (
                      <Badge
                        variant="outline"
                        className="border-amber-500 bg-amber-500/20 font-mono text-[10px] uppercase text-amber-500 flex items-center gap-1"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        {t("officialBadge")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 text-foreground font-semibold">
                      <Utensils className="h-3.5 w-3.5 text-amber-500" />
                      {r.restaurantName ?? t("unknownRestaurant")}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {r.authorName ?? t("anonymousKnight")}
                    </span>
                    {r.visitDate && (
                      <span className="flex items-center gap-1">
                        • {t("table.headers.visitDate")} |
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {new Date(r.visitDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {r.text && (
                    <p className="font-body text-sm text-foreground/90 line-clamp-2 italic">
                      "{r.text}"
                    </p>
                  )}
                  {r.createdAt && (
                    <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0 shrink-0 flex-wrap">
                  {isPending ? (
                    <>
                      <form action={approveReview.bind(null, r.id)}>
                        <CustomButton
                          type="submit"
                          variant="secondary"
                          intent="amber"
                          size="sm"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {t("table.actions.approve")}
                        </CustomButton>
                      </form>

                      <form action={rejectReview.bind(null, r.id)}>
                        <CustomButton
                          type="submit"
                          variant="secondary"
                          intent="destructive"
                          size="sm"
                        >
                          <X className="h-3.5 w-3.5" />
                          {t("table.actions.reject")}
                        </CustomButton>
                      </form>
                    </>
                  ) : (
                    <>
                      <CustomButton
                        href={`/admin/reviews/${r.id}/edit`}
                        variant="outline"
                        size="sm"
                      >
                        <span>{t("table.actions.edit")}</span>
                      </CustomButton>
                      <DeleteRowButton
                        label={t("table.actions.delete")}
                        confirmMessage={t("table.actions.confirmDelete")}
                        action={deleteReview.bind(null, r.id)}
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
