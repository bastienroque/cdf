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

const POLL_INTERVAL_MS = 100;
const LOAD_TIMEOUT_MS = 15_000;

function isGoogleMapsReady(): boolean {
  return typeof google !== "undefined" && Boolean(google.maps);
}

// Resolves once the Google Maps script is available (or the component unmounts).
// Rejects after a timeout so a missing or blocked script surfaces as an error
// instead of polling forever.
function waitForGoogleMaps(isCancelled: () => boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      if (isCancelled() || isGoogleMapsReady()) {
        clearInterval(timer);
        resolve();
      } else if (Date.now() - startedAt > LOAD_TIMEOUT_MS) {
        clearInterval(timer);
        reject(new Error("Google Maps script did not load in time"));
      }
    }, POLL_INTERVAL_MS);
  });
}

// Accessibility attributes for the <gmp-place-autocomplete> web component
function applyAria(
  el: HTMLElement,
  error: string | undefined,
  labelId: string,
  descriptionId: string,
) {
  el.setAttribute("aria-labelledby", labelId);
  if (error) {
    el.setAttribute("aria-invalid", "true");
    el.setAttribute("aria-describedby", descriptionId);
  } else {
    el.removeAttribute("aria-invalid");
    el.removeAttribute("aria-describedby");
  }
}

export function AddressAutocomplete({
  onSelect,
  error,
}: {
  onSelect: (place: PlaceSelection) => void;
  error?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(
    null,
  );
  const onSelectRef = useRef(onSelect);
  const errorRef = useRef(error);
  const labelId = useId();
  const descriptionId = useId();

  // Keep the latest callback without re-creating the autocomplete element
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the autocomplete element once. It is NOT re-created when `error`
  // changes, so the admin's typed text is not lost when validation fails.
  useEffect(() => {
    let cancelled = false;

    async function handleSelect(event: Event) {
      const { placePrediction } =
        event as google.maps.places.PlacePredictionSelectEvent;
      const place = placePrediction.toPlace();

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
        components.find((c) => c.types.includes("locality"))?.longText ?? "";

      onSelectRef.current({
        name: place.displayName ?? "",
        address: place.formattedAddress ?? "",
        city,
        lat: place.location?.lat() ?? 0,
        lng: place.location?.lng() ?? 0,
        phone: place.internationalPhoneNumber ?? null,
        website: place.websiteURI ?? null,
      });
    }

    async function init() {
      const container = containerRef.current;
      if (!container || container.hasChildNodes()) return;

      if (!isGoogleMapsReady()) {
        await waitForGoogleMaps(() => cancelled);
        if (cancelled) return;
      }

      const { PlaceAutocompleteElement } = (await google.maps.importLibrary(
        "places",
      )) as google.maps.PlacesLibrary;

      if (cancelled) return;

      const el = new PlaceAutocompleteElement();
      applyAria(el, errorRef.current, labelId, descriptionId);

      el.addEventListener("gmp-select", (event) => {
        handleSelect(event).catch((err: unknown) => {
          console.error("Failed to fetch place details", err);
        });
      });

      container.appendChild(el);
      elementRef.current = el;
    }

    init().catch((err: unknown) => {
      console.error("Failed to load Google Places autocomplete", err);
    });

    return () => {
      cancelled = true;
      elementRef.current?.remove();
      elementRef.current = null;
    };
  }, [labelId, descriptionId]);

  // Update accessibility attributes when the error changes
  useEffect(() => {
    errorRef.current = error;
    if (elementRef.current) {
      applyAria(elementRef.current, error, labelId, descriptionId);
    }
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
