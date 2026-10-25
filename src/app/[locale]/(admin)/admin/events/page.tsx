import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminTable, type AdminRow } from "@/components/admin/admin-table";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { Link } from "@/i18n/navigation";
import { deleteEvent } from "./actions";
import { getTranslations } from "next-intl/server";
import { Calendar, Plus, MapPin, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/ui/custom-button";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [data, t] = await Promise.all([
    db
      .select({
        id: events.id,
        title: events.title,
        date: events.date,
        location: events.location,
        locale: events.locale,
      })
      .from(events)
      .orderBy(desc(events.date)),
    getTranslations("admin.events"),
  ]);

  const rows: AdminRow[] = data.map((e) => {
    const formattedDate = new Date(e.date).toLocaleDateString(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return {
      id: e.id,
      cells: [
        /* Title */
        <div
          key="title"
          className="flex items-center gap-2 font-body font-semibold text-foreground"
        >
          <Calendar className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>{e.title}</span>
        </div>,

        /* Date */
        <span key="date" className="font-mono text-xs text-muted-foreground">
          {formattedDate}
        </span>,

        /* Location */
        <div
          key="location"
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
        >
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span>{e.location}</span>
        </div>,

        /* Locale Badge */
        <Badge
          key="locale"
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 font-mono text-xs uppercase tracking-wider text-amber-600"
        >
          <Globe className="mr-1 h-3 w-3 inline-block" />
          {e.locale.toUpperCase()}
        </Badge>,
      ],
      actions: (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/events/${e.id}/edit`}
            className="focus-ring rounded-sm border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground"
          >
            {t("table.actions.edit")}
          </Link>
          <DeleteRowButton
            label={t("table.actions.delete")}
            confirmMessage={t("table.actions.confirmDelete", {
              title: e.title,
            })}
            action={deleteEvent.bind(null, e.id)}
          />
        </div>
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-6">
      {/* ---- Header Section ---- */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
              <Calendar className="h-3.5 w-3.5" />
              {t("tag")}
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <CustomButton href="/admin/events/new" intent="amber" size="md">
            <Plus className="h-4 w-4" />
            <span>{t("newEvent")}</span>
          </CustomButton>
        </div>
      </div>

      {/* ---- Table or Empty State ---- */}
      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("table.empty")}
          </p>
        </div>
      ) : (
        <AdminTable
          headers={[
            t("table.headers.title"),
            t("table.headers.date"),
            t("table.headers.location"),
            t("table.headers.locale"),
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
