import { z } from "zod";

export const catalogItemSchema = z.object({
  category: z.string().min(1, "Category is required"),
  namePt: z.string().min(1, "Portuguese name is required"),
  nameEn: z.string().optional(),
  nameFr: z.string().optional(),
  createdLanguage: z.enum(["pt", "en", "fr"]).default("pt"),
});

export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>;

export const catalogTranslationSchema = z.object({
  namePt: z.string().trim().min(1, "Portuguese name is required").max(120),
  nameEn: z.string().trim().max(120).nullish(),
  nameFr: z.string().trim().max(120).nullish(),
});
