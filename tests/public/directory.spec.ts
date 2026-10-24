import { test, expect } from "@playwright/test";
import { ROUTES, RESTAURANT_DETAIL_HREF } from "../support/routes";
import { EMPTY_STATE, dataOrEmpty } from "../support/data-state";

test.describe("Public restaurant directory", () => {
  test("opens the first restaurant, or shows an empty state when there are none", async ({ page }) => {
    await page.goto(ROUTES.restaurants);

    const cards = page.locator(
      "a[href*='/restaurant']:not([href$='/restaurants']):not([href$='/restaurantes'])",
    );
    const state = await dataOrEmpty(cards, page.getByText(EMPTY_STATE));

    if (state === "data") {
      await cards.first().click();
      await expect(page).toHaveURL(RESTAURANT_DETAIL_HREF);
      await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty();
    } else {
      await expect(cards).toHaveCount(0);
    }
  });
});
