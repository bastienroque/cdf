import type { ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export interface HistoryChapter {
  /** Matches `sections.<key>` in the messages file */
  key: string;
  /** Matches `sections.<key>.paragraphs.<paragraph>`, rendered in this order */
  paragraphs: readonly string[];
  /** Optional paragraph to render as a highlighted pull quote */
  pullquote?: string;
}

interface HistorySectionProps {
  /** next-intl namespace, e.g. "public.about.cavaleiros" */
  namespace: string;
  /** Full title, e.g. "Cavaleiros". Its first letter is shown as the illustrated drop cap */
  title: string;
  dropCapSrc: string;
  chapters: readonly HistoryChapter[];
  /** Preload the drop cap image (use only for the section that appears first) */
  priority?: boolean;
  /** Optional content after the chapters (e.g. a call to action) */
  footer?: ReactNode;
}

export function HistorySection({
  namespace,
  title,
  dropCapSrc,
  chapters,
  priority = false,
  footer,
}: HistorySectionProps) {
  // Cast keeps dynamic keys working even if next-intl's strict message typing is enabled
  const t = useTranslations(namespace) as (key: string) => string;

  return (
    <section className="relative overflow-hidden rounded-sm border border-amber-500/30 bg-card p-4 sm:p-10 md:p-12">
      {/* Illuminated drop cap + the rest of the title */}
      <div className="mb-8 flex flex-row items-start gap-1 sm:gap-2">
        <div className="relative h-14 w-14 shrink-0 sm:h-20 sm:w-20 md:h-24 md:w-24">
          {/* Decorative: the full title is announced by the heading's aria-label */}
          <Image
            src={dropCapSrc}
            alt=""
            fill
            className="object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
            priority={priority}
          />
        </div>
        <h2
          aria-label={title}
          className="-mt-1.5 -ml-1.5 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-6xl"
        >
          {title.slice(1)}
        </h2>
      </div>

      {/* Chapters */}
      <div className="space-y-10 sm:space-y-12">
        {chapters.map(({ key, paragraphs, pullquote }) => (
          <div
            key={key}
            className="border-b border-border/40 pb-8 last:border-0 last:pb-0"
          >
            <div className="mb-3 flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
              <span className="truncate">{t(`sections.${key}.eyebrow`)}</span>
              <span className="h-px flex-1 bg-amber-500/20" />
            </div>

            <h3 className="mb-4 font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
              {t(`sections.${key}.title`)}
            </h3>

            <div className="space-y-1 font-body text-sm sm:text-base text-foreground/90 leading-relaxed text-left">
              {paragraphs.map((paragraph) => {
                const text = t(`sections.${key}.paragraphs.${paragraph}`);

                return paragraph === pullquote ? (
                  <blockquote
                    key={paragraph}
                    className="my-6 rounded-sm border-l-4 border-amber-500 bg-amber-500/10 px-4 sm:px-6 py-4 font-display text-base sm:text-lg md:text-xl font-bold tracking-wide text-amber-600"
                  >
                    <p>{text}</p>
                  </blockquote>
                ) : (
                  <p key={paragraph}>{text}</p>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {footer}
    </section>
  );
}
