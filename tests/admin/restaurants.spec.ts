import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { uniqueName } from "../support/data";
import { blockWrites, expectValidationFeedback } from "../support/forms";
import { installFakePlaces, selectFakePlace } from "../support/fake-places";
import { MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON } from "../support/env";

test.describe("Admin restaurants", () => {
  // FAILS until RestaurantForm passes `error` to <AddressAutocomplete> (see review notes).
  test("submitting without picking an address shows a visible error and writes nothing", async ({ page }) => {
    await installFakePlaces(page);
    await page.goto(ROUTES.admin.restaurantsNew);
    await expect(page.locator("fake-place-autocomplete")).toBeVisible();

    const writes = await blockWrites(page);
    await page.getByRole("button", { name: /create/i }).click();

    await expectValidationFeedback(page);
    await expect(page).toHaveURL(/restaurants\/new/);
    expect(writes).toEqual([]);
  });

  test("create -> listed -> delete -> gone (self-cleaning)", async ({ page }) => {
    test.skip(!MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON);
    const name = uniqueName("Restaurant");

    await installFakePlaces(page);
    await page.goto(ROUTES.admin.restaurantsNew);
    await expect(page.locator("fake-place-autocomplete")).toBeVisible();
    await selectFakePlace(page, {
      name,
      address: "Rua do Teste 1, 1000-001 Lisboa, Portugal",
      city: "Lisboa",
      lat: 38.7223,
      lng: -9.1393,
    });

    await page.getByRole("button", { name: /create/i }).click();
    await expect(page).not.toHaveURL(/restaurants\/new/);

    await page.goto(ROUTES.admin.restaurants);
    await expect(page.getByText(name).first()).toBeVisible();

    // Cleanup. GUESS: a row-scoped delete button with a confirm dialog. If your UI differs,
    // this fails and leaves one record named "E2E Restaurant ..." to delete by hand.
    const row = page.getByRole("row", { name: new RegExp(name) });
    await row.getByRole("button", { name: /delete|remove/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /confirm|yes|delete/i }).click();
    await expect(page.getByText(name)).toHaveCount(0);
  });
});
