import { createNavigation } from "next-intl/navigation";
import { locales } from "./config";

export { locales };

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix: "always",
});
