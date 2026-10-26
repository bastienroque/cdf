"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import { useCatalogPicker } from "@/lib/use-catalog-picker";
import type { CatalogItem } from "@/lib/use-catalog-search";
import { CatalogSearchPanel } from "../../catalog-search-panel";

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

  const picker = useCatalogPicker({
    items: ingredientsMaster,
    locale,
    onCreate: (newName) => onCreateInlineIngredient(index, newName),
    closeAfterCreate: true, // a single ingredient is chosen per row
  });

  function handleSelect(ing: CatalogItem) {
    onSelectIngredient(index, ing);
    picker.close();
  }

  return (
    <div ref={picker.containerRef} className="space-y-1.5 pr-8">
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
              picker.open();
            }}
            className="text-xs text-amber-600 hover:underline font-mono cursor-pointer!"
          >
            {t("change")}
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-expanded={picker.isOpen}
            aria-controls={picker.panelId}
            onClick={picker.toggle}
            className="w-full flex items-center justify-between border border-border bg-background px-3 py-2.5 rounded-sm text-muted-foreground font-mono text-sm text-left hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <span>{t("chooseOrSearch")}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>

          {picker.isOpen && (
            <CatalogSearchPanel
              picker={picker}
              placeholder={t("searchIngredientPlaceholder")}
              createLabel={t("createInline", { query: picker.trimmedQuery })}
              className="absolute z-20 mt-1 w-full p-2"
              listClassName="max-h-40"
              renderItem={({ item, label }) => (
                <button
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono hover:bg-amber-500/15 hover:text-amber-500 transition-colors"
                >
                  {label}
                </button>
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}
