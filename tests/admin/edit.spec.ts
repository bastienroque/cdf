import { test, expect, type Page } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { blockWrites, expectValidationFeedback, formError } from "../support/forms";
import { EMPTY_STATE, dataOrEmpty } from "../support/data-state";
import { MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON } from "../support/env";

// field   = a REQUIRED text field (cleared to test validation, edited to test saving).
// invalid = a FORMAT-validated field plus a value the schema rejects.
// The restaurant form has no required text field (name/address are read-only when editing),
// but Website must be a URL (zod: "URL inválido").
type Resource = {
  name: string;
  list: string;
  field?: RegExp;
  invalid?: { label: RegExp; value: string };
};
const RESOURCES: Resource[] = [
  { name: "restaurant", list: ROUTES.admin.restaurants, invalid: { label: /website/i, value: "not a url" } },
  { name: "review", list: ROUTES.admin.reviews, field: /title|comment|text/i },
  { name: "blog post", list: ROUTES.admin.blog, field: /title/i },
  { name: "event", list: ROUTES.admin.events, field: /title|name/i },
];

const SUBMIT = /save|update/i;

/** Opens the first record's edit page. Returns false when the list is empty. */
async function openFirstEdit(page: Page, list: string): Promise<boolean> {
  await page.goto(list);
  const editLinks = page.getByRole("link", { name: /edit/i });
  const state = await dataOrEmpty(editLinks, page.getByText(EMPTY_STATE));
  if (state === "empty") return false;
  await editLinks.first().click();
  await expect(page).toHaveURL(/\/admin\/.+\/.+/);
  return true;
}

for (const r of RESOURCES) {
  test.describe(`Admin edit: ${r.name}`, () => {
    test("edit page loads the existing record", async ({ page }) => {
      if (!(await openFirstEdit(page, r.list))) return; // empty list: empty state already asserted
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/edit/i);
      await expect(page.getByRole("button", { name: SUBMIT })).toBeVisible();
    });

    if (r.invalid) {
      const { label, value } = r.invalid;

      test("an invalid value is rejected with a visible error and nothing is written", async ({ page }) => {
        if (!(await openFirstEdit(page, r.list))) return;

        const writes = await blockWrites(page);
        const editUrl = page.url();
        await page.getByLabel(label).first().fill(value);
        await page.getByRole("button", { name: SUBMIT }).click();

        await expectValidationFeedback(page);
        expect(page.url()).toBe(editUrl);
        expect(writes).toEqual([]);
      });
    }

    if (r.field) {
      const label = r.field;

      test("clearing the main field shows a validation error", async ({ page }) => {
        if (!(await openFirstEdit(page, r.list))) return;

        const field = page.getByLabel(label).first();
        await expect(field).not.toHaveValue("");

        const writes = await blockWrites(page);
        const editUrl = page.url();
        await field.fill("");
        await page.getByRole("button", { name: SUBMIT }).click();
        await expectValidationFeedback(page);
        expect(page.url()).toBe(editUrl); // still on the form
        expect(writes).toEqual([]); // and nothing was sent to the server
      });

      test("saving a change persists it, then restores the original", async ({ page }) => {
        test.skip(!MUTATIONS_ALLOWED, MUTATIONS_SKIP_REASON);
        if (!(await openFirstEdit(page, r.list))) return;

        const field = page.getByLabel(label).first();
        const original = await field.inputValue();
        const edited = `${original} E2E`;
        const editUrl = page.url();

        try {
          await field.fill(edited);
          await page.getByRole("button", { name: SUBMIT }).click();
          await expect(formError(page)).toHaveCount(0);
          await page.goto(editUrl);
          await expect(page.getByLabel(label).first()).toHaveValue(edited);
        } finally {
          await page.goto(editUrl);
          await page.getByLabel(label).first().fill(original);
          await page.getByRole("button", { name: SUBMIT }).click();
        }

        await page.goto(editUrl);
        await expect(page.getByLabel(label).first()).toHaveValue(original);
      });
    }
  });
}
