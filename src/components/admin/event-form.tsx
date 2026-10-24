"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import {
  createEvent,
  updateEvent,
} from "@/app/[locale]/(admin)/admin/events/actions";
import {
  FieldLabel,
  FieldError,
  TextInput,
  TextArea,
  SelectInput,
  PrimaryButton,
} from "@/components/form/form-field";
import { Calendar, Save, Plus } from "lucide-react";

type Restaurant = { id: string; name: string };

export function EventForm({
  eventId,
  restaurants,
  defaultValues,
}: {
  eventId?: string;
  restaurants: Restaurant[];
  defaultValues?: Partial<EventFormValues>;
}) {
  const t = useTranslations("admin.events.form");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: { restaurantId: null, locale: "en", ...defaultValues },
  });

  async function onSubmit(values: EventFormValues) {
    if (eventId) await updateEvent(eventId, values);
    else await createEvent(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

      {/* Description */}
      <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
        {t("descriptionLabel")}
        <TextArea
          {...register("description")}
          rows={4}
          placeholder={t("descriptionPlaceholder")}
          className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
        />
        <FieldError message={errors.description?.message} />
      </FieldLabel>

      {/* Date & Location Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          {t("dateLabel")}
          <TextInput
            type="date"
            {...register("date")}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          />
          <FieldError message={errors.date?.message} />
        </FieldLabel>

        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          {t("locationLabel")}
          <TextInput
            {...register("location")}
            placeholder={t("locationPlaceholder")}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          />
          <FieldError message={errors.location?.message} />
        </FieldLabel>
      </div>

      {/* Linked Restaurant & Locale Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldLabel className="font-mono text-xs uppercase tracking-wider text-foreground">
          <div className="flex items-center justify-between">
            <span>{t("restaurantLabel")}</span>
            <span className="font-mono text-[10px] normal-case text-muted-foreground">
              {t("restaurantOptional")}
            </span>
          </div>
          <SelectInput
            {...register("restaurantId")}
            className="mt-1 focus-ring rounded-sm border border-border bg-background px-3 py-2 font-body text-sm text-foreground transition-colors hover:border-amber-500/40"
          >
            <option value="">{t("noRestaurant")}</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </SelectInput>
        </FieldLabel>

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
      </div>

      {/* Submit Button */}
      <PrimaryButton
        type="submit"
        disabled={isSubmitting}
        className="focus-ring mt-3 flex items-center justify-center gap-2 rounded-sm bg-amber-500 px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-widest text-black  transition-all hover:bg-amber-400 cursor-pointer disabled:opacity-50"
      >
        {eventId ? (
          <Save className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
        <span>
          {isSubmitting
            ? t("submitting")
            : eventId
              ? t("submitUpdate")
              : t("submitCreate")}
        </span>
      </PrimaryButton>
    </form>
  );
}
