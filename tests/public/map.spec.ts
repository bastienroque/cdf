import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";

test.describe("Interactive map", () => {
  test("map renders; if there are markers, clicking one opens a popup", async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto(ROUTES.map, { waitUntil: "domcontentloaded" });

    // The fixed cookie dialog covers the bottom of the viewport and can block marker clicks.
    await page.getByRole("button", { name: "Decline" }).click();
    await expect(page.getByRole("dialog", { name: /cookie/i })).toBeHidden();

    await expect(page.locator(".leaflet-container"), "map container").toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".leaflet-tile-loaded").first(), "map tiles (needs internet)").toBeVisible({
      timeout: 20_000,
    });

    const markers = page.locator(".leaflet-marker-icon");
    if ((await markers.count()) === 0) {
      await expect(markers).toHaveCount(0); // empty fallback: working map, no data
      return;
    }
    // Short timeout: if something still covers the marker, the log names it.
    await markers.first().click({ timeout: 10_000 });
    await expect(page.locator(".leaflet-popup")).toBeVisible();
  });
});
