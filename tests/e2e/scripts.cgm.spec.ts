import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/scripts", () => {
  test("page loads with title", async ({ page }) => {
    await page.goto("/hub/scripts");
    await expect(page.locator("h1")).toContainText("Lead Gen Scripts");
  });

  test("renders 6 script entries", async ({ page }) => {
    await page.goto("/hub/scripts");
    const scripts = page.locator("[data-testid='script-entry']");
    await expect(scripts).toHaveCount(6);
  });

  test("expanding a script reveals its steps", async ({ page }) => {
    await page.goto("/hub/scripts");
    const first = page.locator("[data-testid='script-entry']").first();
    // Use native <details> — open via summary click
    await first.locator("summary").click();
    await expect(first.locator("[data-testid='script-step']").first()).toBeVisible();
  });
});
