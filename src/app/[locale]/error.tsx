"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert, RotateCcw } from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common.error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center font-body">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-600">
        <ShieldAlert className="h-4 w-4" />
        <span>{t("badge")}</span>
      </div>
      <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mb-8 text-base text-muted-foreground leading-relaxed">
        {t("description")}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-amber-600 transition-all hover:bg-amber-500 hover:text-black cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{t("retry")}</span>
        </button>
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border bg-card px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-foreground transition-all hover:border-amber-500/40 hover:text-amber-500"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
