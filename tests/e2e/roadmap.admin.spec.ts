import { test, expect } from "@playwright/test";

test.describe("Admin — /admin/roadmap", () => {
  test("admin can view the roadmap with full content", async ({ page }) => {
    await page.goto("/admin/roadmap");
    await expect(page).toHaveURL(/\/admin\/roadmap/);
    const body = page.locator("body");
    await expect(body).toContainText("Phase 1");
    await expect(body).toContainText("Build Guide");
  });
});
