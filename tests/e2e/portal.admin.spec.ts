import { test, expect } from "@playwright/test";

test.describe("Portal — /portal hero", () => {
  test("renders hero, badge, tagline, progress, and 8 feature pills", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.locator("[data-testid='portal-hero']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("always visible");
    await expect(page.locator("[data-testid='portal-badge']")).toContainText(/Phase 1B/i);
    await expect(page.locator("[data-testid='portal-progress']")).toBeVisible();
    await expect(page.locator("[data-testid='portal-progress']")).toContainText("7 of 8");
    const pills = page.locator("[data-testid='portal-pill']");
    await expect(pills).toHaveCount(8);
  });

  test("KPI + Leads + Reports + Campaigns + ROI + Next strategy call + Journey timeline are the active pills", async ({ page }) => {
    await page.goto("/portal");
    const active = page.locator("[data-testid='portal-pill'][data-active='true']");
    await expect(active).toHaveCount(7);
    await expect(active).toContainText([
      "KPI dashboard",
      "Live lead feed",
      "Monthly reports",
      "Campaign status",
      "ROI calculator",
      "Next strategy call",
      "Journey timeline",
    ]);
  });

  test("KPI dashboard pill links to /portal/kpis", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "KPI dashboard",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/kpis/);
    await expect(page.locator("[data-testid='kpis-page']")).toBeVisible();
  });

  test("ROI calculator pill links to /portal/roi-calculator", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "ROI calculator",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/roi-calculator/);
    await expect(page.locator("[data-testid='roi-calculator']")).toBeVisible();
  });

  test("Live lead feed pill links to /portal/leads", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Live lead feed",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/leads/);
    await expect(page.locator("[data-testid='leads-page']")).toBeVisible();
  });

  test("Campaign status pill links to /portal/campaigns", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Campaign status",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/campaigns/);
    await expect(page.locator("[data-testid='campaigns-page']")).toBeVisible();
  });

  test("Monthly reports pill links to /portal/reports", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Monthly reports",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/reports/);
    await expect(page.locator("[data-testid='reports-page']")).toBeVisible();
  });

  test("Next strategy call pill links to /portal/strategy-calls", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Next strategy call",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/strategy-calls/);
    await expect(page.locator("[data-testid='strategy-calls-page']")).toBeVisible();
  });

  test("Journey timeline pill links to /portal/journey", async ({ page }) => {
    await page.goto("/portal");
    await page
      .locator("[data-testid='portal-pill'][data-active='true']", {
        hasText: "Journey timeline",
      })
      .click();
    await expect(page).toHaveURL(/\/portal\/journey/);
    await expect(page.locator("[data-testid='journey-page']")).toBeVisible();
  });

  test("the other 1 pill is tagged Soon (not link)", async ({ page }) => {
    await page.goto("/portal");
    const soon = page.locator("[data-testid='portal-pill'][data-active='false']");
    await expect(soon).toHaveCount(1);
    await expect(soon.first()).toContainText("Soon");
  });
});
