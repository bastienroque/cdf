import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminTable, type AdminRow } from "@/components/admin/admin-table";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { Link } from "@/i18n/navigation";
import { deleteBlogPost } from "./actions";
import { getTranslations } from "next-intl/server";
import { FileText, Plus, Globe, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomButton } from "@/components/ui/custom-button";

export default async function AdminBlogPage() {
  const [data, t] = await Promise.all([
    db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        locale: blogPosts.locale,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt)),
    getTranslations("admin.blog"),
  ]);

  const rows: AdminRow[] = data.map((post) => {
    const isPublished = !!post.publishedAt;

    return {
      id: post.id,
      cells: [
        /* Title */
        <div
          key="title"
          className="flex items-center gap-2 font-body font-semibold text-foreground"
        >
          <FileText className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span>{post.title}</span>
        </div>,

        /* Locale Badge */
        <Badge
          key="locale"
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 font-mono text-xs uppercase tracking-wider text-amber-600"
        >
          <Globe className="mr-1 h-3 w-3 inline-block" />
          {post.locale.toUpperCase()}
        </Badge>,

        /* Status Badge */
        <Badge
          key="status"
          variant="outline"
          className={
            isPublished
              ? "border-amber-500/40 bg-amber-500/10 font-mono text-xs uppercase tracking-wider text-amber-600"
              : "border-border bg-muted/40 font-mono text-xs uppercase tracking-wider text-muted-foreground"
          }
        >
          {isPublished ? (
            <CheckCircle2 className="mr-1 h-3 w-3 inline-block" />
          ) : (
            <FileText className="mr-1 h-3 w-3 inline-block" />
          )}
          {isPublished ? t("table.status.published") : t("table.status.draft")}
        </Badge>,
      ],
      actions: (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="focus-ring rounded-sm border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground"
          >
            {t("table.actions.edit")}
          </Link>
          <DeleteRowButton
            label={t("table.actions.delete")}
            confirmMessage={t("table.actions.confirmDelete", {
              title: post.title,
            })}
            action={deleteBlogPost.bind(null, post.id)}
          />
        </div>
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* ---- Header Section ---- */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
              <FileText className="h-3.5 w-3.5" />
              {t("tag")}
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-1 font-body text-sm text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          <CustomButton href="/admin/blog/new" intent="amber" size="md">
            <Plus className="h-4 w-4" />
            <span>{t("newPost")}</span>
          </CustomButton>
        </div>
      </div>

      {/* ---- Table or Empty State ---- */}
      {rows.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {t("table.empty")}
          </p>
        </div>
      ) : (
        <AdminTable
          headers={[
            t("table.headers.title"),
            t("table.headers.locale"),
            t("table.headers.status"),
          ]}
          rows={rows}
        />
      )}
    </div>
  );
}
