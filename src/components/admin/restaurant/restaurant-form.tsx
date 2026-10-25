"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  restaurantSchema,
  type RestaurantFormValues,
} from "@/lib/validations/restaurant";
import { AddressAutocomplete } from "@/components/admin/address-autocomplete";
import { uploadToStorage } from "@/lib/upload-to-storage";
import { upsertRestaurant } from "@/app/[locale]/(admin)/admin/restaurants/actions";
import {
  FormField,
  TextInput,
  SelectInput,
  PrimaryButton,
} from "@/components/form/form-field";
import { FileUploadButton } from "../../form/file-upload-button";
import { X, AlertCircle } from "lucide-react";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const priceLabels = ["€", "€€", "€€€", "€€€€"];

export function RestaurantForm({
  restaurantId,
  defaultValues,
}: {
  restaurantId?: string;
  defaultValues?: Partial<RestaurantFormValues>;
}) {
  const t = useTranslations("admin.restaurants");
  const [uploading, setUploading] = useState(false);
  const isEditing = !!restaurantId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      address: "",
      priceRange: 1,
      status: "draft",
      photos: [],
      ...defaultValues,
    },
  });

  const photos = watch("photos") || [];

  async function handlePhotoChange(file: File) {
    setUploading(true);
    try {
      const url = await uploadToStorage("restaurant-photos", file);
      setValue("photos", [...photos, url]);
    } finally {
      setUploading(false);
    }
  }

  function handleRemovePhoto(indexToRemove: number) {
    setValue(
      "photos",
      photos.filter((_, index) => index !== indexToRemove),
    );
  }

  async function onSubmit(values: RestaurantFormValues) {
    try {
      await upsertRestaurant(restaurantId ?? null, values);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }
      setError("root", {
        type: "server",
        message:
          error instanceof Error ? error.message : "Failed to save restaurant",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex max-w-lg flex-col gap-4"
    >
      {errors.root && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 font-body text-body text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errors.root.message}</span>
        </div>
      )}

      {isEditing ? (
        <dl className="flex flex-col gap-1">
          <dt className="font-body text-ui font-medium text-foreground">
            {t("form.nameAddressLabel")}
          </dt>
          <dd className="rounded-md bg-muted px-3 py-2 font-body text-body text-foreground m-0">
            {watch("name")}
            <span className="block font-body text-ui text-muted-foreground">
              {watch("address")}
            </span>
          </dd>
        </dl>
      ) : (
        <div className="flex flex-col gap-1">
          <AddressAutocomplete
            error={errors.address?.message || errors.name?.message}
            onSelect={({ name, address, city, lat, lng, phone, website }) => {
              setValue("name", name);
              setValue("address", address);
              setValue("city", city);
              setValue("lat", lat);
              setValue("lng", lng);
              if (phone) setValue("phone", phone);
              if (website) setValue("website", website);
            }}
          />
        </div>
      )}

      <FormField label={t("form.phoneLabel")} error={errors.phone?.message}>
        {(id) => (
          <TextInput
            id={id}
            {...register("phone")}
            placeholder={t("form.phonePlaceholder")}
          />
        )}
      </FormField>

      <FormField label={t("form.websiteLabel")} error={errors.website?.message}>
        {(id) => (
          <TextInput
            id={id}
            {...register("website")}
            placeholder={t("form.websitePlaceholder")}
          />
        )}
      </FormField>

      <FormField
        label={t("form.priceRangeLabel")}
        error={errors.priceRange?.message}
      >
        {(id) => (
          <SelectInput
            id={id}
            {...register("priceRange", { valueAsNumber: true })}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {priceLabels[n - 1]}
              </option>
            ))}
          </SelectInput>
        )}
      </FormField>

      <div className="flex flex-col gap-2">
        <p className="font-body text-foreground">
          {t("form.photosLabel", { current: photos.length, max: 2 })}
        </p>
        <div className="flex gap-2 flex-wrap">
          {photos.map((url, index) => (
            <div key={url} className="relative group h-20 w-20">
              <img
                src={url}
                alt=""
                className="h-full w-full rounded-md object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                aria-label={t("form.removePhoto")}
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-transform hover:scale-110 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        {photos.length < 2 && (
          <FileUploadButton
            disabled={uploading}
            onFileSelect={handlePhotoChange}
          />
        )}
      </div>

      <FormField label={t("form.statusLabel")} error={errors.status?.message}>
        {(id) => (
          <SelectInput id={id} {...register("status")}>
            <option value="draft">{t("form.statusDraft")}</option>
            <option value="published">{t("form.statusPublished")}</option>
          </SelectInput>
        )}
      </FormField>

      <PrimaryButton type="submit" disabled={isSubmitting || uploading}>
        {isEditing ? t("form.saveChanges") : t("form.createRestaurant")}
      </PrimaryButton>
    </form>
  );
}
