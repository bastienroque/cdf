import { db } from "@/db/index";
import { restaurants } from "@/db/schema";
import { like } from "drizzle-orm";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function generateUniqueSlug(
  name: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(name);

  const existing = await db
    .select({ slug: restaurants.slug, id: restaurants.id })
    .from(restaurants)
    .where(like(restaurants.slug, `${base}%`));

  const takenSlugs = new Set(
    existing
      .filter((r: { slug: string; id: string }) => r.id !== excludeId)
      .map((r: { slug: string; id: string }) => r.slug),
  );

  if (!takenSlugs.has(base)) return base;

  let counter = 2;
  while (takenSlugs.has(`${base}-${counter}`)) {
    counter++;
  }
  return `${base}-${counter}`;
}
