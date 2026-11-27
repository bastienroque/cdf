import { locales, type Locale } from "@/i18n/config";

// Only same-site paths are allowed after login ("/admin/dashboard", not
// "//evil.example" or "https://evil.example").
export function safeNextPath(next: string | undefined | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/";
  }
  return next;
}

export function safeLocale(locale: string | undefined | null): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : "en";
}
