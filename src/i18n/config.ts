export const locales = ["pt", "en", "fr"] as const;
export type Locale = (typeof locales)[number];

// Visitors whose browser language is none of the above get English.
export const defaultLocale: Locale = "en";
