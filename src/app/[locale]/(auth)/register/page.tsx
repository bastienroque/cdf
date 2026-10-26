import { signUp } from "../actions";
import { AuthCard } from "@/components/auth/auth-card";
import {
  FieldLabel,
  FieldError,
  TextInput,
  PrimaryButton,
} from "@/components/form/form-field";
import { getTranslations } from "next-intl/server";
import {
  UserPlus,
  KeyRound,
  Mail,
  Shield,
  User,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { PasswordInput } from "@/components/auth/password-input";
import { Metadata } from "next";

interface RegisterPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; registered?: string }>;
}

interface RegisterProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: RegisterProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.register" });

  return {
    title: t("title"),
  };
}

export default async function RegisterPage({
  params,
  searchParams,
}: RegisterPageProps) {
  const { locale } = await params;
  const { error, registered } = await searchParams;
  const t = await getTranslations("auth.register");

  if (registered === "true") {
    return (
      <AuthCard
        title={t("successTitle") || "Account Submitted"}
        subtitle={t("successSubtitle") || "Pending Admin Review"}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-amber-500/10 p-3 text-amber-600 border border-amber-500/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="font-body text-sm text-foreground">
            {t("successMessage") ||
              "Your account has been successfully saved. An administrator is currently reviewing your account before activation."}
          </p>
          <div className="pt-2 w-full">
            <Link
              href="/login"
              className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black transition-all hover:bg-amber-400 w-full"
            >
              {t("signInLink") || "Return to Login"}
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
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

        {/* Username Field */}
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="h-3.5 w-3.5 text-amber-500" />
            <span>{t("usernameLabel") || "Username"}</span>
          </div>
          <TextInput
            type="text"
            name="username"
            required
            placeholder={t("usernamePlaceholder") || "Enter your username"}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          />
        </FieldLabel>

        {/* Email Field */}
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

        {/* Password Field */}
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex flex-col items-start justify-between gap-2 mb-1">
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

        {/* Confirm Password Field */}
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex items-center gap-1.5 mb-1">
            <KeyRound className="h-3.5 w-3.5 text-amber-500" />
            <span>{t("confirmPasswordLabel") || "Confirm Password"}</span>
          </div>
          <PasswordInput name="confirmPassword" required minLength={6} />
        </FieldLabel>

        <PrimaryButton
          type="submit"
          className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black transition-all hover:bg-amber-400 cursor-pointer"
        >
          <UserPlus className="h-3.5 w-3.5" />
          {t("submit")}
        </PrimaryButton>
      </form>

      <p className="mt-6 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-amber-600 hover:text-amber-500 underline text-nowrap transition-colors"
        >
          {t("signInLink")}
        </Link>
      </p>
    </AuthCard>
  );
}
