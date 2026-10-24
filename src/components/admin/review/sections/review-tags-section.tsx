"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { TextInput, PrimaryButton } from "@/components/form/form-field";
import { createTagInline } from "@/app/[locale]/(admin)/admin/reviews/actions";
import { Plus, X, Check } from "lucide-react";
import { Tag } from "../review-form";

export function ReviewTagsSection({ initialTags }: { initialTags: Tag[] }) {
  const { watch, setValue } = useFormContext();
  const [tagsList, setTagsList] = useState<Tag[]>(initialTags);
  const [showInline, setShowInline] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const selectedTags = watch("selectedTags") ?? [];

  async function handleCreateTag() {
    if (!newTagName.trim()) return;
    const res = await createTagInline({
      category: "style",
      namePt: newTagName.trim(),
      createdLanguage: "pt",
    });
    if (res.success && res.data) {
      setTagsList((prev) => [...prev, res.data]);
      setValue("selectedTags", [...selectedTags, res.data.id]);
      setNewTagName("");
      setShowInline(false);
    }
  }

  return (
    <div className="space-y-4 border-t border-border/60 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
          Review Tags & Characteristics
        </h2>
        <button
          type="button"
          onClick={() => setShowInline(true)}
          className="inline-flex items-center gap-1 font-mono text-xs text-amber-600 hover:text-amber-500"
        >
          <Plus className="h-3.5 w-3.5" /> Add Tag
        </button>
      </div>

      {showInline && (
        <div className="flex items-center gap-2 p-3 rounded-sm border border-amber-500/40 bg-amber-500/5">
          <TextInput
            placeholder="New tag name (e.g., Spicy Sauce)"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            className="w-full"
          />
          <PrimaryButton type="button" onClick={handleCreateTag}>
            Save
          </PrimaryButton>
          <button
            type="button"
            onClick={() => setShowInline(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tagsList.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <button
              type="button"
              key={tag.id}
              onClick={() => {
                if (isSelected) {
                  setValue(
                    "selectedTags",
                    selectedTags.filter((id: string) => id !== tag.id),
                  );
                } else {
                  setValue("selectedTags", [...selectedTags, tag.id]);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs border transition-colors ${
                isSelected
                  ? "border-amber-500 bg-amber-500/15 text-amber-500 font-semibold"
                  : "border-border bg-background text-muted-foreground hover:border-amber-500/40 hover:text-foreground"
              }`}
            >
              {isSelected && <Check className="h-3 w-3" />}
              {tag.namePt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
