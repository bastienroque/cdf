"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { signOut } from "@/app/[locale]/(auth)/actions";

export function AccountMenu({
  locale,
  isLoggedIn,
  onClick,
}: {
  locale: string;
  isLoggedIn: boolean;
  onClick?: () => void;
}) {
  const t = useTranslations("auth");

  if (!isLoggedIn) {
    return (
      <Link
        href={`/${locale}/login`}
        onClick={onClick}
        className="font-body text-ui font-medium text-action hover:underline"
      >
        {t("signIn.submit")}
      </Link>
    );
  }

  return (
    <form action={signOut} className="flex items-center gap-2">
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="font-body text-ui text-muted-foreground hover:text-foreground cursor-pointer"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
