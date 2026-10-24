import { test, expect } from "@playwright/test";
import { PUBLIC_ROUTES, ROUTES } from "../support/routes";
import { EMPTY_STATE, dataOrEmpty } from "../support/data-state";

test.describe("Every public page loads", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`${path} responds OK with a main landmark and a heading`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status(), `HTTP status for ${path}`).toBeLessThan(400);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    });
  }
});

test.describe("Content lists", () => {
  for (const [label, path, hrefPart] of [
    ["blog", ROUTES.blog, "/blog/"],
    ["events", ROUTES.events, "/events/"],
  ] as const) {
    test(`${label} shows items or an empty state`, async ({ page }) => {
      await page.goto(path);
      const main = page.getByRole("main");
      // Same approach as the restaurants directory: match detail links by URL.
      const items = main.locator(`a[href*='${hrefPart}']:not([href$='${hrefPart.slice(0, -1)}'])`);
      const state = await dataOrEmpty(items, main.getByText(EMPTY_STATE));
      if (state === "empty") await expect(items).toHaveCount(0);
    });
  }
});
