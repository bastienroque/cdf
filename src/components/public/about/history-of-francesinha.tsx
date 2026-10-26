import { useTranslations } from "next-intl";
import { ArrowRight, Award } from "lucide-react";
import { CustomButton } from "@/components/ui/custom-button";
import {
  HistorySection,
  type HistoryChapter,
} from "@/components/public/about/history-section";

const CHAPTERS: HistoryChapter[] = [
  {
    key: "origin",
    paragraphs: ["creator", "frenchInfluence", "inspiration"],
  },
  {
    key: "name",
    paragraphs: ["nameOrigin", "moveToPorto"],
    pullquote: "nameOrigin",
  },
  { key: "officialBirth", paragraphs: ["firstVersion"] },
  {
    key: "spreadingAcrossPortugal",
    paragraphs: ["adoptionInPorto", "poveiraVariant", "popularization"],
  },
  {
    key: "legacy",
    paragraphs: ["retirement", "restaurantClosure", "legacy"],
  },
];

export default function HistoryOfFrancesinha() {
  const t = useTranslations("public.about.francesinha");

  return (
    <HistorySection
      namespace="public.about.francesinha"
      title="Francesinha"
      dropCapSrc="/assets/letter-f.svg"
      chapters={CHAPTERS}
      footer={
        <div className="mt-10 sm:mt-12 flex justify-center border-t border-border/60 pt-8">
          <CustomButton
            href="/leaderboard"
            variant="secondary"
            intent="amber"
            size="lg"
            className="flex gap-2"
          >
            <Award className="h-4 w-4 shrink-0 text-amber-500" />
            <span>{t("cta")}</span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </CustomButton>
        </div>
      }
    />
  );
}
