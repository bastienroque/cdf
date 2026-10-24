"use client";

import { useEffect, useRef, useId } from "react";
import { FieldError } from "@/components/form/form-field";

type PlaceSelection = {
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string | null;
  website: string | null;
};

export function AddressAutocomplete({
  onSelect,
  error,
}: {
  onSelect: (place: PlaceSelection) => void;
  error?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const labelId = useId();
  const descriptionId = useId();

  useEffect(() => {
    let autocompleteEl: any;
    let cancelled = false;

    async function init() {
      if (containerRef.current?.hasChildNodes()) return;

      if (typeof google === "undefined" || !google.maps) {
        await new Promise<void>((resolve) => {
          const check = setInterval(() => {
            if (typeof google !== "undefined" && google.maps) {
              clearInterval(check);
              resolve();
            }
          }, 100);
        });
      }

      const { PlaceAutocompleteElement } =
        await google.maps.importLibrary("places");

      if (cancelled) return;

      autocompleteEl = new PlaceAutocompleteElement();

      // Apply accessibility attributes to the underlying web component input/element if possible,
      // or associate via container attributes depending on Places API shadow DOM structure.
      autocompleteEl.setAttribute("aria-labelledby", labelId);
      if (error) {
        autocompleteEl.setAttribute("aria-invalid", "true");
        autocompleteEl.setAttribute("aria-describedby", descriptionId);
      } else {
        autocompleteEl.removeAttribute("aria-invalid");
        autocompleteEl.removeAttribute("aria-describedby");
      }

      containerRef.current?.appendChild(autocompleteEl);

      autocompleteEl.addEventListener("gmp-select", async (event: any) => {
        const place = event.placePrediction.toPlace();

        await place.fetchFields({
          fields: [
            "displayName",
            "addressComponents",
            "formattedAddress",
            "location",
            "internationalPhoneNumber",
            "websiteURI",
          ],
        });

        const components = place.addressComponents ?? [];
        const city =
          components.find((c: any) => c.types.includes("locality"))?.longText ??
          "";

        onSelectRef.current({
          name: place.displayName ?? "",
          address: place.formattedAddress ?? "",
          city,
          lat: place.location?.lat() ?? 0,
          lng: place.location?.lng() ?? 0,
          phone: place.internationalPhoneNumber ?? null,
          website: place.websiteURI ?? null,
        });
      });
    }

    init();

    return () => {
      cancelled = true;
      autocompleteEl?.remove();
    };
  }, [error, labelId, descriptionId]);

  return (
    <div className="flex flex-col gap-1">
      <span
        id={labelId}
        className="font-body text-ui font-medium text-foreground"
      >
        Restaurant name &amp; address *
      </span>
      <div
        className={`rounded-md border bg-background px-2.5 py-1.5 font-body text-body ${
          error ? "border-destructive" : "border-input"
        }`}
      >
        <div ref={containerRef} />
      </div>
      <div id={descriptionId}>
        <FieldError message={error} />
      </div>
    </div>
  );
}
