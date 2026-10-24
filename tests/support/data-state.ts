import { expect, type Locator } from "@playwright/test";

// Text your UI shows when a list has nothing to display. Adjust to your real copy (per locale).
export const EMPTY_STATE =
  /no (results|restaurants|reviews|entries|events|posts|articles)|nothing (here|yet)|published yet|check back soon|coming soon|empty/i;

/**
 * Waits until the page shows either real items or an empty state, then reports which one.
 * Fails (with a clear message) if neither appears, so a broken page can never pass.
 */
export async function dataOrEmpty(items: Locator, empty: Locator): Promise<"data" | "empty"> {
  await expect(
    items.first().or(empty.first()).first(),
    "Page rendered neither data nor an empty state",
  ).toBeVisible();
  return (await items.count()) > 0 ? "data" : "empty";
}
