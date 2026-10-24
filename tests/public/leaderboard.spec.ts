import { test, expect } from "@playwright/test";
import { ROUTES } from "../support/routes";
import { EMPTY_STATE, dataOrEmpty } from "../support/data-state";

test.describe("Leaderboard", () => {
  test("entries are ranked by descending score, or an empty state is shown", async ({ page }) => {
    await page.goto(ROUTES.leaderboard);

    // Scoped to <main> so header/footer nav lists are not counted as entries
    const entries = page.getByRole("main").getByRole("listitem");
    const state = await dataOrEmpty(entries, page.getByRole("main").getByText(EMPTY_STATE));

    if (state === "empty") return;

    const texts = await entries.allInnerTexts();
    const scores = texts
      .map((t) => t.match(/\d+(?:[.,]\d+)?/g)?.pop())
      .filter((s): s is string => !!s)
      .map((s) => parseFloat(s.replace(",", ".")));

    expect(scores.length, "Entries rendered but no score could be read from them").toBeGreaterThan(0);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
