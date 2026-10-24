import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { uniqueName } from "../support/data";
import { MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON } from "../support/env";

test.describe("Admin catalog", () => {
  test("creates an ingredient inline while writing a review", async ({ page }) => {
    // Note: leaves an "E2E Ingredient ..." record behind (no delete UI is exercised here).
    test.skip(!MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON);
    const name = uniqueName("Ingredient");

    await page.goto(ROUTES.admin.reviewsNew);
    await page.getByRole("button", { name: /add ingredient|new ingredient/i }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/name.*pt|namePt/i).fill(name);
    await dialog.getByRole("button", { name: /save|create/i }).click();

    await expect(page.getByText(name)).toBeVisible();
  });

  test("translation hub renders on the dashboard", async ({ page }) => {
    await page.goto(ROUTES.admin.dashboard);
    await expect(
      page.getByRole("region", { name: /translation/i }).or(page.getByRole("heading", { name: /translation/i })).first(),
    ).toBeVisible();
  });
});
