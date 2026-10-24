"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { SelectInput, FieldError } from "@/components/form/form-field";
import { EXPERIENCE_CATEGORIES } from "@/lib/reviews-categories";

export function ReviewExperienceSection() {
  const t = useTranslations("admin.reviews.form");
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4 border-t border-border/60 pt-6">
      <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
        {t("experienceHeading")}
      </h2>
      <div className="space-y-4">
        {EXPERIENCE_CATEGORIES.map((exp) => {
          const currentValue = watch(exp.field);
          return (
            <div
              key={exp.key}
              className="rounded-sm border border-border bg-card p-4 space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                <span className="font-mono text-xs uppercase tracking-wider text-foreground font-semibold">
                  {exp.label}
                </span>
                <div className="sm:col-span-3">
                  <SelectInput
                    value={
                      currentValue !== undefined && currentValue !== null
                        ? String(currentValue)
                        : ""
                    }
                    onChange={(e) => {
                      const val =
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value);
                      setValue(exp.field, val, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                    className="w-full"
                  >
                    <option value="">{t("selectExperienceScore")}</option>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num}
                        {num === 1
                          ? ` ${t("poorLabel")}`
                          : num === 10
                            ? ` ${t("exceptionalLabel")}`
                            : ""}
                      </option>
                    ))}
                  </SelectInput>
                  <FieldError message={errors[exp.field]?.message as string} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
