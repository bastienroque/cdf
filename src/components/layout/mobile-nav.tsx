"use client";

import { useState, useEffect } from "react";
import { Menu, X, Shield, LogOut, LogIn } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { navGroups } from "@/lib/nav-links";
import { LocaleSwitcher } from "./locale-switcher";
import { AdminNavMenu } from "./admin-nav-menu";
import { AccountMenu } from "./account-menu";

interface MobileNavProps {
  currentLocale: string;
  isLoggedIn: boolean;
  role: string | null;
}

export function MobileNav({ currentLocale, isLoggedIn, role }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("common.nav");

  // Lock body scroll when the full-screen menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const triggerButtonClasses =
    "focus-ring h-10 w-10 flex items-center justify-center rounded-sm border border-border bg-card text-foreground transition-colors hover:border-amber-500/40 hover:text-amber-500 cursor-pointer shrink-0";

  return (
    <>
      {/* Static Menu Button in Top Bar */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        className={triggerButtonClasses}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Full-Screen Drawer Bounded to Viewport Width */}
      {open && (
        <div className="fixed left-0 right-0 top-16.25 bottom-0 z-50 w-screen max-w-full bg-background px-6 py-6 overflow-y-auto flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="space-y-4 pb-10">
            {/* Admin Section (If applicable) */}
            {role === "admin" && (
              <div className="space-y-2 border-b border-border pb-4">
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-600/80">
                  Admin Codex
                </div>
                <AdminNavMenu onNavigate={() => setOpen(false)} />
              </div>
            )}

            {/* Language Switcher & Account Section */}
            <div className="flex items-center justify-between border-b border-border pb-4 pt-1">
              <LocaleSwitcher currentLocale={currentLocale} />
              {role === "admin" && (
                <AccountMenu
                  locale={currentLocale}
                  isLoggedIn={isLoggedIn}
                  onClick={() => setOpen(false)}
                />
              )}
            </div>

            {/* Navigation Groups & Links */}
            <div className="space-y-4">
              {navGroups.map((group) => {
                const groupLabel = t(group.labelKey);

                return (
                  <div key={group.labelKey} className="space-y-1.5">
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-600/80 px-1">
                      {groupLabel}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {group.links.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="focus-ring flex items-center justify-between rounded-md border border-border/60 bg-card/40 px-4 py-3 font-display text-sm font-semibold capitalize tracking-wider text-foreground transition-all hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-500"
                        >
                          <span>{t(link.labelKey)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Badge */}
          <div className="pt-4 border-t border-border text-center shrink-0">
            <div className="inline-flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <Shield className="h-3.5 w-3.5 text-amber-500/60" />
              <span>Cavaleiros da Francesinha</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
