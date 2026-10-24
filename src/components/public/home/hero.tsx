import { CustomButton } from "@/components/ui/custom-button";
import { Link } from "@/i18n/navigation";
import { Shield, MapPin } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  badge: string;
  title: string;
  subtitle: string;
  exploreAction: string;
  mapAction: string;
}

export function Hero({
  badge,
  title,
  subtitle,
  exploreAction,
  mapAction,
}: HeroProps) {
  return (
    <section className="relative overflow-hidden flex flex-col items-center gap-6 border-b border-border/60 px-6 py-28 text-center bg-linear-to-b from-background via-muted/20 to-background">
      {/* Background Knight Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.25] dark:opacity-[0.18] select-none">
        <Image
          src="/knight-hero.jpeg"
          alt=""
          width={1800}
          height={1600}
          className="object-cover w-full h-full scale-105"
          priority
        />
      </div>

      <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono tracking-widest text-amber-600 uppercase">
        <Shield className="h-3.5 w-3.5" />
        {badge}
      </div>

      <h1 className="relative z-10 max-w-3xl font-display text-4xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="relative z-10 max-w-lg font-body text-base sm:text-lg text-foreground/70">
        {subtitle}
      </p>

      <div className="relative z-10 flex flex-wrap justify-center gap-4 mt-2">
        <CustomButton href="/restaurants" className="w-fit">
          {exploreAction}
        </CustomButton>

        <CustomButton href="/map" variant="outline">
          <MapPin className="h-4 w-4" />
          {mapAction}
        </CustomButton>
      </div>
    </section>
  );
}
