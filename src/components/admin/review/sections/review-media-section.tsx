"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { FieldLabel, FieldError, TextArea } from "@/components/form/form-field";
import { FileUploadButton } from "@/components/form/file-upload-button";
import { uploadToStorage } from "@/lib/upload-to-storage";
import { X } from "lucide-react";

export function ReviewMediaSection() {
  const t = useTranslations("admin.reviews.form");
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const [uploading, setUploading] = useState(false);
  const photos = watch("photos") ?? [];

  return (
    <div className="space-y-4 border-t border-border/60 pt-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
        {t("mediaHeading")}
      </h2>
      <FieldLabel>
        {t("reviewTextLabel")}
        <TextArea
          {...register("text")}
          rows={5}
          placeholder={t("reviewTextPlaceholder")}
        />
        <FieldError message={errors.text?.message as string} />
      </FieldLabel>

      <div className="flex flex-col gap-2">
        <p className="font-body text-xs text-foreground font-semibold">
          {t("photosLabel", { current: photos.length, max: 3 })}
        </p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((url: string) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt=""
                className="h-20 w-20 rounded-sm object-cover border border-border"
              />
              <button
                type="button"
                onClick={() =>
                  setValue(
                    "photos",
                    photos.filter((p: string) => p !== url),
                  )
                }
                className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white p-1 text-xs"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        {photos.length < 3 && (
          <FileUploadButton
            disabled={uploading}
            onFileSelect={async (file) => {
              setUploading(true);
              try {
                const url = await uploadToStorage("review-photos", file);
                setValue("photos", [...photos, url]);
              } finally {
                setUploading(false);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
