"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FieldLabel,
  FieldError,
  TextInput,
  SelectInput,
} from "@/components/form/form-field";

export function ReviewGeneralSection({
  restaurants,
}: {
  restaurants: { id: string; name: string }[];
}) {
  const t = useTranslations("admin.reviews.form");
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
        {t("generalInfo")}
      </h2>
      <FieldLabel>
        {t("restaurantLabel")}
        <SelectInput {...register("restaurantId")}>
          <option value="">{t("selectRestaurant")}</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </SelectInput>
        <FieldError message={errors.restaurantId?.message as string} />
      </FieldLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldLabel>
          {t("visitDateLabel")}
          <TextInput type="date" {...register("visitDate")} />
          <FieldError message={errors.visitDate?.message as string} />
        </FieldLabel>
        <FieldLabel>
          {t("pricePaidLabel")}
          <TextInput
            type="number"
            step="0.01"
            placeholder={t("pricePlaceholder")}
            {...register("pricePaid", {
              setValueAs: (v) => {
                if (v === "") return undefined;
                const n = Number(v);
                return Number.isNaN(n) ? undefined : n;
              },
            })}
          />
        </FieldLabel>
      </div>

      <FieldLabel>
        {t("typeLabel")}
        <TextInput {...register("francesinhaType")} />
        <FieldError message={errors.francesinhaType?.message as string} />
      </FieldLabel>
    </div>
  );
}
