import { getTranslations } from "next-intl/server";
import { Mail } from "lucide-react";
import ContactForm from "@/components/form/contact-form";
import { Metadata } from "next";

interface ContactProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ContactProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "public.contact" });

  return {
    title: t("title"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("public.contact");

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* ---- Header Section ---- */}
      <div className="mb-8 border-b border-border/60 pb-6 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs uppercase tracking-widest text-amber-600">
          <Mail className="h-3.5 w-3.5" />
          {t("tag")}
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground uppercase">
          {t("title")}
        </h1>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* ---- Form Component ---- */}
      <ContactForm />
    </div>
  );
}
