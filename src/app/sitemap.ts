import { MetadataRoute } from "next";
import { db } from "@/db";
import { blogPosts, events, restaurants } from "@/db/schema";
import { and, eq, isNotNull, lte } from "drizzle-orm";
import { defaultLocale, locales } from "@/i18n/config";
import { siteUrl } from "@/lib/site-url";

const STATIC_PATHS = [
  "",
  "/restaurants",
  "/leaderboard",
  "/map",
  "/blog",
  "/events",
  "/about",
  "/contact",
  "/share",
  "/privacy",
];

// One entry per page and language, each listing its other-language versions
// (hreflang), with English as the x-default.
function entriesFor(path: string, lastModified?: Date): MetadataRoute.Sitemap {
  const base = siteUrl();
  const languages = Object.fromEntries([
    ...locales.map((l) => [l, `${base}/${l}${path}`]),
    ["x-default", `${base}/${defaultLocale}${path}`],
  ]);
  return locales.map((locale) => ({
    url: `${base}/${locale}${path}`,
    lastModified,
    alternates: { languages },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.flatMap((p) => entriesFor(p));

  try {
    const [restaurantRows, postRows, eventRows] = await Promise.all([
      db
        .select({ slug: restaurants.slug, createdAt: restaurants.createdAt })
        .from(restaurants)
        .where(eq(restaurants.status, "published")),
      db
        .select({ slug: blogPosts.slug, publishedAt: blogPosts.publishedAt })
        .from(blogPosts)
        .where(and(isNotNull(blogPosts.publishedAt), lte(blogPosts.publishedAt, new Date()))),
      db.select({ id: events.id, createdAt: events.createdAt }).from(events),
    ]);

    return [
      ...staticEntries,
      ...restaurantRows.flatMap((r) => entriesFor(`/restaurants/${r.slug}`, r.createdAt)),
      ...postRows.flatMap((p) => entriesFor(`/blog/${p.slug}`, p.publishedAt ?? undefined)),
      ...eventRows.flatMap((e) => entriesFor(`/events/${e.id}`, e.createdAt)),
    ];
  } catch (error) {
    console.error("Sitemap database query failed, returning static pages only:", error);
    return staticEntries;
  }
}
