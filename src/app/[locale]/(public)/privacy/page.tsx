import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  Cookie,
  ShieldCheck,
  Database,
  Lock,
  UserCheck,
} from "lucide-react";
import { CookiePreferencesButton } from "@/components/public/legal/cookie-preference-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "public.legal.privacy",
  });

  return {
    title: t("title"),
    description: t("overview.text"),
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("public.legal.privacy");

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border/80 bg-background px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-amber-500/40 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-amber-500" />
          {t("backLink")}
        </Link>
      </div>

      {/* Main Header */}
      <div className="mb-10 border-b border-border/60 pb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          GDPR / RGPD
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          {t("title")}
        </h1>
      </div>

      {/* Sections Grid / Layout */}
      <div className="flex flex-col gap-10 font-body">
        {/* Section 1: Overview */}
        <section className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
          <h2 className="font-display text-xl font-bold uppercase text-foreground mb-3">
            1. {t("overview.heading")}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t("overview.text")}
          </p>
        </section>

        {/* Section 2: Data We Collect */}
        <section className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Database className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              2. {t("dataCollection.heading")}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-sm border border-border/40 bg-muted/20 p-4">
              <h3 className="font-mono text-xs uppercase font-semibold text-amber-600 tracking-wider mb-2">
                {t("dataCollection.accountTitle")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("dataCollection.accountText")}
              </p>
            </div>
            <div className="rounded-sm border border-border/40 bg-muted/20 p-4">
              <h3 className="font-mono text-xs uppercase font-semibold text-amber-600 tracking-wider mb-2">
                {t("dataCollection.analyticsTitle")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t("dataCollection.analyticsText")}
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Cookies & Consent */}
        <section className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Cookie className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              3. {t("cookies.heading")}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            {t("cookies.intro")}
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-sm border border-border/40 bg-muted/10 p-3">
              <span className="font-mono text-xs font-bold uppercase text-foreground shrink-0 mt-0.5">
                {t("cookies.essentialTag")}:
              </span>
              <p className="text-xs text-muted-foreground">
                {t("cookies.essentialDesc")}
              </p>
            </div>
            <div className="flex items-start gap-3 rounded-sm border border-border/40 bg-muted/10 p-3">
              <span className="font-mono text-xs font-bold uppercase text-foreground shrink-0 mt-0.5">
                {t("cookies.analyticsTag")}:
              </span>
              <p className="text-xs text-muted-foreground">
                {t("cookies.analyticsDesc")}
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Infrastructure */}
        <section className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <Lock className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              4. {t("infrastructure.heading")}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            {t("infrastructure.intro")}
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
            <li>{t("infrastructure.supabase")}</li>
            <li>{t("infrastructure.vercel")}</li>
          </ul>
        </section>

        {/* Section 5: User Rights */}
        <section className="rounded-sm border border-border/60 bg-card p-6  sm:p-8">
          <div className="flex items-center gap-2.5 mb-4">
            <UserCheck className="h-5 w-5 text-amber-500" />
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              5. {t("rights.heading")}
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground mb-4">
            {t("rights.intro")}
          </p>
          <div className="grid gap-3 sm:grid-cols-3 mb-6">
            <div className="border-l-2 border-amber-500 pl-3">
              <h4 className="font-mono text-xs font-semibold uppercase text-foreground">
                {t("rights.accessTitle")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t("rights.accessDesc")}
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <h4 className="font-mono text-xs font-semibold uppercase text-foreground">
                {t("rights.rectificationTitle")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t("rights.rectificationDesc")}
              </p>
            </div>
            <div className="border-l-2 border-amber-500 pl-3">
              <h4 className="font-mono text-xs font-semibold uppercase text-foreground">
                {t("rights.erasureTitle")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {t("rights.erasureDesc")}
              </p>
            </div>
          </div>
          <p className="text-xs font-mono text-amber-600">
            {t("rights.contact")}{" "}
            <a
              href="mailto:contact@cavaleirosdafrancesinha.com"
              className="underline hover:text-foreground"
            >
              contact@cavaleirosdafrancesinha.com
            </a>
          </p>
        </section>
      </div>

      {/* Interactive Preference Controls */}
      <div className="mt-10 rounded-sm border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-mono text-xs font-bold uppercase text-foreground tracking-wider">
            {t("manageCookiesLabel")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("manageCookiesSub")}
          </p>
        </div>
        <CookiePreferencesButton />
      </div>
    </div>
  );
}
