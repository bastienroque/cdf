import HistoryOfCavaleiros from "@/components/public/about/history-of-cavaleiros";
import HistoryOfFrancesinha from "@/components/public/about/history-of-francesinha";
import { getTranslations } from "next-intl/server";
import { Scroll } from "lucide-react";
import { Metadata } from "next";

interface AboutProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.about" });

  return {
    title: t("title"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("public.about");

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col gap-12">
      {/* Header Banner */}
      <div className="border-b border-border/60 pb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Scroll className="h-3.5 w-3.5" />
          <span>Chronicles & Archives</span>
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl font-body text-base text-muted-foreground leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Main Historical Sections */}
      <div className="flex flex-col gap-12">
        <HistoryOfFrancesinha />
        <HistoryOfCavaleiros />
      </div>
    </div>
  );
}
