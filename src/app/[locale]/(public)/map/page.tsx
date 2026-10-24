import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { RestaurantsClusterMap } from "@/components/public/map";
import { Compass } from "lucide-react";
import { getTranslations } from "next-intl/server";

async function getMapPins() {
  return db
    .select({
      id: restaurants.id,
      name: restaurants.name,
      slug: restaurants.slug,
      lat: restaurants.lat,
      lng: restaurants.lng,
      avgScore: restaurants.avgScore,
    })
    .from(restaurants)
    .where(eq(restaurants.status, "published"));
}

export default async function MapPage() {
  const [pins, t] = await Promise.all([
    getMapPins(),
    getTranslations("public.map"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-8">
      {/* ---- Header Section ---- */}
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono tracking-widest text-amber-600 uppercase mb-3">
          <Compass className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {t("subtitle", { count: pins.length })}
        </p>
      </div>

      {/* ---- Map Container ---- */}
      <div className="rounded-sm border border-amber-500/30 bg-card p-3 ">
        <RestaurantsClusterMap pins={pins} />
      </div>
    </div>
  );
}
