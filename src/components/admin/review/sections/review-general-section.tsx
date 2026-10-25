"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useController, useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  FieldLabel,
  FieldError,
  TextInput,
} from "@/components/form/form-field";

type RestaurantOption = { id: string; name: string };

// Lowercase and strip accents so "sao" matches "São" and "cafe" matches "Café"
function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function RestaurantCombobox({
  restaurants,
}: {
  restaurants: RestaurantOption[];
}) {
  const t = useTranslations("admin.reviews.form");
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { field } = useController({ name: "restaurantId", control });

  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = restaurants.find((r) => r.id === field.value);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return restaurants;
    return restaurants.filter((r) => normalize(r.name).includes(q));
  }, [restaurants, query]);

  // Keep the highlighted option visible when navigating with the keyboard
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${listboxId}-option-${activeIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open, listboxId]);

  function selectRestaurant(restaurant: RestaurantOption) {
    field.onChange(restaurant.id);
    setQuery("");
    setOpen(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        // Don't submit the whole form while the list is open
        if (open) {
          e.preventDefault();
          if (filtered[activeIndex]) selectRestaurant(filtered[activeIndex]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  }

  return (
    <FieldLabel>
      {t("restaurantLabel")}
      <div className="relative">
        <TextInput
          ref={field.ref}
          name={field.name}
          type="text"
          autoComplete="off"
          role="combobox"
          aria-label={t("restaurantLabel")}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && filtered[activeIndex]
              ? `${listboxId}-option-${activeIndex}`
              : undefined
          }
          value={open ? query : (selected?.name ?? "")}
          placeholder={selected?.name ?? t("selectRestaurant")}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setQuery("");
            field.onBlur();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />

        {open && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-background py-1 shadow-lg"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 font-body text-sm text-muted-foreground">
                {t("noRestaurantsFound")}
              </li>
            ) : (
              filtered.map((r, index) => (
                <li
                  key={r.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={r.id === field.value}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectRestaurant(r)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`cursor-pointer px-3 py-2 font-body text-sm ${
                    index === activeIndex
                      ? "bg-amber-500/15 text-foreground"
                      : "text-foreground"
                  } ${r.id === field.value ? "font-semibold" : ""}`}
                >
                  {r.name}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <FieldError message={errors.restaurantId?.message as string} />
    </FieldLabel>
  );
}

export function ReviewGeneralSection({
  restaurants,
}: {
  restaurants: RestaurantOption[];
}) {
  const t = useTranslations("admin.reviews.form");
  const { register, formState } = useFormContext();
  const { errors } = formState;

  return (
    <div className="space-y-4">
      <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
        {t("generalInfo")}
      </h2>

      <RestaurantCombobox restaurants={restaurants} />

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
