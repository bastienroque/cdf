"use client";

import { useConsent } from "@/hooks/use-consent";
import { Link } from "@/i18n/navigation";
import { loadGTM } from "@/lib/consent/load-gtm";
import { useTranslations } from "next-intl";
import { Cookie, ShieldCheck } from "lucide-react";

export function ConsentBanner() {
  const t = useTranslations("common.consent");
  const { consent, hydrated, accept, reject } = useConsent();

  if (!hydrated || consent !== "undetermined") return null;

  function handleAccept() {
    accept();
    loadGTM();
  }

  function handleReject() {
    reject();
  }

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-amber-500/40 bg-background/95 p-4 backdrop-blur-md shadow-2xl sm:px-8 sm:py-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Banner Text & Icon */}
        <div className="flex items-start gap-3 sm:items-center">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-600">
            <Cookie className="h-4 w-4" />
          </div>
          <p className="font-body text-xs text-muted-foreground sm:text-sm leading-relaxed">
            {t("message")}{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground underline hover:text-amber-600 transition-colors"
            >
              {t("privacyLink")}
            </Link>
            .
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={handleReject}
            type="button"
            className="focus-ring rounded-sm border border-border/80 bg-background px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-amber-500/40 hover:text-foreground cursor-pointer"
          >
            {t("reject")}
          </button>
          <button
            onClick={handleAccept}
            type="button"
            className="focus-ring flex items-center gap-1.5 rounded-sm bg-amber-500 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-black  transition-all hover:bg-amber-400 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
