import { test, expect } from "@playwright/test";

test.describe("Portal — /portal landing", () => {
  test("renders heading and tool grid with ROI Calculator card", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal/);
    await expect(page.locator("h1")).toContainText("Client Portal");
    const grid = page.locator("[data-testid='portal-grid']");
    await expect(grid).toBeVisible();
    const cards = page.locator("[data-testid='portal-tool-card']");
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText("ROI Calculator");
  });

  test("ROI Calculator card links to /portal/roi-calculator", async ({ page }) => {
    await page.goto("/portal");
    await page.locator("[data-testid='portal-tool-card']").first().click();
    await expect(page).toHaveURL(/\/portal\/roi-calculator/);
    await expect(page.locator("[data-testid='roi-calculator']")).toBeVisible();
  });
});
