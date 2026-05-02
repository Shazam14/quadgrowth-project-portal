import { test, expect } from "@playwright/test";

test.describe("Admin — /admin landing", () => {
  test("renders heading and tool grid with 5 cards", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.locator("h1")).toContainText("Admin");
    const grid = page.locator("[data-testid='admin-grid']");
    await expect(grid).toBeVisible();
    const cards = page.locator("[data-testid='admin-tool-card']");
    await expect(cards).toHaveCount(5);
    await expect(grid).toContainText("Sales Hub");
    await expect(grid).toContainText("Client Portal");
    await expect(grid).toContainText("Team");
    await expect(grid).toContainText("Build Roadmap");
    await expect(grid).toContainText("Credentials & Tools");
  });

  test("Roadmap card links to /roadmap", async ({ page }) => {
    await page.goto("/admin");
    await page.locator("[data-testid='admin-tool-card']", { hasText: "Build Roadmap" }).click();
    await expect(page).toHaveURL(/\/roadmap/);
  });

  test("Credentials card links to /admin/bible", async ({ page }) => {
    await page.goto("/admin");
    await page.locator("[data-testid='admin-tool-card']", { hasText: "Credentials & Tools" }).click();
    await expect(page).toHaveURL(/\/admin\/bible/);
  });
});
