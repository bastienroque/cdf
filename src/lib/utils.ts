import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalizedName(
  item: { namePt: string; nameEn?: string | null; nameFr?: string | null },
  locale: string,
): string {
  if (locale === "en" && item.nameEn?.trim()) return item.nameEn;
  if (locale === "fr" && item.nameFr?.trim()) return item.nameFr;
  return item.namePt;
}
