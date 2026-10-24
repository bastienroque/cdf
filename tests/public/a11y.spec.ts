import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { PUBLIC_ROUTES } from "../support/routes";

test.describe("Accessibility (axe)", () => {
  for (const path of PUBLIC_ROUTES) {
    test(`no serious/critical violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .exclude(".leaflet-container") // third-party map widget, not our markup
        .exclude("nextjs-portal") // Next.js dev overlay, not part of the app
        .analyze();

      const blocking = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");

      // Readable report: rule, severity, how many elements, and where they are
      const report = blocking.map(
        (v) =>
          `[${v.impact}] ${v.id} (${v.nodes.length} element${v.nodes.length === 1 ? "" : "s"}): ${v.help}\n` +
          v.nodes
            .slice(0, 3)
            .map((n) => `    - ${n.target.join(" ")}\n      ${n.failureSummary?.split("\n")[1]?.trim() ?? ""}`)
            .join("\n"),
      );
      expect(blocking, `\n${report.join("\n")}\n`).toEqual([]);
    });
  }
});
