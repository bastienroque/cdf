import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Calendar, Tag, BookOpen } from "lucide-react";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const [[post], t] = await Promise.all([
    db
      .select()
      .from(blogPosts)
      .where(
        and(
          eq(blogPosts.slug, slug),
          eq(blogPosts.locale, locale),
          isNotNull(blogPosts.publishedAt),
        ),
      )
      .limit(1),
    getTranslations("public.blog"),
  ]);

  if (!post) notFound();

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-4xl px-6 py-12">
      {/* ---- Back Action ---- */}
      <div className="mb-8">
        <Link
          href="/blog"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
          {t("detail.backLink")}
        </Link>
      </div>

      {/* ---- Header Section ---- */}
      <header className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <BookOpen className="h-3.5 w-3.5" />
          {t("tag")}
        </div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-4xl uppercase">
          {post.title}
        </h1>

        {formattedDate && (
          <div className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-amber-500" />
            <span>
              {t("detail.publishedOn")} {formattedDate}
            </span>
          </div>
        )}
      </header>

      {/* ---- Cover Image ---- */}
      {post.coverImage && (
        <div className="relative mb-10 h-72 w-full overflow-hidden rounded-sm border border-amber-500/30 bg-card  sm:h-96">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
      )}

      {/* ---- Content Block ---- */}
      <div className="prose prose-amber dark:prose-invert max-w-none rounded-sm border border-border/60 bg-card p-6  sm:p-10">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* ---- Tags Footer ---- */}
      {post.tags && post.tags.length > 0 && (
        <footer className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/60 pt-6">
          <div className="mr-2 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amber-600">
            <Tag className="h-3.5 w-3.5" />
            <span>{t("detail.tags")}:</span>
          </div>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm border border-border bg-muted/60 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </footer>
      )}
    </article>
  );
}
