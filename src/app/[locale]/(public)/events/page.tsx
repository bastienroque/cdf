import { db } from "@/db";
import { events } from "@/db/schema";
import { asc, desc, gte, lt } from "drizzle-orm";
import { EntityCard } from "@/components/ui/entity-card";
import { getTranslations } from "next-intl/server";
import { Calendar } from "lucide-react";
import { Metadata } from "next";

// Events are written once, in one language, and shown in every locale.
// Upcoming events come first (soonest first), then past ones (latest first).
async function getEvents() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    db.select().from(events).where(gte(events.date, now)).orderBy(asc(events.date)),
    db.select().from(events).where(lt(events.date, now)).orderBy(desc(events.date)),
  ]);
  return { upcoming, past };
}

interface EventsProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: EventsProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.events" });

  return {
    title: t("title"),
  };
}

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [{ upcoming, past }, t] = await Promise.all([
    getEvents(),
    getTranslations("public.events"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* ---- Header Section ---- */}
      <div className="mb-10 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Calendar className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* ---- Upcoming Events ---- */}
      {upcoming.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      ) : (
        <EventGrid rows={upcoming} locale={locale} />
      )}

      {/* ---- Past Events ---- */}
      {past.length > 0 && (
        <section className="mt-16" aria-labelledby="past-events">
          <h2
            id="past-events"
            className="mb-6 font-display text-xl font-bold uppercase tracking-tight text-muted-foreground"
          >
            {t("pastTitle")}
          </h2>
          <EventGrid rows={past} locale={locale} />
        </section>
      )}
    </div>
  );
}

type EventRow = Awaited<ReturnType<typeof getEvents>>["upcoming"][number];

function EventGrid({ rows, locale }: { rows: EventRow[]; locale: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((e) => {
        const formattedDate = new Date(e.date).toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return (
          <EntityCard
            key={e.id}
            href={`/events/${e.id}`}
            title={e.title}
            meta={`${formattedDate} · ${e.location} · ${e.locale.toUpperCase()}`}
          />
        );
      })}
    </div>
  );
}
