import { test, expect } from "@playwright/test";

test.describe("Monthly Reports — client view (linked to demo-practice)", () => {
  test("client sees only published reports for their clinic", async ({ page }) => {
    await page.goto("/portal/reports");
    await expect(page).toHaveURL(/\/portal\/reports$/);

    await expect(page.locator("[data-testid='reports-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Monthly Reports");

    // Seed: primary has March + April published, May is draft.
    const cards = page.locator("[data-testid='reports-card']");
    await expect(cards).toHaveCount(2);

    // Newest first → April before March.
    const months = await cards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-month")),
    );
    expect(months).toEqual(["2026-04-01", "2026-03-01"]);

    // First card has all three sections.
    const first = cards.first();
    await expect(first).toContainText("Wins");
    await expect(first).toContainText("Challenge");
    await expect(first).toContainText("Next month focus");

    // Draft (May) is not visible.
    await expect(page.locator("[data-month='2026-05-01']")).toHaveCount(0);

    // Secondary client's content (RLS isolation).
    await expect(page.locator("text=Inner Melbourne")).toHaveCount(0);
    await expect(page.locator("text=aligners landing page")).toHaveCount(0);
  });
});
