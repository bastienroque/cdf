"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

const locales = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
] as const;

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchTo(locale: string) {
    setIsOpen(false);
    if (locale === currentLocale) return;
    router.replace(pathname, { locale });
  }

  return (
    <div
      className="relative"
      ref={containerRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger Button - opens on hover (desktop) or click (mobile/desktop) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground bg-muted/50 hover:bg-muted border border-border rounded-sm px-3 py-1.5 transition-colors cursor-pointer"
        aria-label="Language switcher"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-amber-500" />
        <span>{currentLocale.toUpperCase()}</span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 top-full pt-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-col bg-popover border border-amber-500/20  rounded-sm overflow-hidden min-w-18">
            {locales.map((l) => {
              const isActive = l.code === currentLocale;

              return (
                <button
                  key={l.code}
                  onClick={() => switchTo(l.code)}
                  className={`px-3 py-2 font-mono text-xs uppercase tracking-wider text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-amber-500/15 text-amber-500 font-semibold"
                      : "text-foreground hover:bg-muted hover:text-amber-600"
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
