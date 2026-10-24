import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";

test.describe("Mobile drawer", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile projects only");

  test("opens with scroll lock, no horizontal overflow, and closes on navigation", async ({ page }) => {
    await page.goto(ROUTES.home);
    const toggle = page.getByRole("button", { name: /toggle menu|menu/i });
    await expect(toggle).toBeVisible();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      ),
    ).toBe(false);

    await page.getByRole("link", { name: /leaderboard|honor roll/i }).first().click();
    await expect(page).toHaveURL(/\/en\/leaderboard/);

    // Drawer closed and scroll lock released
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
});
