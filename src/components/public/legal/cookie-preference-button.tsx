"use client";
import { useTranslations } from "next-intl";
import { useConsent } from "@/hooks/use-consent";

export function CookiePreferencesButton() {
  const t = useTranslations("public.legal.privacy");
  const { reset } = useConsent();

  return (
    <button
      onClick={reset}
      className="font-body text-ui text-brand-steel hover:text-accent cursor-pointer"
    >
      {t("manageCookiesLabel")}
    </button>
  );
}
