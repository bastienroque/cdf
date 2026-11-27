import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { AdminTable, type AdminRow } from "@/components/admin/admin-table";
import { DeleteRowButton } from "@/components/ui/delete-row-button";
import { Badge } from "@/components/ui/badge";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { reactivateUser, setUserRole, suspendUser } from "./actions";

const buttonClass =
  "focus-ring rounded-sm border border-border bg-background px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground cursor-pointer";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // The proxy already limits this page to the super admin; check again here.
  const currentUserId = await requireSuperAdmin();

  const [profiles, authResult, t] = await Promise.all([
    db
      .select({
        id: users.id,
        displayName: users.display_name,
        role: users.role,
        createdAt: users.created_at,
      })
      .from(users)
      .orderBy(asc(users.created_at)),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    getTranslations("admin.users"),
  ]);

  const authById = new Map((authResult.data?.users ?? []).map((u) => [u.id, u]));
  const formatDate = (value: string | Date | null | undefined) =>
    value
      ? new Date(value).toLocaleDateString(locale, {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const rows: AdminRow[] = profiles.map((p) => {
    const account = authById.get(p.id);
    const suspended = Boolean(
      account?.banned_until && new Date(account.banned_until) > new Date(),
    );
    const isSelf = p.id === currentUserId;
    const locked = isSelf || p.role === "super_admin";

    return {
      id: p.id,
      cells: [
        <div key="user" className="flex flex-col">
          <span className="font-semibold text-foreground">
            {p.displayName}
            {isSelf && (
              <span className="ml-2 font-mono text-[10px] uppercase text-amber-600">
                {t("you")}
              </span>
            )}
          </span>
          <span className="break-all font-mono text-xs text-muted-foreground">
            {account?.email ?? "—"}
          </span>
        </div>,

        locked ? (
          <Badge key="role" variant="outline" className="font-mono text-xs uppercase">
            {t(`roles.${p.role}`)}
          </Badge>
        ) : (
          <form key="role" action={setUserRole.bind(null, p.id)} className="flex flex-wrap items-center gap-2">
            <select
              name="role"
              defaultValue={p.role}
              aria-label={t("table.headers.role")}
              className="focus-ring rounded-sm border border-border bg-background px-2 py-1 font-mono text-xs uppercase"
            >
              <option value="user">{t("roles.user")}</option>
              <option value="admin">{t("roles.admin")}</option>
            </select>
            <button type="submit" className={buttonClass}>
              {t("actions.saveRole")}
            </button>
          </form>
        ),

        <Badge
          key="status"
          variant="outline"
          className={`font-mono text-xs uppercase ${
            suspended
              ? "border-red-500/40 bg-red-500/10 text-red-500"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
          }`}
        >
          {suspended ? t("status.suspended") : t("status.active")}
        </Badge>,

        <span key="joined" className="font-mono text-xs text-muted-foreground">
          {formatDate(p.createdAt)}
        </span>,

        <span key="last" className="font-mono text-xs text-muted-foreground">
          {formatDate(account?.last_sign_in_at)}
        </span>,
      ],
      actions: locked ? null : suspended ? (
        <form action={reactivateUser.bind(null, p.id)}>
          <button type="submit" className={buttonClass}>
            {t("actions.reactivate")}
          </button>
        </form>
      ) : (
        <DeleteRowButton
          label={t("actions.suspend")}
          confirmMessage={t("actions.confirmSuspend", { name: p.displayName })}
          action={suspendUser.bind(null, p.id)}
        />
      ),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 space-y-6">
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
          <Users className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {authResult.error && (
        <p role="alert" className="rounded-sm border border-red-500/40 bg-red-500/10 p-4 font-mono text-xs text-red-500">
          {t("authError")}
        </p>
      )}

      <div className="md:overflow-x-auto">
        <AdminTable
          headers={[
            t("table.headers.user"),
            t("table.headers.role"),
            t("table.headers.status"),
            t("table.headers.joined"),
            t("table.headers.lastSignIn"),
          ]}
          rows={rows}
          emptyMessage={t("empty")}
        />
      </div>
    </div>
  );
}
