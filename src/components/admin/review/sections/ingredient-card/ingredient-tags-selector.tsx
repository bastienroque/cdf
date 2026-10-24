"use client";

import { useState, MouseEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getLocalizedName } from "@/lib/utils";

import { Plus, X, Check, ChevronDown } from "lucide-react";
import { TextInput } from "@/components/form/form-field";

interface TagItem {
  id: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
}

interface IngredientTagsSelectorProps {
  index: number;
  tagIds: string[];
  tagsMaster: TagItem[];
  onToggleTag: (ingIndex: number, tagId: string) => void;
  onCreateInlineTag: (ingIndex: number, tagName: string) => Promise<void>;
}

export function IngredientTagsSelector({
  index,
  tagIds = [],
  tagsMaster = [],
  onToggleTag,
  onCreateInlineTag,
}: IngredientTagsSelectorProps) {
  const t = useTranslations("admin.reviews.form");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (tagsMaster || []).filter((tag) => {
    const localized = getLocalizedName(tag, locale);
    return localized.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exactMatch = (tagsMaster || []).some((tag) => {
    const localized = getLocalizedName(tag, locale);
    return localized.toLowerCase() === searchQuery.trim().toLowerCase();
  });

  return (
    <div className="space-y-2 pt-2 border-t border-border/40">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
          {t("tagsLabel")}
        </span>
        <button
          type="button"
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 hover:text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-sm border border-amber-500/30 transition-colors cursor-pointer"
        >
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          <span>{isOpen ? t("close") : t("addTags")}</span>
        </button>
      </div>

      {isOpen && (
        <div className="p-3 rounded-sm border border-amber-500/40 bg-popover space-y-2 shadow-md">
          <TextInput
            placeholder={t("searchTagPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs"
            autoFocus
          />
          <div className="max-h-36 overflow-y-auto space-y-1">
            {filtered.map((tag) => {
              const isAttached = tagIds.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleTag(index, tag.id);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-xs font-mono transition-colors ${
                    isAttached
                      ? "bg-amber-500/20 text-amber-600 font-bold"
                      : "hover:bg-muted text-left"
                  }`}
                >
                  <span>{getLocalizedName(tag, locale)}</span>
                  {isAttached && <Check className="h-3 w-3 text-amber-600" />}
                </button>
              );
            })}
            {searchQuery.trim() && !exactMatch && (
              <button
                type="button"
                onClick={async (e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  await onCreateInlineTag(index, searchQuery);
                  setSearchQuery("");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold"
              >
                {t("createInlineTag", { query: searchQuery })}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Tag Pills */}
      <div className="flex flex-wrap gap-1.5 pt-1">
        {tagIds.map((tagId) => {
          const tagObj = (tagsMaster || []).find((t) => t.id === tagId);
          if (!tagObj) return null;
          return (
            <span
              key={tagId}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm font-mono text-xs bg-amber-500/15 border border-amber-500/30 text-amber-600"
            >
              {getLocalizedName(tagObj, locale)}
              <button
                type="button"
                onClick={(e: MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleTag(index, tagId);
                }}
                className="hover:text-red-500 transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
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
