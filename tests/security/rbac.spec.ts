import { test, expect } from "@playwright/test";
import { ADMIN_ROUTES } from "../support/routes";

// Non-admin users are anonymous visitors (no accounts exist), so this is the whole RBAC check.
// Edit routes use a placeholder id: auth must redirect BEFORE any lookup happens.
test.describe("Anonymous visitors cannot reach admin routes", () => {
  for (const path of ADMIN_ROUTES) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(/(login|auth|unauthorized)/);
    });
  }
});
