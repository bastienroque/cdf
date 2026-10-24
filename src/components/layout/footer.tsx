"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CookiePreferencesButton } from "@/components/public/legal/cookie-preference-button";
import { navGroups } from "@/lib/nav-links";
import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();
  const t = useTranslations("common");

  return (
    <footer className="border-t border-amber-500/20 bg-brand-dark px-6 py-12 text-brand-light">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        {/* ---- Brand & Tagline ---- */}
        <div className="max-w-xs">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-h3 font-semibold tracking-tight group"
          >
            <Image
              src="/CDF_LOGO.svg"
              alt="Cavaleiros da Francesinha Logo"
              width={38}
              height={38}
              className="h-10 w-auto shrink-0 transition-transform group-hover:scale-105"
              priority
            />
            <span>Cavaleiros da Francesinha</span>
          </Link>
          <p className="mt-2 font-body text-sm leading-relaxed text-brand-steel">
            {t("footer.tagline")}
          </p>
        </div>

        {/* ---- Grouped Navigation Columns ---- */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {navGroups.map((group) => (
            <nav
              key={group.labelKey}
              aria-label={t(`nav.${group.labelKey}`)}
              className="flex flex-col gap-3"
            >
              <h3 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-semibold">
                {t(`nav.${group.labelKey}`)}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-xs uppercase tracking-wider text-brand-steel transition-colors hover:text-amber-400"
                    >
                      {t(`nav.${link.labelKey}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* ---- Legal & Cookie Preferences ---- */}
        <div className="flex flex-col gap-3">
          <h3 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-semibold">
            {t("footer.legalHeader")}
          </h3>
          <ul className="flex flex-col gap-2.5">
            <li>
              <Link
                href="/privacy"
                className="font-mono text-xs uppercase tracking-wider text-brand-steel transition-colors hover:text-amber-400"
              >
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <CookiePreferencesButton />
            </li>
          </ul>
        </div>
      </div>

      {/* ---- Copyright Notice ---- */}
      <div className="mx-auto mt-12 max-w-7xl border-t border-amber-500/10 pt-6">
        <p className="font-mono text-xs tracking-wider text-brand-steel/80">
          © {year} {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
