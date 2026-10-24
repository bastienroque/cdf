"use client";

import { useState } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { PrimaryButton } from "@/components/form/form-field";
import { Plus, Trash2 } from "lucide-react";
import {
  createIngredientInline,
  createTagInline,
} from "@/app/[locale]/(admin)/admin/reviews/actions";
import { getLocalizedName } from "@/lib/utils";
import { IngredientNameSelector } from "./ingredient-card/ingredient-name-selector";
import { IngredientScoreInput } from "./ingredient-card/ingredient-score-input";
import { IngredientTagsSelector } from "./ingredient-card/ingredient-tags-selector";

export function ReviewIngredientsSection({
  availableIngredients = [],
  availableTags = [],
}: {
  availableIngredients?: {
    id: string;
    namePt: string;
    nameEn: string | null;
    nameFr: string | null;
  }[];
  availableTags?: {
    id: string;
    namePt: string;
    nameEn: string | null;
    nameFr: string | null;
  }[];
}) {
  const t = useTranslations("admin.reviews.form");
  const locale = useLocale(); // Get current active locale ('pt', 'en', 'fr')

  type ValidLocale = "pt" | "en" | "fr";
  const currentLocale = (
    ["pt", "en", "fr"].includes(locale) ? locale : "pt"
  ) as ValidLocale;

  const { control, watch } = useFormContext();

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "reviewIngredients",
  });

  const [ingredientsMaster, setIngredientsMaster] =
    useState(availableIngredients);
  const [tagsMaster, setTagsMaster] = useState(availableTags || []);
  const watchedIngredients = watch("reviewIngredients");

  function addIngredientCard() {
    append({
      id: crypto.randomUUID(),
      ingredientId: "",
      name: "",
      score: null,
      isNotIncluded: false,
      tagIds: [],
    });
  }

  function handleSelectIngredient(
    index: number,
    ing: {
      id: string;
      namePt: string;
      nameEn: string | null;
      nameFr: string | null;
    },
  ) {
    const current = watchedIngredients[index] || {};
    update(index, {
      ...current,
      id: ing.id,
      ingredientId: ing.id,
      name: getLocalizedName(ing, currentLocale),
    });
  }

  async function handleCreateInlineIngredient(index: number, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const res = await createIngredientInline({
      category: "other",
      namePt: trimmedName,
      nameEn: currentLocale === "en" ? trimmedName : undefined,
      nameFr: currentLocale === "fr" ? trimmedName : undefined,
      createdLanguage: currentLocale,
    });

    if (res.success && res.data) {
      setIngredientsMaster((prev) => [...prev, res.data]);
      handleSelectIngredient(index, res.data);
    }
  }

  function handleChangeIngredientName(index: number) {
    const current = watchedIngredients[index] || {};
    update(index, { ...current, name: "", ingredientId: "" });
  }

  function handleScoreChange(index: number, score: number | null) {
    const current = watchedIngredients[index] || {};
    update(index, { ...current, score });
  }

  function handleNotIncludedChange(index: number, checked: boolean) {
    const current = watchedIngredients[index] || {};
    update(index, {
      ...current,
      isNotIncluded: checked,
      score: checked ? 0 : current.score === 0 ? null : current.score,
    });
  }

  function handleToggleTag(ingIndex: number, tagId: string) {
    const current = watchedIngredients[ingIndex] || {};
    const currentTags: string[] = current.tagIds || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];
    update(ingIndex, { ...current, tagIds: newTags });
  }

  async function handleCreateInlineTag(ingIndex: number, tagName: string) {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;

    const res = await createTagInline({
      category: "style",
      namePt: trimmedName,
      nameEn: currentLocale === "en" ? trimmedName : undefined,
      nameFr: currentLocale === "fr" ? trimmedName : undefined,
      createdLanguage: currentLocale,
    });

    if (res.success && res.data) {
      setTagsMaster((prev) => [...prev, res.data]);
      handleToggleTag(ingIndex, res.data.id);
    }
  }

  return (
    <div className="space-y-6 border-t border-border/60 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
          {t("ingredientsHeading")}
        </h2>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const item = watchedIngredients[index] || field;
          return (
            <div
              key={field.id}
              className="relative rounded-sm border border-border bg-card p-4 space-y-4"
            >
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                title={t("removeIngredient")}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <IngredientNameSelector
                name={item.name}
                index={index}
                ingredientsMaster={ingredientsMaster}
                onSelectIngredient={handleSelectIngredient}
                onCreateInlineIngredient={handleCreateInlineIngredient}
                onChangeIngredientName={handleChangeIngredientName}
              />

              <IngredientScoreInput
                score={item.score}
                isNotIncluded={item.isNotIncluded}
                onScoreChange={(score) => handleScoreChange(index, score)}
                onNotIncludedChange={(checked) =>
                  handleNotIncludedChange(index, checked)
                }
              />

              <IngredientTagsSelector
                index={index}
                tagIds={item.tagIds || []}
                tagsMaster={tagsMaster}
                onToggleTag={handleToggleTag}
                onCreateInlineTag={handleCreateInlineTag}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <PrimaryButton
          type="button"
          onClick={addIngredientCard}
          className="inline-flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> {t("addIngredient")}
        </PrimaryButton>
      </div>
    </div>
  );
}
