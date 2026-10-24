import { test as setup, expect } from "@playwright/test";
import { ADMIN_STATE } from "../../playwright.config";
import { requireEnv } from "../support/env";
import { ROUTES } from "../support/routes";

setup("authenticate as admin", async ({ page }) => {
  await page.goto(ROUTES.login);
  await page.locator('input[type="email"]').fill(requireEnv("TEST_ADMIN_EMAIL"));
  await page.locator('input[type="password"]').fill(requireEnv("TEST_ADMIN_PASSWORD"));
  await page.locator('button[type="submit"]').click();
  await page.waitForLoadState("networkidle");

  await page.goto(ROUTES.admin.dashboard);
  await expect(page).toHaveURL(/\/admin\//, { timeout: 15_000 });
  await page.context().storageState({ path: ADMIN_STATE });
});
