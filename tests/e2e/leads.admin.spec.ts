import { test, expect } from "@playwright/test";

test.describe("Leads — admin view", () => {
  test("admin sees all 16 seeded leads (both demo clients)", async ({ page }) => {
    await page.goto("/portal/leads");
    await expect(page).toHaveURL(/\/portal\/leads$/);

    await expect(page.locator("[data-testid='leads-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Live Lead Feed");

    const count = page.locator("[data-testid='leads-count']");
    await expect(count).toHaveAttribute("data-count", "16");
    await expect(count).toContainText("16 leads");

    const rows = page.locator("[data-testid='leads-row']");
    await expect(rows).toHaveCount(16);

    // Sample names from each demo client are present
    await expect(page.locator("text=Sarah Mitchell")).toBeVisible();
    await expect(page.locator("text=Henry Walsh")).toBeVisible();
  });

  test("rows show status pills + formatted dates", async ({ page }) => {
    await page.goto("/portal/leads");

    const pills = page.locator("[data-testid='leads-status']");
    await expect(pills).toHaveCount(16);

    // 5 new + 3 contacted + 5 booked + 3 lost = 16
    await expect(
      page.locator("[data-testid='leads-row'][data-status='new']"),
    ).toHaveCount(5);
    await expect(
      page.locator("[data-testid='leads-row'][data-status='contacted']"),
    ).toHaveCount(3);
    await expect(
      page.locator("[data-testid='leads-row'][data-status='booked']"),
    ).toHaveCount(5);
    await expect(
      page.locator("[data-testid='leads-row'][data-status='lost']"),
    ).toHaveCount(3);
  });
});
