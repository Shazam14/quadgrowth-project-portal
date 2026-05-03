import { test, expect } from "@playwright/test";

test.describe("Journey Timeline — client view (linked to demo-practice)", () => {
  test("client sees their 5 milestones in chronological order with correct statuses", async ({ page }) => {
    await page.goto("/portal/journey");
    await expect(page).toHaveURL(/\/portal\/journey$/);

    await expect(page.locator("[data-testid='journey-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Your Journey");

    const timeline = page.locator("[data-testid='journey-timeline']");
    await expect(timeline).toBeVisible();

    const milestones = page.locator("[data-testid='journey-milestone']");
    await expect(milestones).toHaveCount(5);

    // Status mix from primary seed: 3 done, 1 in_progress, 1 planned.
    await expect(
      page.locator("[data-testid='journey-milestone'][data-status='done']"),
    ).toHaveCount(3);
    await expect(
      page.locator(
        "[data-testid='journey-milestone'][data-status='in_progress']",
      ),
    ).toHaveCount(1);
    await expect(
      page.locator(
        "[data-testid='journey-milestone'][data-status='planned']",
      ),
    ).toHaveCount(1);

    // Chronological asc — oldest first, newest last.
    await expect(milestones.first()).toContainText("Discovery call");
    await expect(milestones.last()).toContainText("Aligners landing page launch");

    // Description shows on the in-progress card.
    const inProgress = page.locator(
      "[data-testid='journey-milestone'][data-status='in_progress']",
    );
    await expect(inProgress).toContainText("deposit-to-book");

    // RLS: secondary clinic's milestones are not visible.
    await expect(page.locator("text=Inner Melbourne discovery")).toHaveCount(0);
    await expect(page.locator("text=Inner Melbourne campaign launch")).toHaveCount(0);
  });
});
