"use client";

import { upsertPageContent } from "@/app/[locale]/(admin)/admin/about-pages/actions";
import { useState } from "react";

export function PageContentEditor({
  pageKey,
  locale,
  initialContent,
}: {
  pageKey: string;
  locale: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await upsertPageContent(pageKey, locale, content);
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="rounded border p-3">
      <p className="mb-1 text-sm font-medium uppercase text-muted-foreground">
        {locale}
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full font-mono text-sm"
        placeholder="Markdown content..."
      />
      <button onClick={handleSave} disabled={saving} className="mt-2">
        {saving ? "Saving..." : "Save"}
      </button>
      {saved && <span className="ml-2 text-sm text-green-600">Saved</span>}
    </div>
  );
}
