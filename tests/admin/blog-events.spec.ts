import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { expectValidationFeedback } from "../support/forms";
import { uniqueName } from "../support/data";
import { MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON } from "../support/env";

test.describe("Admin blog", () => {
  test("empty form shows validation errors", async ({ page }) => {
    await page.goto(ROUTES.admin.blogNew);
    await page.getByRole("button", { name: /create|save/i }).click();
    await expectValidationFeedback(page);
  });

  test("create -> listed -> delete (self-cleaning)", async ({ page }) => {
    test.skip(!MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON);
    const title = uniqueName("Post");
    await page.goto(ROUTES.admin.blogNew);
    await page.getByLabel(/title/i).first().fill(title);
    // Fill other required fields (slug, body, ...) here.
    await page.getByRole("button", { name: /create|save/i }).click();

    await page.goto(ROUTES.admin.blog);
    await expect(page.getByText(title).first()).toBeVisible();

    const row = page.getByRole("row", { name: new RegExp(title) });
    await row.getByRole("button", { name: /delete|remove/i }).click();
    await page.getByRole("dialog").getByRole("button", { name: /confirm|yes|delete/i }).click();
    await expect(page.getByText(title)).toHaveCount(0);
  });
});

test.describe("Admin events", () => {
  test("list renders rows or an explicit empty state", async ({ page }) => {
    await page.goto(ROUTES.admin.events);
    await expect(
      page.getByRole("row").first().or(page.getByText(/no events|nothing here|empty/i).first()),
    ).toBeVisible();
  });
});
