import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";

test.describe("Review moderation (read-only)", () => {
  test("queue shows reviews with moderation actions, or an explicit empty state", async ({ page }) => {
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

// Approve/reject changes real content, so it must not run on existing data.
// To test it safely we need a review we created ourselves. Open question: how does a
// review become "pending" in your app (public submission form? admin form with a status?).
test.describe("Review moderation (writes)", () => {
  test.fixme(true, "Needs a self-created pending review. See README, open question 1.");

  test("approving a pending review publishes it; rejecting keeps it hidden", async () => {
    // 1. create a pending review titled uniqueName("Review")
    // 2. approve it in /admin/reviews, then confirm it appears on the public restaurant page
    // 3. create another, reject it, confirm it never appears
    // 4. delete both
  });
});
