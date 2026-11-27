import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ShareCard } from "@/components/public/share/share-card";
import { INSTAGRAM_URL } from "@/lib/social-links";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("public.share");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function SharePage() {
  const t = await getTranslations("public.share");
  const locale = await getLocale();

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  const homeUrl = `${siteUrl}/${locale}`;

  // Different utm_source values let you tell QR scans from shared links in analytics
  const qrUrl = `${homeUrl}?utm_source=qr&utm_medium=offline&utm_campaign=share_page`;
  const shareUrl = `${homeUrl}?utm_source=share&utm_medium=social&utm_campaign=share_page`;

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-md text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground print:hidden">
          {t("tag")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-3 font-body text-sm text-muted-foreground print:hidden">
          {t("description")}
        </p>

        <ShareCard
          qrUrl={qrUrl}
          shareUrl={shareUrl}
          displayUrl={homeUrl.replace(/^https?:\/\//, "")}
          labels={{
            scanHint: t("scanHint"),
            qrAlt: t("qrAlt"),
            share: t("share"),
            shareTitle: t("shareTitle"),
            shareText: t("shareText"),
          }}
        />

        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-sm border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-amber-600 transition-colors hover:bg-amber-500 hover:text-black print:hidden"
        >
          {t("instagram")}
        </a>
      </div>
    </section>
  );
}
