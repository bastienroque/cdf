"use client";

import { Fragment, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TextInput } from "@/components/form/form-field";
import { cn } from "@/lib/utils";
import type { CatalogItem } from "@/lib/use-catalog-search";
import type { CatalogPicker } from "@/lib/use-catalog-picker";

interface CatalogSearchPanelProps<T extends CatalogItem> {
  picker: CatalogPicker<T>;
  placeholder: string;
  createLabel: string;
  /** Renders one result row (usually a button). Keys are handled by the panel. */
  renderItem: (entry: { item: T; label: string }) => ReactNode;
  /** Extra classes for the panel wrapper (positioning, padding) */
  className?: string;
  /** Extra classes for the results list (max height) */
  listClassName?: string;
}

export function CatalogSearchPanel<T extends CatalogItem>({
  picker,
  placeholder,
  createLabel,
  renderItem,
  className,
  listClassName,
}: CatalogSearchPanelProps<T>) {
  const t = useTranslations("admin.reviews.form");

  return (
    <div
      id={picker.panelId}
      className={cn(
        "space-y-2 rounded-sm border border-amber-500/40 bg-popover shadow-md",
        className,
      )}
    >
      <TextInput
        ref={picker.searchRef}
        aria-label={placeholder}
        placeholder={placeholder}
        value={picker.query}
        onChange={(e) => picker.setQuery(e.target.value)}
        className="w-full text-xs"
      />

      <div className={cn("space-y-1 overflow-y-auto", listClassName)}>
        {picker.results.map((entry) => (
          <Fragment key={entry.item.id}>{renderItem(entry)}</Fragment>
        ))}

        {picker.hasMore && (
          <p className="px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {t("keepTypingToNarrow")}
          </p>
        )}

        {picker.canCreate && (
          <button
            type="button"
            disabled={picker.isCreating}
            onClick={() => void picker.create()}
            className="w-full text-left px-2.5 py-1.5 rounded-sm text-xs font-mono bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-semibold disabled:opacity-60"
          >
            {createLabel}
          </button>
        )}

        {picker.createFailed && (
          <p
            role="alert"
            className="px-2.5 py-1 font-mono text-[11px] text-destructive"
          >
            {t("createFailed")}
          </p>
        )}
      </div>
    </div>
  );
}
