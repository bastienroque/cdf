import { test, expect, type Page } from "@playwright/test";

// The trigger opens on hover AND toggles on click, so a mouse click opens-then-closes it.
// Keyboard activation (focus + Enter) is deterministic and also covers keyboard access.
async function openSwitcher(page: Page, isMobile: boolean) {
  const trigger = page.getByRole("button", { name: /language switcher/i });
  if (isMobile && !(await trigger.isVisible())) {
    await page.getByRole("button", { name: /toggle menu|menu/i }).click();
  }
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
}

test.describe("Locale switcher", () => {
  for (const target of ["pt", "fr"] as const) {
    test(`EN -> ${target.toUpperCase()} keeps the path`, async ({ page, isMobile }) => {
      await page.goto("/en/leaderboard");
      await openSwitcher(page, isMobile);
      await page.getByRole("button", { name: target.toUpperCase(), exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${target}/leaderboard$`));
    });

    // Currently FAILS: the switcher uses next-intl's usePathname, which drops the query string,
    // so filters like ?sort=asc are lost. See the app-side fix in the review notes.
    test(`EN -> ${target.toUpperCase()} keeps search params`, async ({ page, isMobile }) => {
      await page.goto("/en/restaurants?sort=asc&price=2");
      await openSwitcher(page, isMobile);
      await page.getByRole("button", { name: target.toUpperCase(), exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/${target}/restaurants\\?sort=asc&price=2$`));
    });
  }
});
