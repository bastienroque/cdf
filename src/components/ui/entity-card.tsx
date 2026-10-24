"use client";

import { Link } from "@/i18n/navigation";
import { UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";

export function EntityCard({
  href,
  image,
  title,
  meta,
  badge,
}: {
  href: string;
  image?: string | null;
  title: string;
  meta?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <Link
      href={href}
      className="focus-ring group flex flex-col overflow-hidden rounded-lg bg-card ring-1 ring-foreground/10 transition-shadow hover:ring-foreground/20"
    >
      {/* Fixed-height container to prevent layout shift */}
      <div className="relative h-40 w-full overflow-hidden bg-muted/30 border-b border-border/40 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground/40 p-4 text-center">
            <UtensilsCrossed className="h-8 w-8" />
            <span className="font-body text-sm">{t("imageUnavailable")}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 p-4">
        {badge && <div>{badge}</div>}
        <p className="font-display text-h3 font-medium text-foreground group-hover:text-action">
          {title}
        </p>
        {meta && (
          <p className="font-body text-ui text-muted-foreground">{meta}</p>
        )}
      </div>
    </Link>
  );
}
