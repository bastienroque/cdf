"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { TextInput } from "@/components/form/form-field";
import {
  CatalogItem,
  useCatalogSearch,
  useDismiss,
} from "@/lib/use-catalog-search";

interface IngredientNameSelectorProps {
  name: string; // Current selected display name or ID
  index: number;
  ingredientsMaster: CatalogItem[];
  onSelectIngredient: (index: number, ing: CatalogItem) => void;
  onCreateInlineIngredient: (index: number, name: string) => Promise<void>;
  onChangeIngredientName: (index: number) => void;
}

const EMPTY_INGREDIENTS: CatalogItem[] = [];

export function IngredientNameSelector({
  name,
  index,
  ingredientsMaster = EMPTY_INGREDIENTS,
  onSelectIngredient,
  onCreateInlineIngredient,
  onChangeIngredientName,
}: IngredientNameSelectorProps) {
  const t = useTranslations("admin.reviews.form");
  const locale = useLocale(); // 'pt' | 'en' | 'fr'
  const panelId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, reset, trimmedQuery, results, hasMore, canCreate } =
    useCatalogSearch(ingredientsMaster, locale);

  const close = useCallback(() => {
    setIsOpen(false);
    setCreateFailed(false);
    reset();
  }, [reset]);

  // Close on outside click or Escape
  useDismiss(containerRef, isOpen, close);

  // Focus the search box when the panel opens (instead of the autoFocus prop)
  useEffect(() => {
    if (isOpen) searchRef.current?.focus();
  }, [isOpen]);

  function handleSelect(ing: CatalogItem) {
    onSelectIngredient(index, ing);
    close();
  }

  async function handleCreate() {
    if (isCreating) return; // guard against double clicks
    setIsCreating(true);
    setCreateFailed(false);
    try {
      await onCreateInlineIngredient(index, trimmedQuery);
      close();
    } catch (error) {
      console.error("Failed to create ingredient inline", error);
      setCreateFailed(true); // keep the panel open so the admin can retry
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div ref={containerRef} className="space-y-1.5 pr-8">
      <span className="block font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
        {t("ingredientNameLabel")}
      </span>

      {name ? (
        <div className="flex items-center justify-between border border-border bg-background px-3 py-2 rounded-sm">
          <span className="font-mono text-sm font-bold text-foreground">
            {name}
          </span>
          <button
            type="button"
            onClick={() => {
              onChangeIngredientName(index);
              setIsOpen(true);
            }}
            className="text-xs text-amber-600 hover:underline font-mono"
          >
            {t("change")}
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={panelId}
            onClick={() => (isOpen ? close() : setIsOpen(true))}
            className="w-full flex items-center justify-between border border-border bg-background px-3 py-2.5 rounded-sm text-muted-foreground font-mono text-sm text-left hover:border-amber-500/40 transition-colors"
          >
            <span>{t("chooseOrSearch")}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>

          {isOpen && (
            <div
              id={panelId}
              className="absolute z-20 mt-1 w-full rounded-sm border border-amber-500/40 bg-popover p-2 space-y-2 shadow-md"
            >
              <TextInput
                ref={searchRef}
                aria-label={t("searchIngredientPlaceholder")}
                placeholder={t("searchIngredientPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs"
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {results.map(({ item, label }) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono hover:bg-amber-500/15 hover:text-amber-500 transition-colors"
                  >
                    {label}
                  </button>
                ))}

                {hasMore && (
                  <p className="px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                    {t("keepTypingToNarrow")}
                  </p>
                )}

                {canCreate && (
                  <button
                    type="button"
                    disabled={isCreating}
                    onClick={() => void handleCreate()}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold disabled:opacity-60"
                  >
                    {t("createInline", { query: trimmedQuery })}
                  </button>
                )}

                {createFailed && (
                  <p
                    role="alert"
                    className="px-2.5 py-1 font-mono text-[11px] text-destructive"
                  >
                    {t("createFailed")}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
