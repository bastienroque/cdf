import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, eq, desc, isNotNull } from "drizzle-orm";
import { EntityCard } from "@/components/ui/entity-card";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { Metadata } from "next";

interface BlogProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: BlogProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.blog" });

  return {
    title: t("title"),
  };
}

async function getBlogPosts(locale: string) {
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      coverImage: blogPosts.coverImage,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .where(and(eq(blogPosts.locale, locale), isNotNull(blogPosts.publishedAt)))
    .orderBy(desc(blogPosts.publishedAt));
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [rows, t] = await Promise.all([
    getBlogPosts(locale),
    getTranslations("public.blog"),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* ---- Header Section ---- */}
      <div className="mb-10 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <BookOpen className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* ---- Post Grid ---- */}
      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("empty")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((post) => (
            <EntityCard
              key={post.id}
              href={`/blog/${post.slug}`}
              image={post.coverImage}
              title={post.title}
              meta={
                post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString(locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
