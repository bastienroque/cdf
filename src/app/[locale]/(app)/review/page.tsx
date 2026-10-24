import { ReviewWizard } from "@/components/admin/review/review-wizard";
import { db } from "@/db";
import { restaurants, ingredients, ingredientVariants } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AvaliarPage() {
  const restaurantOptions = await db
    .select({ id: restaurants.id, name: restaurants.name })
    .from(restaurants)
    .where(eq(restaurants.status, "published"));

  const ingredientOptions = await db.select().from(ingredients);
  const variantOptions = await db.select().from(ingredientVariants);

  return (
    <ReviewWizard
      restaurants={restaurantOptions}
      ingredients={ingredientOptions}
      variants={variantOptions}
    />
  );
}
