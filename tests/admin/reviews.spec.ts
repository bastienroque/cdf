import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";

test.describe("Review moderation (read-only)", () => {
  test("queue shows reviews with moderation actions, or an explicit empty state", async ({
    page,
  }) => {
    await page.goto(ROUTES.admin.reviews);
    const approve = page.getByRole("button", { name: /approve/i });
    const reject = page.getByRole("button", { name: /reject/i });
    const empty = page.getByText(/no (pending )?reviews|nothing|empty/i);

    await expect(approve.first().or(empty.first())).toBeVisible();

    // If something is pending, both actions must be offered for it
    if ((await approve.count()) > 0) {
      await expect(reject.first()).toBeVisible();
    }
  });
});
