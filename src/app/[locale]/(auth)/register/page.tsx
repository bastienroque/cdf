import { signUp } from "../actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  FieldLabel,
  FieldError,
  TextInput,
  PrimaryButton,
} from "@/components/form/form-field";

import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { UserPlus, KeyRound, Mail, Shield } from "lucide-react";
import { PasswordInput } from "@/components/auth/password-input";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;

  const t = await getTranslations("auth.register");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      {/* Header Tag Badge */}
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Shield className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
      </div>

      <form action={signUp} className="flex flex-col gap-5">
        <input type="hidden" name="locale" value={locale} />

        {error && (
          <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs uppercase text-red-500">
            <FieldError message={error} />
          </div>
        )}

        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex items-center gap-1.5 mb-1">
            <Mail className="h-3.5 w-3.5 text-amber-500" />
            <span>{t("emailLabel")}</span>
          </div>
          <TextInput
            type="email"
            name="email"
            required
            placeholder={t("emailPlaceholder")}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          />
        </FieldLabel>

        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              <span>{t("passwordLabel")}</span>
            </div>
            <span className="font-mono text-[10px] normal-case text-muted-foreground">
              {t("passwordHint")}
            </span>
          </div>
          <PasswordInput name="password" required minLength={6} />
        </FieldLabel>

        <PrimaryButton
          type="submit"
          className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black  transition-all hover:bg-amber-400 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t("submit")}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-500 underline transition-colors"
        >
          {t("signInLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
