"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TextInput, PrimaryButton } from "@/components/form/form-field";
import { Check, Trash2 } from "lucide-react";
import {
  deleteCatalogItem,
  updateCatalogTranslation,
} from "@/app/[locale]/(admin)/admin/reviews/actions";
import { CustomButton } from "../../ui/custom-button";

interface CatalogItem {
  id: string;
  type: "ingredient" | "tag";
  category: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
}

export function UpdateTranslationForm({ item }: { item: CatalogItem }) {
  const tCatalog = useTranslations("admin.catalog");
  const tCommon = useTranslations("common");

  const [namePt, setNamePt] = useState(item.namePt);
  const [nameEn, setNameEn] = useState(item.nameEn || "");
  const [nameFr, setNameFr] = useState(item.nameFr || "");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      await updateCatalogTranslation(item.type, item.id, {
        namePt,
        nameEn: nameEn.trim() || null,
        nameFr: nameFr.trim() || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(tCatalog("form.confirmDelete", { name: namePt }))) {
      return;
    }

    setDeleting(true);
    try {
      await deleteCatalogItem(item.type, item.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
    >
      <div>
        <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
          {tCatalog("form.ptLabel")}
        </label>
        <TextInput
          value={namePt}
          onChange={(e) => setNamePt(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
          {tCatalog("form.enLabel")}
        </label>
        <TextInput
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder={tCatalog("form.placeholder")}
        />
      </div>

      <div>
        <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
          {tCatalog("form.frLabel")}
        </label>
        <TextInput
          value={nameFr}
          onChange={(e) => setNameFr(e.target.value)}
          placeholder={tCatalog("form.placeholder")}
        />
      </div>

      <div className="flex items-center justify-between md:justify-end gap-2">
        <CustomButton
          type="submit"
          disabled={loading || deleting}
          size="md"
          className="w-auto"
        >
          {loading ? tCommon("actions.saving") : tCommon("actions.save")}
        </CustomButton>

        <CustomButton
          type="button"
          onClick={handleDelete}
          disabled={loading || deleting}
          variant="secondary"
          intent="destructive"
          size="icon"
          title={tCatalog("form.deleteTitle")}
        >
          <Trash2 className="h-4 w-4" />
        </CustomButton>

        {saved && (
          <span className="text-green-600 inline-flex items-center gap-1 font-mono text-xs">
            <Check className="h-4 w-4" /> {tCommon("actions.saved")}
          </span>
        )}
      </div>
    </form>
  );
}
