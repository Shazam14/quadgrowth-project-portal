import { test, expect } from "@playwright/test";

test.describe("Admin — /admin landing", () => {
  test("renders heading and tool grid with 2 cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("h1")).toContainText("Admin");
    const grid = page.locator("[data-testid='admin-grid']");
    await expect(grid).toBeVisible();
    const cards = page.locator("[data-testid='admin-tool-card']");
    await expect(cards).toHaveCount(2);
    await expect(grid).toContainText("CEO Roadmap");
    await expect(grid).toContainText("Company Bible CRUD");
  });

  test("Roadmap card links to /admin/roadmap", async ({ page }) => {
    await page.goto("/admin");
    await page.locator("[data-testid='admin-tool-card']", { hasText: "CEO Roadmap" }).click();
    await expect(page).toHaveURL(/\/admin\/roadmap/);
  });

  test("Bible card links to /admin/bible", async ({ page }) => {
    await page.goto("/admin");
    await page.locator("[data-testid='admin-tool-card']", { hasText: "Company Bible" }).click();
    await expect(page).toHaveURL(/\/admin\/bible/);
  });
});
