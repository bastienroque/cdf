import { expect, type Page } from "@playwright/test";

// A real, visible form error. Excludes Next.js's hidden route announcer (role="alert",
// id="__next-route-announcer__"), which otherwise makes validation tests pass falsely.
export const formError = (page: Page) =>
  page
    .locator('[role="alert"]:not(#__next-route-announcer__), .text-destructive')
    .filter({ hasText: /\S/ })
    .first();

/**
 * After clicking submit, the user must get feedback: either the browser blocked the
 * submit natively (required / type=email), or the app showed a visible error.
 */
export async function expectValidationFeedback(page: Page) {
  const blockedNatively = await page
    .locator("form")
    .first()
    .evaluate((f) => !(f as HTMLFormElement).noValidate && !(f as HTMLFormElement).checkValidity());
  if (blockedNatively) return;
  await expect(formError(page)).toBeVisible();
}

/**
 * Aborts every POST (Next.js server actions are POSTs) and records the attempts, so a
 * validation test can never write to the database even if validation regresses.
 * Usage: const writes = await blockWrites(page); ...; expect(writes).toEqual([]);
 */
export async function blockWrites(page: Page): Promise<string[]> {
  const attempts: string[] = [];
  await page.route("**/*", (route) => {
    const req = route.request();
    if (req.method() === "POST") {
      attempts.push(req.url());
      return route.abort();
    }
    return route.continue();
  });
  return attempts;
}
