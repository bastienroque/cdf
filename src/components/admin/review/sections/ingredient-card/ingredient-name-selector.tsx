"use client";

import { useState, MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/utils"; // wherever you placed the helper

import { ChevronDown } from "lucide-react";
import { TextInput } from "@/components/form/form-field";

interface IngredientNameSelectorProps {
  name: string; // Current selected display name or ID
  index: number;
  ingredientsMaster: {
    id: string;
    namePt: string;
    nameEn: string | null;
    nameFr: string | null;
  }[];
  onSelectIngredient: (
    index: number,
    ing: {
      id: string;
      namePt: string;
      nameEn: string | null;
      nameFr: string | null;
    },
  ) => void;
  onCreateInlineIngredient: (index: number, name: string) => Promise<void>;
  onChangeIngredientName: (index: number) => void;
}

export function IngredientNameSelector({
  name,
  index,
  ingredientsMaster,
  onSelectIngredient,
  onCreateInlineIngredient,
  onChangeIngredientName,
}: IngredientNameSelectorProps) {
  const t = useTranslations("admin.reviews.form");
  const locale = useLocale(); // Get current locale ('pt', 'en', 'fr')
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (ingredientsMaster || []).filter((ing) => {
    const localized = getLocalizedName(ing, locale);
    return localized.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exactMatch = (ingredientsMaster || []).some((ing) => {
    const localized = getLocalizedName(ing, locale);
    return localized.toLowerCase() === searchQuery.trim().toLowerCase();
  });

  return (
    <div className="space-y-1.5 pr-8">
      <label className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
        {t("ingredientNameLabel")}
      </label>
      {name ? (
        <div className="flex items-center justify-between border border-border bg-background px-3 py-2 rounded-sm">
          <span className="font-mono text-sm font-bold text-foreground">
            {name}
          </span>
          <button
            type="button"
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
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
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-full flex items-center justify-between border border-border bg-background px-3 py-2.5 rounded-sm text-muted-foreground font-mono text-sm text-left hover:border-amber-500/40 transition-colors"
          >
            <span>{t("chooseOrSearch")}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {isOpen && (
            <div className="absolute z-20 mt-1 w-full rounded-sm border border-amber-500/40 bg-popover p-2 space-y-2 shadow-md">
              <TextInput
                placeholder={t("searchIngredientPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filtered.map((ing) => (
                  <button
                    type="button"
                    key={ing.id}
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectIngredient(index, ing);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono hover:bg-amber-500/15 hover:text-amber-500 transition-colors"
                  >
                    {getLocalizedName(ing, locale)}
                  </button>
                ))}
                {searchQuery.trim() && !exactMatch && (
                  <button
                    type="button"
                    onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await onCreateInlineIngredient(index, searchQuery);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold"
                  >
                    {t("createInline", { query: searchQuery })}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
