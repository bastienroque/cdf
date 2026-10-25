"use server";

import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import {
  blogPostSchema,
  type BlogPostFormValues,
} from "@/lib/validations/blog-post";
import { requireAdmin } from "@/lib/auth/admin";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/slugify";

export async function createBlogPost(values: BlogPostFormValues) {
  const adminId = await requireAdmin();
  const parsed = blogPostSchema.parse(values);

  await db.insert(blogPosts).values({
    title: parsed.title,
    slug: slugify(parsed.title),
    content: parsed.content,
    authorFk: adminId,
    coverImage: parsed.coverImage,
    tags: parsed.tags,
    publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : null,
    locale: parsed.locale,
  });

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updateBlogPost(id: string, values: BlogPostFormValues) {
  await requireAdmin();
  const parsed = blogPostSchema.parse(values);

  await db
    .update(blogPosts)
    .set({
      title: parsed.title,
      content: parsed.content,
      coverImage: parsed.coverImage,
      tags: parsed.tags,
      publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : null,
      locale: parsed.locale,
    })
    .where(eq(blogPosts.id, id));

  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(id: string) {
  await requireAdmin();
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
  revalidatePath("/admin/blog");
}
