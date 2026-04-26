import { test, expect } from "@playwright/test";

test.describe("CGM — /admin/roadmap (blocked)", () => {
  test("cgm is bounced from /admin/roadmap", async ({ page }) => {
    await page.goto("/admin/roadmap");
    // Middleware sends non-admins to their role home (/hub for cgm)
    await expect(page).not.toHaveURL(/\/admin\/roadmap/);
  });
});
