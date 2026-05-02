import { test, expect } from "@playwright/test";

test.describe("Strategy Calls — CGM hub (assigned to demo-practice)", () => {
  test("CGM sees compose form + calls for assigned client", async ({ page }) => {
    await page.goto("/hub/strategy-calls");
    await expect(page).toHaveURL(/\/hub\/strategy-calls$/);

    await expect(
      page.locator("[data-testid='strategy-calls-hub-page']"),
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText("Strategy Calls");

    // Compose form.
    const compose = page.locator(
      "[data-testid='strategy-calls-hub-compose']",
    );
    await expect(compose).toBeVisible();
    await expect(compose.locator("select[name='client_id']")).toBeVisible();
    await expect(
      compose.locator("input[name='scheduled_for']"),
    ).toBeVisible();
    await expect(compose.locator("input[name='meeting_url']")).toBeVisible();
    await expect(compose.locator("textarea[name='agenda']")).toBeVisible();

    // Seed: 2 rows for primary (1 scheduled + 1 completed). Secondary hidden.
    const rows = page.locator("[data-testid='strategy-calls-hub-row']");
    await expect(rows).toHaveCount(2);
    await expect(page.locator("[data-status='scheduled']")).toHaveCount(1);
    await expect(page.locator("[data-status='completed']")).toHaveCount(1);

    // Secondary's content (RLS isolation).
    await expect(page.locator("text=Inner Melbourne")).toHaveCount(0);
  });

  test("clicking a row opens the edit page", async ({ page }) => {
    await page.goto("/hub/strategy-calls");
    await page
      .locator("[data-testid='strategy-calls-hub-row']")
      .first()
      .click();
    await expect(page).toHaveURL(/\/hub\/strategy-calls\/[0-9a-f-]{36}$/);
    await expect(
      page.locator("[data-testid='strategy-calls-hub-edit']"),
    ).toBeVisible();
  });
});
