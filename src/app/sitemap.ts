import type { MetadataRoute } from "next";
import { db } from "@/db";
import { restaurants, blogPosts, events } from "@/db/schema";
import { eq, isNotNull } from "drizzle-orm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const LOCALES = ["pt", "en", "fr"] as const;

const STATIC_ROUTES = [
  "",
  "/restaurants",
  "/leaderboard",
  "/map",
  "/blog",
  "/events",
  "/about",
  "/privacy",
  "/contact",
];

function localizedUrls(path: string): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [publishedRestaurants, publishedPosts, allEvents] = await Promise.all([
    db
      .select({ slug: restaurants.slug })
      .from(restaurants)
      .where(eq(restaurants.status, "published")),

    db
      .select({ slug: blogPosts.slug, locale: blogPosts.locale })
      .from(blogPosts)
      .where(isNotNull(blogPosts.publishedAt)),

    db.select({ id: events.id, locale: events.locale }).from(events),
  ]);

  const staticEntries = STATIC_ROUTES.flatMap(localizedUrls);

  const restaurantEntries = publishedRestaurants.flatMap((r) =>
    localizedUrls(`/restaurants/${r.slug}`),
  );

  const blogEntries: MetadataRoute.Sitemap = publishedPosts.map((post) => ({
    url: `${BASE_URL}/${post.locale}/blog/${post.slug}`,
  }));

  const eventEntries: MetadataRoute.Sitemap = allEvents.map((event) => ({
    url: `${BASE_URL}/${event.locale}/events/${event.id}`,
  }));

  return [
    ...staticEntries,
    ...restaurantEntries,
    ...blogEntries,
    ...eventEntries,
  ];
}
