"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Award } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";

const SECTION_KEYS = [
  "origin",
  "name",
  "officialBirth",
  "spreadingAcrossPortugal",
  "legacy",
] as const;

const SECTION_PARAGRAPHS: Record<(typeof SECTION_KEYS)[number], string[]> = {
  origin: ["creator", "frenchInfluence", "inspiration"],
  name: ["nameOrigin", "moveToPorto"],
  officialBirth: ["firstVersion"],
  spreadingAcrossPortugal: [
    "adoptionInPorto",
    "poveiraVariant",
    "popularization",
  ],
  legacy: ["retirement", "restaurantClosure", "legacy"],
};

const PULLQUOTE_PARAGRAPH: Partial<
  Record<(typeof SECTION_KEYS)[number], string>
> = {
  name: "nameOrigin",
};

export default function HistoryOfFrancesinha() {
  const t = useTranslations("public.about.francesinha");

  return (
    <section className="relative overflow-hidden rounded-sm border border-amber-500/30 bg-card p-4  sm:p-10 md:p-12">
      {/* Drop Cap & Section Header */}
      <div className="mb-8 flex flex-row items-start gap-1 sm:gap-2">
        <div className="relative h-14 w-14 shrink-0 sm:h-20 sm:w-20 md:h-24 md:w-24">
          <Image
            src="/assets/letter-f.svg"
            alt="Letter F for Francesinha"
            fill
            className="object-contain drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
            priority
          />
        </div>
        <h2 className="-mt-1.5 -ml-1.5 font-display text-2xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-6xl">
          rancesinha
        </h2>
      </div>

      {/* Chapters & Content Mapping */}
      <div className="space-y-10 sm:space-y-12">
        {SECTION_KEYS.map((sectionKey) => {
          const paragraphKeys = SECTION_PARAGRAPHS[sectionKey];
          const pullquoteKey = PULLQUOTE_PARAGRAPH[sectionKey];

          return (
            <div
              key={sectionKey}
              className="border-b border-border/40 pb-8 last:border-0 last:pb-0"
            >
              <div className="mb-3 flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs uppercase tracking-widest text-amber-600">
                <span className="truncate">
                  {t(`sections.${sectionKey}.eyebrow`)}
                </span>
                <span className="h-px flex-1 bg-amber-500/20" />
              </div>

              <h3 className="mb-4 font-display text-lg sm:text-xl font-bold uppercase tracking-tight text-foreground md:text-2xl">
                {t(`sections.${sectionKey}.title`)}
              </h3>

              <div className="space-y-1 font-body text-sm sm:text-base text-foreground/90 leading-relaxed text-left">
                {paragraphKeys.map((paragraphKey) => {
                  const text = t(
                    `sections.${sectionKey}.paragraphs.${paragraphKey}`,
                  );

                  if (paragraphKey === pullquoteKey) {
                    return (
                      <blockquote
                        key={paragraphKey}
                        className="my-6 rounded-sm border-l-4 border-amber-500 bg-amber-500/10 px-4 sm:px-6 py-4 font-display text-base sm:text-lg md:text-xl font-bold tracking-wide text-amber-600"
                      >
                        <p>{text}</p>
                      </blockquote>
                    );
                  }

                  return <p key={paragraphKey}>{text}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard CTA Button */}
      <div className="mt-10 sm:mt-12 flex justify-center border-t border-border/60 pt-8">
        <CustomButton
          href="/leaderboard"
          variant="secondary"
          intent="amber"
          size="lg"
          className="ml-4"
        >
          <Award className="h-4 w-4 shrink-0 text-amber-500 " />
          <span>{t("cta")}</span>
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </CustomButton>
      </div>
    </section>
  );
}
