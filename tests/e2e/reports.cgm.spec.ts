import { test, expect } from "@playwright/test";

test.describe("Monthly Reports — CGM hub (assigned to demo-practice)", () => {
  test("CGM sees compose form + reports for assigned client (incl. draft)", async ({ page }) => {
    await page.goto("/hub/reports");
    await expect(page).toHaveURL(/\/hub\/reports$/);

    await expect(page.locator("[data-testid='reports-hub-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Monthly Reports");

    // Compose form with the assigned client visible in the dropdown.
    const compose = page.locator("[data-testid='reports-hub-compose']");
    await expect(compose).toBeVisible();
    await expect(compose.locator("select[name='client_id']")).toBeVisible();
    await expect(compose.locator("input[name='month']")).toBeVisible();
    await expect(compose.locator("input[name='win_1']")).toBeVisible();
    await expect(compose.locator("textarea[name='challenge']")).toBeVisible();
    await expect(compose.locator("textarea[name='focus']")).toBeVisible();

    // Seed: 3 reports for primary (assigned). Secondary (not assigned) hidden.
    const rows = page.locator("[data-testid='reports-hub-row']");
    await expect(rows).toHaveCount(3);

    // CGMs see drafts AND published.
    await expect(page.locator("[data-status='draft']")).toHaveCount(1);
    await expect(page.locator("[data-status='published']")).toHaveCount(2);

    // Secondary's published report is not visible (RLS).
    await expect(page.locator("text=Inner Melbourne")).toHaveCount(0);
  });

  test("clicking a row opens the edit page", async ({ page }) => {
    await page.goto("/hub/reports");
    await page.locator("[data-testid='reports-hub-row']").first().click();
    await expect(page).toHaveURL(/\/hub\/reports\/[0-9a-f-]{36}$/);
    await expect(page.locator("[data-testid='reports-hub-edit']")).toBeVisible();
  });
});
