import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { EMPTY_STATE, dataOrEmpty } from "../support/data-state";

test.describe("Admin restaurants (mobile)", () => {
  test("uses the card layout instead of the desktop table", async ({ page }) => {
    await page.goto(ROUTES.admin.restaurants);

    await expect(page.getByRole("table")).toBeHidden();

    const actions = page.getByRole("link", { name: /edit|view/i });
    const state = await dataOrEmpty(actions, page.getByText(EMPTY_STATE));
    if (state === "empty") await expect(actions).toHaveCount(0);
  });
});
