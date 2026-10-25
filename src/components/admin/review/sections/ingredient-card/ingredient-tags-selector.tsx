"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/utils";
import { Plus, X, Check, ChevronDown } from "lucide-react";
import { TextInput } from "@/components/form/form-field";
import {
  useCatalogSearch,
  useDismiss,
  type CatalogItem,
} from "@/lib/use-catalog-search";

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
  const panelId = useId();

  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createFailed, setCreateFailed] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { query, setQuery, reset, trimmedQuery, results, hasMore, canCreate } =
    useCatalogSearch(tagsMaster, locale);

  // O(1) lookups instead of includes()/find() inside render loops
  const attachedIds = useMemo(() => new Set(tagIds), [tagIds]);
  const tagsById = useMemo(
    () => new Map(tagsMaster.map((tag) => [tag.id, tag])),
    [tagsMaster],
  );

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

  async function handleCreate() {
    if (isCreating) return; // guard against double clicks
    setIsCreating(true);
    setCreateFailed(false);
    try {
      await onCreateInlineTag(index, trimmedQuery);
      reset(); // stay open: the admin may want to add more tags
    } catch (error) {
      console.error("Failed to create tag inline", error);
      setCreateFailed(true);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="space-y-2 pt-2 border-t border-border/40"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
          {t("tagsLabel")}
        </span>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => (isOpen ? close() : setIsOpen(true))}
          className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 hover:text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/30 transition-colors cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{isOpen ? t("close") : t("addTags")}</span>
        </button>
      </div>

      {isOpen && (
        <div
          id={panelId}
          className="p-3 rounded-sm border border-amber-500/40 bg-popover space-y-2 shadow-md"
        >
          <TextInput
            ref={searchRef}
            aria-label={t("searchTagPlaceholder")}
            placeholder={t("searchTagPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-xs"
          />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {results.map(({ item, label }) => {
              const isAttached = attachedIds.has(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
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
            })}

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
                {t("createInlineTag", { query: trimmedQuery })}
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
        {tagIds.length === 0 && !isOpen && (
          <span className="font-mono text-xs text-muted-foreground italic">
            {t("noTags")}
          </span>
        )}
      </div>
    </div>
  );
}
