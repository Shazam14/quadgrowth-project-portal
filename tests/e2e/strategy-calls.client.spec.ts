import { test, expect } from "@playwright/test";

test.describe("Strategy Calls — client view (linked to demo-practice)", () => {
  test("client sees the upcoming call + the past completed call", async ({ page }) => {
    await page.goto("/portal/strategy-calls");
    await expect(page).toHaveURL(/\/portal\/strategy-calls$/);

    await expect(page.locator("[data-testid='strategy-calls-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Next Strategy Call");

    // Next-up card.
    const next = page.locator("[data-testid='strategy-calls-next']");
    await expect(next).toBeVisible();
    await expect(next).toContainText("Upcoming");
    await expect(next).toContainText(
      "Review May performance vs target",
    );

    // Join button points at the seeded meeting URL.
    const join = page.locator("[data-testid='strategy-calls-join']");
    await expect(join).toBeVisible();
    await expect(join).toHaveAttribute(
      "href",
      "https://meet.google.com/qgr-demo-strat",
    );

    // Past calls list — 1 completed call from April with a recap.
    const past = page.locator("[data-testid='strategy-calls-past']");
    await expect(past).toBeVisible();
    const pastCards = page.locator("[data-testid='strategy-calls-past-card']");
    await expect(pastCards).toHaveCount(1);
    await expect(pastCards.first()).toContainText("Recap");
    await expect(pastCards.first()).toContainText("SMS-reminder rollout");

    // RLS: secondary clinic's content is not visible.
    await expect(page.locator("text=Inner Melbourne")).toHaveCount(0);
    await expect(page.locator("text=aligners launch debrief")).toHaveCount(0);
  });
});
