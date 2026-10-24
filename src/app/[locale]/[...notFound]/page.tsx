import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ShieldAlert, Compass, ArrowLeft } from "lucide-react";

export default async function NotFoundPage() {
  const t = await getTranslations("common.notFound");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center font-body">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-amber-600">
        <ShieldAlert className="h-4 w-4" />
        <span>{t("badge")}</span>
      </div>

      {/* 404 Visual */}
      <div className="relative mb-6 select-none font-display text-8xl font-black uppercase tracking-tighter text-foreground/20 sm:text-9xl">
        404
        <div className="absolute inset-0 flex items-center justify-center text-amber-500/40 blur-xs">
          404
        </div>
      </div>

      {/* Content */}
      <h1 className="mb-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
        {t("title")}
      </h1>
      <p className="mb-8 font-body text-base text-muted-foreground leading-relaxed sm:text-lg">
        {t("description")}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-amber-600  transition-all hover:bg-amber-500 hover:text-black cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("returnHome")}</span>
        </Link>
        <Link
          href="/map"
          className="focus-ring inline-flex items-center gap-2 rounded-sm border border-border bg-card px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-foreground  transition-all hover:border-amber-500/40 hover:text-amber-500 cursor-pointer"
        >
          <Compass className="h-4 w-4" />
          <span>{t("openMap")}</span>
        </Link>
      </div>
    </div>
  );
}
