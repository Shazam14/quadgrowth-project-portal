import { test, expect } from "@playwright/test";

test.describe("KPIs — client view (scoped to demo-practice)", () => {
  test("client sees KPI cards aggregated only for own clinic", async ({ page }) => {
    await page.goto("/portal/kpis");
    await expect(page).toHaveURL(/\/portal\/kpis$/);

    await expect(page.locator("[data-testid='kpis-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("KPI Overview");

    const leads = page.locator("[data-testid='kpi-leads']");
    const bookings = page.locator("[data-testid='kpi-bookings']");
    const revenue = page.locator("[data-testid='kpi-revenue']");

    const leadsValue = Number(await leads.getAttribute("data-value"));
    const bookingsValue = Number(await bookings.getAttribute("data-value"));
    const revenueValue = Number(await revenue.getAttribute("data-value"));

    // Client only sees own clinic (10 leads max), so this-month count
    // can never exceed that. Same for last-month via -previous attr.
    const leadsPrev = Number(await leads.getAttribute("data-previous"));
    expect(leadsValue + leadsPrev).toBeLessThanOrEqual(10);

    // Bookings are a subset of leads.
    expect(bookingsValue).toBeLessThanOrEqual(leadsValue);

    // Revenue = bookings × default_ltv (3000).
    expect(revenueValue).toBe(bookingsValue * 3000);
  });
});
