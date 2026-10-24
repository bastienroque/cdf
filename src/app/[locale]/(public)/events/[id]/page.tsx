import { db } from "@/db";
import { events, restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Calendar, MapPin, Utensils, Shield } from "lucide-react";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;

  const [[event], t] = await Promise.all([
    db.select().from(events).where(eq(events.id, id)).limit(1),
    getTranslations("public.events"),
  ]);

  if (!event) notFound();

  let restaurant = null;
  if (event.restaurantFk) {
    [restaurant] = await db
      .select({ name: restaurants.name, slug: restaurants.slug })
      .from(restaurants)
      .where(eq(restaurants.id, event.restaurantFk))
      .limit(1);
  }

  const formattedDate = new Date(event.date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* ---- Back Action ---- */}
      <div className="mb-8">
        <Link
          href="/events"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
          {t("detail.backLink")}
        </Link>
      </div>

      {/* ---- Header Section ---- */}
      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Calendar className="h-3.5 w-3.5" />
          {t("tag")}
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl uppercase">
          {event.title}
        </h1>

        {/* Quick Meta Indicators */}
        <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            <span>{event.location}</span>
          </div>
        </div>
      </header>

      {/* ---- Details Card ---- */}
      <div className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
        <p className="font-body text-base leading-relaxed text-foreground whitespace-pre-line">
          {event.description}
        </p>

        {/* Host Restaurant Link */}
        {restaurant && (
          <div className="mt-8 flex items-center gap-3 border-t border-border/60 pt-6">
            <Utensils className="h-4 w-4 text-amber-500" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {t("detail.venue")}:
            </span>
            <Link
              href={`/restaurants/${restaurant.slug}`}
              className="focus-ring rounded-sm border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600 transition-colors hover:bg-amber-500/20"
            >
              {restaurant.name}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
