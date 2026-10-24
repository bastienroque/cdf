import { CustomButton } from "@/components/ui/custom-button";
import { Link } from "@/i18n/navigation";
import { Award } from "lucide-react";

interface MapTeaserProps {
  labels: {
    title: string;
    subtitle: string;
    cta: string;
  };
}

export function MapTeaser({ labels }: MapTeaserProps) {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-sm border border-amber-500/20 bg-brand-dark p-6 md:p-12 text-center shadow-xl">
        <Award className="h-8 w-8 text-amber-500 mb-1" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-brand-light">
          {labels.title}
        </h2>
        <p className="max-w-md font-body text-sm text-brand-steel">
          {labels.subtitle}
        </p>
        <CustomButton
          href="/map"
          variant="primary"
          intent="amber"
          className="w-full md:w-fit"
        >
          {labels.cta}
        </CustomButton>
      </div>
    </section>
  );
}
