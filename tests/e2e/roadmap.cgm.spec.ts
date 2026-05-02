import { test, expect } from "@playwright/test";

test.describe("Roadmap — /roadmap", () => {
  test("cgm can view the roadmap with full content", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page).toHaveURL(/\/roadmap/);
    const body = page.locator("body");
    await expect(body).toContainText("Phase 1");
  });
});
