import { test, expect } from "@playwright/test";

test.describe("Portal — /portal hero", () => {
  test("renders hero, badge, tagline, progress, and 8 feature pills", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.locator("[data-testid='portal-hero']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("always visible");
    await expect(page.locator("[data-testid='portal-badge']")).toContainText(/Phase 1B/i);
    await expect(page.locator("[data-testid='portal-progress']")).toBeVisible();
    await expect(page.locator("[data-testid='portal-progress']")).toContainText("2 of 8");
    const pills = page.locator("[data-testid='portal-pill']");
    await expect(pills).toHaveCount(8);
  });

  test("ROI calculator + Live lead feed are the active pills", async ({ page }) => {
    await page.goto("/portal");
    const active = page.locator("[data-testid='portal-pill'][data-active='true']");
    await expect(active).toHaveCount(2);
    await expect(active).toContainText(["Live lead feed", "ROI calculator"]);
  });

  test("ROI calculator pill links to /portal/roi-calculator", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "ROI calculator",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/roi-calculator/);
    await expect(page.locator("[data-testid='roi-calculator']")).toBeVisible();
  });

  test("Live lead feed pill links to /portal/leads", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Live lead feed",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/leads/);
    await expect(page.locator("[data-testid='leads-page']")).toBeVisible();
  });

  test("the other 6 pills are tagged Soon (not links)", async ({ page }) => {
    await page.goto("/portal");
    const soon = page.locator("[data-testid='portal-pill'][data-active='false']");
    await expect(soon).toHaveCount(6);
    await expect(soon.first()).toContainText("Soon");
  });
});
