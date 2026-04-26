import { test, expect } from "@playwright/test";

test.describe("Admin — /hub/bible", () => {
  test("page loads + shows all 6 category labels", async ({ page }) => {
    await page.goto("/hub/bible");
    await expect(page).toHaveURL(/\/hub\/bible/);
    await expect(page.locator("body")).toContainText("📢 Advertising");
  });

  test("admin sees a password value rendered for every entry", async ({ page }) => {
    await page.goto("/hub/bible");
    await expect(page.locator(".bible__password")).toHaveCount(16);
    await expect(page.locator(".bible__redacted")).toHaveCount(0);
  });
});
