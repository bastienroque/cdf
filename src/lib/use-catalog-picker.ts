import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  useCatalogSearch,
  useDismiss,
  type CatalogItem,
} from "@/lib/use-catalog-search";

interface UseCatalogPickerOptions {
  items: CatalogItem[];
  locale: string;
  /** Creates a new catalog item from the typed name. Should throw on failure. */
  onCreate: (name: string) => Promise<void>;
  /** Close the panel after a successful create (default: stay open, clear the query) */
  closeAfterCreate?: boolean;
}

/**
 * Everything the ingredient and tag pickers have in common:
 * open/close state, search, create-inline with pending/error handling,
 * click-outside + Escape dismissal, and focusing the search box on open.
 */
export function useCatalogPicker<T extends CatalogItem>({
  items,
  locale,
  onCreate,
  closeAfterCreate = false,
}: UseCatalogPickerOptions & { items: T[] }) {
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const search = useCatalogSearch(items, locale);
  const { reset, trimmedQuery } = search;

  const open = useCallback(() => setIsOpen(true), []);

  const close = useCallback(() => {
    setIsOpen(false);
    setCreateFailed(false);
    reset();
  }, [reset]);

  const toggle = useCallback(
    () => (isOpen ? close() : open()),
    [isOpen, close, open],
  );

  // Close on outside click or Escape
  useDismiss(containerRef, isOpen, close);

  // Focus the search box when the panel opens (instead of the autoFocus prop)
  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  async function create() {
    if (isCreating) return; // guard against double clicks
    setIsCreating(true);
    setCreateFailed(false);
    try {
      await onCreate(trimmedQuery);
      if (closeAfterCreate) close();
      else reset();
    } catch (error) {
      console.error("Failed to create catalog item inline", error);
      setCreateFailed(true); // keep the panel open so the admin can retry
    } finally {
      setIsCreating(false);
    }
  }

  return {
    ...search, // query, setQuery, reset, trimmedQuery, results, hasMore, canCreate
    panelId,
    containerRef,
    searchRef,
    isOpen,
    open,
    close,
    toggle,
    isCreating,
    createFailed,
    create,
  };
}

export type CatalogPicker<T extends CatalogItem> = ReturnType<
  typeof useCatalogPicker<T>
>;
