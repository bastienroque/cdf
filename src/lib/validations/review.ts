import { z } from "zod";

export const reviewIngredientItemSchema = z.object({
  id: z.string(),
  ingredientId: z.string().optional(),
  name: z.string(),
  score: z.number().min(1).max(10).nullable(),
  isNotIncluded: z.boolean(),
  tagIds: z.array(z.string()).default([]),
});

export const reviewSchema = z.object({
  restaurantId: z.string().min(1, "Restaurant is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  francesinhaType: z.string().min(1, "Francesinha type is required"),
  pricePaid: z.number().optional(),
  text: z.string().min(1, "Review text is required"),
  photos: z.array(z.string()).default([]),
  scoreService: z.number().min(1).max(10),
  scoreDigestion: z.number().min(1).max(10),
  scoreVibe: z.number().min(1).max(10),

  // Update/Add reviewIngredients here
  reviewIngredients: z.array(reviewIngredientItemSchema).default([]),
});

export type ReviewFormInput = z.input<typeof reviewSchema>;
export type ReviewFormValues = z.infer<typeof reviewSchema>;
