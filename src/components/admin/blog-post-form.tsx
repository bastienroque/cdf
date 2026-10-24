"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  blogPostSchema,
  type BlogPostFormValues,
} from "@/lib/validations/blog-post";
import { uploadToStorage } from "@/lib/upload-to-storage";
import {
  createBlogPost,
  updateBlogPost,
} from "@/app/[locale]/(admin)/admin/blog/actions";
import {
  FieldLabel,
  FieldError,
  TextInput,
  TextArea,
  SelectInput,
  PrimaryButton,
} from "@/components/form/form-field";
import { FileUploadButton } from "@/components/form/file-upload-button";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Tag, Image as ImageIcon, X } from "lucide-react";

export function BlogPostForm({
  postId,
  defaultValues,
}: {
  postId?: string;
  defaultValues?: Partial<BlogPostFormValues>;
}) {
  const t = useTranslations("admin.blog.form");
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      tags: [],
      coverImage: null,
      publishedAt: null,
      locale: "en",
      ...defaultValues,
    },
  });

  const coverImage = watch("coverImage");
  const tags = watch("tags") ?? [];

  async function handleCoverChange(file: File) {
    setUploading(true);
    try {
      const url = await uploadToStorage("blog-covers", file);
      setValue("coverImage", url);
    } finally {
      setUploading(false);
    }
  }

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
    }
    setTagInput("");
  }

  async function onSubmit(values: BlogPostFormValues) {
    if (postId) await updateBlogPost(postId, values);
    else await createBlogPost(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Title */}
      <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
        {t("titleLabel")}
        <TextInput
          {...register("title")}
          placeholder={t("titlePlaceholder")}
          className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
        />
        <FieldError message={errors.title?.message} />
      </FieldLabel>

      {/* Content (Markdown) */}
      <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
        {t("contentLabel")}
        <TextArea
          {...register("content")}
          rows={12}
          placeholder={t("contentPlaceholder")}
          className="mt-1 focus-ring rounded-sm border border-border bg-background p-3 font-mono text-sm leading-relaxed text-foreground transition-colors hover:border-amber-500/40"
        />
        <FieldError message={errors.content?.message} />
      </FieldLabel>

      {/* Cover Image Upload */}
      <div className="flex flex-col gap-2 rounded-sm border border-border/80 bg-background p-4 ">
        <p className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>{t("coverLabel")}</span>
        </p>

        {coverImage && (
          <div className="relative overflow-hidden rounded-sm border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="" className="h-40 w-full object-cover" />
            <button
              type="button"
              onClick={() => setValue("coverImage", null)}
              className="absolute top-2 right-2 rounded-sm bg-black/70 p-1 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <FileUploadButton
          label={uploading ? t("uploading") : t("uploadCover")}
          disabled={uploading}
          onFileSelect={handleCoverChange}
        />
      </div>

      {/* Tags Input */}
      <div className="flex flex-col gap-2 rounded-sm border border-border/80 bg-background p-4 ">
        <p className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-amber-600">
          <Tag className="h-3.5 w-3.5" />
          <span>{t("tagsLabel")}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-xs text-amber-600"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "tags",
                    tags.filter((t) => t !== tag),
                  )
                }
                className="ml-1 text-amber-600 hover:text-red-500 cursor-pointer"
              >
                <X className="h-3 w-3 inline-block" />
              </button>
            </Badge>
          ))}
        </div>

        <TextInput
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={t("tagPlaceholder")}
          className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-mono text-xs text-foreground transition-colors hover:border-amber-500/40"
        />
      </div>

      {/* Target Locale & Publication State */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          {t("localeLabel")}
          <SelectInput
            {...register("locale")}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          >
            <option value="pt">{t("locales.pt")}</option>
            <option value="en">{t("locales.en")}</option>
            <option value="fr">{t("locales.fr")}</option>
          </SelectInput>
        </FieldLabel>

        <div className="flex items-end">
          <label className="focus-ring flex h-10 w-full items-center gap-2 rounded-sm border border-border/80 bg-background px-3 font-mono text-xs uppercase tracking-wider text-foreground transition-colors hover:border-amber-500/40 cursor-pointer">
            <input
              type="checkbox"
              checked={!!watch("publishedAt")}
              onChange={(e) =>
                setValue(
                  "publishedAt",
                  e.target.checked ? new Date().toISOString() : null,
                )
              }
              className="accent-amber-500"
            />
            <span>{t("publishLabel")}</span>
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <PrimaryButton
        type="submit"
        disabled={isSubmitting || uploading}
        className="focus-ring mt-3 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black  transition-all hover:bg-amber-400 cursor-pointer disabled:opacity-50"
      >
        {postId ? (
          <Save className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        <span>
          {isSubmitting
            ? t("submitting")
            : postId
              ? t("submitUpdate")
              : t("submitCreate")}
        </span>
      </PrimaryButton>
    </form>
  );
}
