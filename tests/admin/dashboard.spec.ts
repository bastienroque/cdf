import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";

test.describe("Admin dashboard", () => {
  test("renders heading and links to each management area", async ({ page }) => {
    await page.goto(ROUTES.admin.dashboard);
    await expect(page.getByRole("heading", { name: /dashboard|admin/i }).first()).toBeVisible();

    for (const area of [/restaurants/i, /reviews/i, /blog/i, /events/i]) {
      await expect(page.getByRole("link", { name: area }).first()).toBeVisible();
    }
  });
});
