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
        {/* ---- Brand, Tagline & Socials ---- */}
        <div className="flex flex-col gap-6 max-w-xs">
          <div>
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

          <div className="flex flex-row items-center gap-4 md:block md:space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-semibold">
              {t("footer.socialHeader")}
            </h3>
            <a
              href="https://www.instagram.com/cavaleiros_da_francesinha/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-amber-500/30 bg-amber-500/10 text-amber-500 transition-colors hover:bg-amber-500 hover:text-black"
            >
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
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
