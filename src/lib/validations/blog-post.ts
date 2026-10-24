import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().url().nullable(),
  tags: z.array(z.string()),
  publishedAt: z.string().nullable(),
  locale: z.enum(["pt", "en", "fr"]),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;
