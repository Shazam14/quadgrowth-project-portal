import { test, expect } from "@playwright/test";

test.describe("KPIs — admin view (aggregate across all clinics)", () => {
  test("renders 3 KPI cards with numeric values", async ({ page }) => {
    await page.goto("/portal/kpis");
    await expect(page).toHaveURL(/\/portal\/kpis$/);

    await expect(page.locator("[data-testid='kpis-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("KPI Overview");

    await expect(page.locator("[data-testid='kpi-leads']")).toBeVisible();
    await expect(page.locator("[data-testid='kpi-bookings']")).toBeVisible();
    await expect(page.locator("[data-testid='kpi-revenue']")).toBeVisible();

    for (const tid of ["kpi-leads", "kpi-bookings", "kpi-revenue"]) {
      const card = page.locator(`[data-testid='${tid}']`);
      const value = await card.getAttribute("data-value");
      expect(value).not.toBeNull();
      expect(Number(value)).not.toBeNaN();
      expect(Number(value)).toBeGreaterThanOrEqual(0);
    }
  });

  test("revenue card formats as AUD", async ({ page }) => {
    await page.goto("/portal/kpis");
    const revenue = page.locator("[data-testid='kpi-revenue'] .kpis__card-value");
    await expect(revenue).toContainText("$");
  });

  test("each card shows a trend line vs last month", async ({ page }) => {
    await page.goto("/portal/kpis");
    await expect(page.locator("[data-testid='kpi-leads-trend']")).toBeVisible();
    await expect(page.locator("[data-testid='kpi-bookings-trend']")).toBeVisible();
    await expect(page.locator("[data-testid='kpi-revenue-trend']")).toBeVisible();
  });
});
