import { test, expect } from "@playwright/test";

test.describe("Journey Timeline — CGM hub (assigned to demo-practice)", () => {
  test("CGM sees compose form + milestones for assigned client", async ({ page }) => {
    await page.goto("/hub/journey");
    await expect(page).toHaveURL(/\/hub\/journey$/);

    await expect(
      page.locator("[data-testid='journey-hub-page']"),
    ).toBeVisible();
    await expect(page.locator("h1")).toContainText("Journey Timeline");

    // Compose form.
    const compose = page.locator("[data-testid='journey-hub-compose']");
    await expect(compose).toBeVisible();
    await expect(compose.locator("select[name='client_id']")).toBeVisible();
    await expect(compose.locator("input[name='occurred_on']")).toBeVisible();
    await expect(compose.locator("select[name='status']")).toBeVisible();
    await expect(compose.locator("input[name='title']")).toBeVisible();
    await expect(compose.locator("textarea[name='description']")).toBeVisible();

    // Seed: 5 milestones for primary (3 done, 1 in_progress, 1 planned). Secondary hidden.
    const rows = page.locator("[data-testid='journey-hub-row']");
    await expect(rows).toHaveCount(5);
    await expect(
      page.locator("[data-testid='journey-hub-row'][data-status='done']"),
    ).toHaveCount(3);
    await expect(
      page.locator(
        "[data-testid='journey-hub-row'][data-status='in_progress']",
      ),
    ).toHaveCount(1);
    await expect(
      page.locator(
        "[data-testid='journey-hub-row'][data-status='planned']",
      ),
    ).toHaveCount(1);

    // Secondary's content (RLS isolation).
    await expect(page.locator("text=Inner Melbourne discovery")).toHaveCount(0);
  });

  test("clicking a row opens the edit page", async ({ page }) => {
    await page.goto("/hub/journey");
    await page.locator("[data-testid='journey-hub-row']").first().click();
    await expect(page).toHaveURL(/\/hub\/journey\/[0-9a-f-]{36}$/);
    await expect(
      page.locator("[data-testid='journey-hub-edit']"),
    ).toBeVisible();
  });
});
