import { createNavigation } from "next-intl/navigation";

export const locales = ["pt", "en", "fr"] as const;

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "always",
});
