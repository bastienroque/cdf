"use client";

import { SelectInput } from "@/components/form/form-field";
import { useTranslations } from "next-intl";

interface IngredientScoreInputProps {
  score: number | null;
  isNotIncluded: boolean;
  onScoreChange: (score: number | null) => void;
  onNotIncludedChange: (checked: boolean) => void;
}

export function IngredientScoreInput({
  score,
  isNotIncluded,
  onScoreChange,
  onNotIncludedChange,
}: IngredientScoreInputProps) {
  const t = useTranslations("admin.reviews.form");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
      <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
        {t("scoreLabel")}
      </span>
      <div className="sm:col-span-3 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1">
          <SelectInput
            disabled={isNotIncluded}
            value={
              isNotIncluded
                ? "0"
                : score !== null && score !== undefined
                  ? String(score)
                  : ""
            }
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onScoreChange(val);
            }}
            className="w-full"
          >
            <option value="">{t("selectScore")}</option>
            {Array.from({ length: 11 }, (_, i) => (
              <option key={i} value={i}>
                {i}{" "}
                {i === 0 ? t("badLabel") : i === 10 ? t("perfectLabel") : ""}
              </option>
            ))}
          </SelectInput>
        </div>
        <label className="flex items-center gap-2 px-3 py-2 rounded-sm border border-border bg-muted/20 cursor-pointer font-mono text-xs text-foreground select-none hover:border-amber-500/30 transition-colors">
          <span>{t("notIncluded")}</span>
          <input
            type="checkbox"
            checked={isNotIncluded}
            onChange={(e) => onNotIncludedChange(e.target.checked)}
            className="rounded border-border accent-amber-500 h-4 w-4 cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
}
