import type { Page } from "@playwright/test";

/**
 * Replaces Google's PlaceAutocompleteElement with a test double, so tests need no Maps key,
 * no network, and no API quota. Call BEFORE page.goto().
 */
export async function installFakePlaces(page: Page) {
  // Never let the real Maps script load (it would overwrite the double and spend quota).
  await page.route(/maps\.googleapis\.com|maps\.gstatic\.com/, (route) => route.abort());

  await page.addInitScript(() => {
    class FakePlaceAutocomplete extends HTMLElement {
      connectedCallback() {
        this.innerHTML = '<input aria-label="Search address (test double)" />';
      }
    }
    if (!customElements.get("fake-place-autocomplete")) {
      customElements.define("fake-place-autocomplete", FakePlaceAutocomplete);
    }
    (window as any).google = {
      maps: { importLibrary: async () => ({ PlaceAutocompleteElement: FakePlaceAutocomplete }) },
    };
  });
}

export type FakePlace = { name: string; address: string; city: string; lat: number; lng: number };

/** Fires the same "gmp-select" event the real element emits. */
export async function selectFakePlace(page: Page, place: FakePlace) {
  await page.evaluate((p) => {
    const el = document.querySelector("fake-place-autocomplete");
    if (!el) throw new Error("fake-place-autocomplete not found: was installFakePlaces() called before goto()?");
    const event: any = new Event("gmp-select");
    event.placePrediction = {
      toPlace: () => ({
        fetchFields: async () => {},
        displayName: p.name,
        addressComponents: [{ types: ["locality"], longText: p.city }],
        formattedAddress: p.address,
        location: { lat: () => p.lat, lng: () => p.lng },
        internationalPhoneNumber: null,
        websiteURI: null,
      }),
    };
    el.dispatchEvent(event);
  }, place);
}
