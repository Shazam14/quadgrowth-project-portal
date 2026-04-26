import { test, expect } from "@playwright/test";

test("admin can reach /admin", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/);
  await expect(page.locator("body")).toContainText(/admin/i);
});

test("admin can reach /hub (all-access)", async ({ page }) => {
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/hub/);
});

test("admin can reach /portal (all-access)", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/portal/);
});
