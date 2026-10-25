import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type RefObject,
} from "react";
import { getLocalizedName } from "@/lib/utils";

export interface CatalogItem {
  id: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
}

const MAX_RESULTS = 50;

// Lowercase and strip accents so "acucar" matches "Açúcar"
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Search over a catalog (ingredients, tags...).
 * - Precomputes normalized names once per list/locale, not on every keystroke or render.
 * - Matches against ALL languages, so "sugar" finds "Açúcar" while browsing in PT.
 * - `canCreate` is false when the query exactly matches a name in ANY language.
 */
export function useCatalogSearch<T extends CatalogItem>(
  items: T[],
  locale: string,
) {
  const [query, setQuery] = useState("");

  const indexed = useMemo(
    () =>
      items.map((item) => {
        const label = getLocalizedName(item, locale);
        const names = [label, item.namePt, item.nameEn, item.nameFr]
          .filter((n): n is string => Boolean(n))
          .map(normalizeText);
        return { item, label, names, searchText: names.join(" ") };
      }),
    [items, locale],
  );

  const trimmedQuery = query.trim();
  const normalizedQuery = normalizeText(trimmedQuery);

  const matches = useMemo(
    () =>
      normalizedQuery
        ? indexed.filter((entry) => entry.searchText.includes(normalizedQuery))
        : indexed,
    [indexed, normalizedQuery],
  );

  const canCreate =
    normalizedQuery.length > 0 &&
    !indexed.some((entry) => entry.names.includes(normalizedQuery));

  const reset = useCallback(() => setQuery(""), []);

  return {
    query,
    setQuery,
    reset,
    trimmedQuery,
    results: matches.slice(0, MAX_RESULTS),
    hasMore: matches.length > MAX_RESULTS,
    canCreate,
  };
}

/**
 * Calls onDismiss when the user clicks outside `ref` or presses Escape.
 * `onDismiss` should be stable (wrap it in useCallback).
 */
export function useDismiss<T extends HTMLElement>(
  ref: RefObject<T | null>,
  active: boolean,
  onDismiss: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismiss();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, active, onDismiss]);
}
