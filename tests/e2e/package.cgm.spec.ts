import { test, expect } from "@playwright/test";

test.describe("Package & Account — CGM hub (read-only, assigned to demo-practice)", () => {
  test("CGM sees read-only view of assigned client's package, no edit form", async ({ page }) => {
    await page.goto("/hub/package");
    await expect(page).toHaveURL(/\/hub\/package$/);

    await expect(
      page.locator("[data-testid='package-hub-page']"),
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText("Package & Account");

    // Read-only notice for non-admin.
    await expect(
      page.locator("[data-testid='package-hub-readonly-notice']"),
    ).toBeVisible();

    // RLS: only the assigned client (demo-practice) is visible.
    const rows = page.locator("[data-testid='package-hub-row']");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toHaveAttribute("data-tier", "growth");

    // Read-only display present, no edit form.
    await expect(
      page.locator("[data-testid='package-hub-readonly']"),
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='package-hub-form']"),
    ).toHaveCount(0);
    await expect(
      page.locator("[data-testid='package-hub-save']"),
    ).toHaveCount(0);

    // Read-only display contains seeded values.
    const readonly = page.locator("[data-testid='package-hub-readonly']");
    await expect(readonly).toContainText("$4,500");
    await expect(readonly).toContainText("Dr Aisha Patel");
    await expect(readonly).toContainText("15 Dec 2026");
  });
});
