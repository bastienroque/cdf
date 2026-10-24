import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES } from "../support/routes";

test.describe("Public pages expose no admin surface", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`no admin links on ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("a[href*='/admin']")).toHaveCount(0);
    });
  }
});
