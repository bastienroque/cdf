import { MetadataRoute } from "next";
import { db } from "@/db";
import { restaurants } from "@/db/schema";
import { eq } from "drizzle-orm";

const locales = ["en", "fr", "pt"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  const staticRoutes: MetadataRoute.Sitemap = [];

  locales.forEach((locale) => {
    staticRoutes.push(
      { url: `${baseUrl}/${locale}`, lastModified: new Date() },
      { url: `${baseUrl}/${locale}/restaurants`, lastModified: new Date() },
      { url: `${baseUrl}/${locale}/leaderboard`, lastModified: new Date() },
      { url: `${baseUrl}/${locale}/map`, lastModified: new Date() },
      { url: `${baseUrl}/${locale}/contact`, lastModified: new Date() },
      { url: `${baseUrl}/${locale}/history`, lastModified: new Date() },
    );
  });

  try {
    const publishedRestaurants = await db
      .select({ slug: restaurants.slug })
      .from(restaurants)
      .where(eq(restaurants.status, "published"));

    const restaurantRoutes: MetadataRoute.Sitemap = [];
    locales.forEach((locale) => {
      publishedRestaurants.forEach((r) => {
        restaurantRoutes.push({
          url: `${baseUrl}/${locale}/restaurants/${r.slug}`,
          lastModified: new Date(),
        });
      });
    });

    return [...staticRoutes, ...restaurantRoutes];
  } catch (error) {
    console.error(
      "Sitemap database fetch failed during build, falling back to static routes:",
      error,
    );
    return staticRoutes;
  }
}
