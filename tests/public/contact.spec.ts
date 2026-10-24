import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { expectValidationFeedback } from "../support/forms";
import { MUTATIONS_ALLOWED } from "../support/env";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.contact);
  });

  test("empty submit is blocked with feedback", async ({ page }) => {
    await page.locator('form button[type="submit"]').click();
    await expectValidationFeedback(page);
    await expect(page.locator("form")).toBeVisible(); // still the form, no success state
  });

  test("rejects an invalid email address", async ({ page }) => {
    // getByLabel works only once labels are linked to inputs (htmlFor/id): that is the point.
    await page.getByLabel(/name/i).first().fill("Visitor");
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByLabel(/message/i).fill("A valid message body.");
    await page.locator('form button[type="submit"]').click();

    const typeMismatch = await page
      .locator('input[type="email"]')
      .evaluate((el) => (el as HTMLInputElement).validity.typeMismatch);
    expect(typeMismatch).toBe(true);
    await expectValidationFeedback(page);
    await expect(page.locator("form")).toBeVisible();
  });

  test("a valid message shows the success state", async ({ page }) => {
    // SENDS A REAL EMAIL through sendContactEmail unless the provider is stubbed.
    test.skip(!MUTATIONS_ALLOWED, "Sends an email. Set E2E_ALLOW_MUTATIONS=true with a stubbed provider.");

    await page.getByLabel(/name/i).first().fill("E2E Visitor");
    await page.getByLabel(/email/i).fill("visitor@example.com");
    await page.getByLabel(/message/i).fill("E2E test message, please ignore.");
    await page.locator('form button[type="submit"]').click();

    // Success state replaces the form with an <h3> (language-independent check)
    await expect(page.locator("form")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 3 })).toBeVisible();
  });
});
