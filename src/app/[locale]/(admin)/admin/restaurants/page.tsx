import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminTable, type AdminRow } from "@/components/admin/admin-table";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { Link } from "@/i18n/navigation";
import { deleteRestaurant } from "./actions";
import { getTranslations } from "next-intl/server";
import {
  Utensils,
  Plus,
  MapPin,
  BadgeEuro,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/ui/custom-button";

const priceLabels = ["€", "€€", "€€€", "€€€€"];

interface AdminRestaurantsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function AdminRestaurantsPage({
  params,
}: AdminRestaurantsPageProps) {
  const { locale } = await params;

  const [data, t, tCommon] = await Promise.all([
    db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        city: restaurants.city,
        priceRange: restaurants.priceRange,
        status: restaurants.status,
      })
      .from(restaurants)
      .orderBy(desc(restaurants.createdAt)),
    getTranslations({ locale, namespace: "admin.restaurants" }),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const rows: AdminRow[] = data.map((r) => {
    const isPublished = r.status === "published";

    return {
      id: r.id,
      cells: [
        /* Restaurant Name */
        <div
          key="name"
          className="flex items-center gap-2 font-body font-semibold text-foreground"
        >
          <Utensils className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>{r.name}</span>
        </div>,

        /* City Location */
        <div
          key="city"
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
        >
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{r.city}</span>
        </div>,

        /* Price Tier Badge */
        <div
          key="price"
          className="flex items-center gap-1 font-mono text-xs font-semibold text-amber-600"
        >
          <BadgeEuro className="h-3.5 w-3.5 shrink-0" />
          <span>{priceLabels[(r.priceRange ?? 1) - 1] ?? "€"}</span>
        </div>,

        /* Publication Status Badge */
        <Badge
          key="status"
          variant="outline"
          className={
            isPublished
              ? "border-amber-500/40 bg-amber-500/10 font-mono text-xs uppercase tracking-wider text-amber-600"
              : "border-border bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground"
          }
        >
          {isPublished ? (
            <CheckCircle2 className="mr-1 h-3 w-3 inline-block" />
          ) : (
            <FileText className="mr-1 h-3 w-3 inline-block" />
          )}
          {isPublished
            ? (t("table.status.published") ?? tCommon("status.published"))
            : (t("table.status.draft") ?? tCommon("status.draft"))}
        </Badge>,
      ],

      /* Action Buttons */
      actions: (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/restaurants/${r.id}/edit`}
            className="focus-ring rounded-sm border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground"
          >
            {t("table.actions.edit")}
          </Link>
          <DeleteRowButton
            label={t("table.actions.delete")}
            confirmMessage={t("table.actions.confirmDelete", { name: r.name })}
            action={deleteRestaurant.bind(null, r.id)}
          />
        </div>
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* ---- Header Section ---- */}
      <div className="mb-6 sm:mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
              <Utensils className="h-3.5 w-3.5" />
              {t("tag")}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-1 font-body text-xs sm:text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <CustomButton href="/admin/restaurants/new" intent="amber" size="md">
            <Plus className="h-4 w-4" />
            <span>{t("newRestaurant")}</span>
          </CustomButton>
        </div>
      </div>

      {/* ---- Empty State ---- */}
      {data.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("table.empty")}
          </p>
        </div>
      ) : (
        <>
          {/* ---- Mobile Card View (< md) ---- */}
          <div className="flex flex-col gap-3 md:hidden">
            {data.map((r) => {
              const isPublished = r.status === "published";

              return (
                <div
                  key={r.id}
                  className="flex flex-col justify-between gap-3 rounded-sm border border-border/60 bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-body font-semibold text-foreground text-sm">
                      <Utensils className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>{r.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        isPublished
                          ? "border-amber-500/40 bg-amber-500/10 font-mono text-[10px] uppercase tracking-wider text-amber-600"
                          : "border-border bg-muted/40 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                      }
                    >
                      {isPublished
                        ? t("table.status.published")
                        : t("table.status.draft")}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between border-t border-border/40 pt-2 font-mono text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span>{r.city}</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-amber-600">
                      <BadgeEuro className="h-3.5 w-3.5 shrink-0" />
                      <span>{priceLabels[(r.priceRange ?? 1) - 1] ?? "€"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                    <CustomButton
                      href={`/admin/restaurants/${r.id}/edit`}
                      variant="outline"
                      size="sm"
                    >
                      {t("table.actions.edit")}
                    </CustomButton>
                    <DeleteRowButton
                      label={t("table.actions.delete")}
                      confirmMessage={t("table.actions.confirmDelete", {
                        name: r.name,
                      })}
                      action={deleteRestaurant.bind(null, r.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {/* ---- Desktop Table View (>= md) ---- */}
          <div className="hidden md:block">
            <AdminTable
              headers={[
                t("table.headers.name"),
                t("table.headers.city"),
                t("table.headers.price"),
                t("table.headers.status"),
              ]}
              rows={rows}
            />
          </div>{" "}
        </>
      )}
    </div>
  );
}
