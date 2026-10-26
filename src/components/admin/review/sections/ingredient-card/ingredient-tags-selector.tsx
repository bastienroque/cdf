"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Plus, X, Check, ChevronDown } from "lucide-react";

import { useCatalogPicker } from "@/lib/use-catalog-picker";
import type { CatalogItem } from "@/lib/use-catalog-search";
import { getLocalizedName } from "@/lib/utils";
import { CatalogSearchPanel } from "../../catalog-search-panel";

interface IngredientTagsSelectorProps {
  index: number;
  tagIds: string[];
  tagsMaster: CatalogItem[];
  onToggleTag: (ingIndex: number, tagId: string) => void;
  onCreateInlineTag: (ingIndex: number, tagName: string) => Promise<void>;
}

// Module-level defaults keep the same reference between renders
const EMPTY_TAG_IDS: string[] = [];
const EMPTY_TAGS: CatalogItem[] = [];

export function IngredientTagsSelector({
  index,
  tagIds = EMPTY_TAG_IDS,
  tagsMaster = EMPTY_TAGS,
  onToggleTag,
  onCreateInlineTag,
}: IngredientTagsSelectorProps) {
  const t = useTranslations("admin.reviews.form");
  const locale = useLocale();

  const picker = useCatalogPicker({
    items: tagsMaster,
    locale,
    onCreate: (tagName) => onCreateInlineTag(index, tagName),
    // closeAfterCreate stays false: the admin may want to add more tags
  });

  // O(1) lookups instead of includes()/find() inside render loops
  const attachedIds = useMemo(() => new Set(tagIds), [tagIds]);
  const tagsById = useMemo(
    () => new Map(tagsMaster.map((tag) => [tag.id, tag])),
    [tagsMaster],
  );

  return (
    <div
      ref={picker.containerRef}
      className="space-y-2 pt-2 border-t border-border/40"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
          {t("tagsLabel")}
        </span>
        <button
          type="button"
          aria-expanded={picker.isOpen}
          aria-controls={picker.panelId}
          onClick={picker.toggle}
          className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 hover:text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/30 transition-colors cursor-pointer"
        >
          {picker.isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{picker.isOpen ? t("close") : t("addTags")}</span>
        </button>
      </div>

      {picker.isOpen && (
        <CatalogSearchPanel
          picker={picker}
          placeholder={t("searchTagPlaceholder")}
          createLabel={t("createInlineTag", { query: picker.trimmedQuery })}
          className="p-3"
          listClassName="max-h-36"
          renderItem={({ item, label }) => {
            const isAttached = attachedIds.has(item.id);
            return (
              <button
                type="button"
                aria-pressed={isAttached}
                onClick={() => onToggleTag(index, item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-mono transition-colors ${
                  isAttached
                    ? "bg-amber-500/20 text-amber-600 font-bold"
                    : "hover:bg-muted text-left"
                }`}
              >
                <span>{label}</span>
                {isAttached && (
                  <Check
                    className="h-3 w-3 text-amber-600"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          }}
        />
      )}

      {/* Selected Tag Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {tagIds.map((tagId) => {
          const tag = tagsById.get(tagId);
          if (!tag) return null;
          const label = getLocalizedName(tag, locale);
          return (
            <span
              key={tagId}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-xs bg-amber-500/15 border border-amber-500/30 text-amber-600"
            >
              {label}
              <button
                type="button"
                aria-label={t("removeTag", { name: label })}
                onClick={() => onToggleTag(index, tagId)}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          );
        })}
        {tagIds.length === 0 && !picker.isOpen && (
          <span className="font-mono text-xs text-muted-foreground italic">
            {t("noTags")}
          </span>
        )}
      </div>
    </div>
  );
}
