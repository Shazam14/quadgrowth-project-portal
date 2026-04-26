import { test, expect } from "@playwright/test";

test.describe("Portal — /portal hero", () => {
  test("renders hero, badge, tagline, progress, and 8 feature pills", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.locator("[data-testid='portal-hero']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("always visible");
    await expect(page.locator("[data-testid='portal-badge']")).toContainText(/Phase 1B/i);
    await expect(page.locator("[data-testid='portal-progress']")).toBeVisible();
    await expect(page.locator("[data-testid='portal-progress']")).toContainText("1 of 8");
    const pills = page.locator("[data-testid='portal-pill']");
    await expect(pills).toHaveCount(8);
  });

  test("ROI calculator pill is the only active pill and links to /portal/roi-calculator", async ({
    page,
  }) => {
    await page.goto("/portal");
    const active = page.locator("[data-testid='portal-pill'][data-active='true']");
    await expect(active).toHaveCount(1);
    await expect(active).toContainText("ROI calculator");
    await expect(active).toContainText("Live");
    await active.click();
    await expect(page).toHaveURL(/\/portal\/roi-calculator/);
    await expect(page.locator("[data-testid='roi-calculator']")).toBeVisible();
  });

  test("the other 7 pills are tagged Soon (not links)", async ({ page }) => {
    await page.goto("/portal");
    const soon = page.locator("[data-testid='portal-pill'][data-active='false']");
    await expect(soon).toHaveCount(7);
    await expect(soon.first()).toContainText("Soon");
  });
});
