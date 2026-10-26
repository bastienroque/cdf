import { signIn } from "../actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  FieldLabel,
  FieldError,
  TextInput,
  PrimaryButton,
} from "@/components/form/form-field";
import { getTranslations } from "next-intl/server";
import { LogIn, KeyRound, Mail, Shield } from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/password-input";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale } = await params;
  const { next, error } = await searchParams;
  const t = await getTranslations("auth.signIn");

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <div className="mb-6 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Shield className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
      </div>

      <form action={signIn} className="flex flex-col gap-5">
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="next" value={next ?? "/"} />

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
          <div className="flex flex-col items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-amber-500" />
              <span>{t("passwordLabel")}</span>
            </div>
            <Link
              href="/contact"
              className="font-mono text-[10px] text-amber-600 hover:text-amber-500 transition-colors underline"
            >
              {t("forgotPasswordLink")}
            </Link>
          </div>
          <PasswordInput name="password" required />
        </FieldLabel>

        <PrimaryButton
          type="submit"
          className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black transition-all hover:bg-amber-400 cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5" />
          {t("submit")}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {t("noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-amber-600 hover:text-amber-500 underline transition-colors"
        >
          {t("signUpLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
