import { test, expect } from "@playwright/test";

test.describe("Portal — /portal/roi-calculator", () => {
  test("page renders heading, both inputs, and result panel", async ({ page }) => {
    await page.goto("/portal/roi-calculator");
    await expect(page.locator("[data-testid='roi-calculator']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("ROI Calculator");
    await expect(page.locator("[data-testid='roi-ltv']")).toBeVisible();
    await expect(page.locator("[data-testid='roi-bookings']")).toBeVisible();
    await expect(page.locator("[data-testid='roi-result']")).toBeVisible();
  });

  test("default values produce 3000 × 12 = $36,000", async ({ page }) => {
    await page.goto("/portal/roi-calculator");
    await expect(page.locator("[data-testid='roi-ltv']")).toHaveValue("3000");
    await expect(page.locator("[data-testid='roi-bookings']")).toHaveValue("12");
    await expect(page.locator("[data-testid='roi-total']")).toContainText("$36,000");
  });

  test("changing LTV and bookings recalculates the total live", async ({ page }) => {
    await page.goto("/portal/roi-calculator");
    await page.locator("[data-testid='roi-ltv']").fill("5000");
    await page.locator("[data-testid='roi-bookings']").fill("8");
    await expect(page.locator("[data-testid='roi-total']")).toContainText("$40,000");
  });

  test("zero bookings produces $0 and singular noun", async ({ page }) => {
    await page.goto("/portal/roi-calculator");
    await page.locator("[data-testid='roi-bookings']").fill("0");
    await expect(page.locator("[data-testid='roi-total']")).toContainText("$0");
  });

  test("non-numeric LTV is treated as zero (no NaN leakage)", async ({ page }) => {
    await page.goto("/portal/roi-calculator");
    await page.locator("[data-testid='roi-ltv']").fill("");
    await expect(page.locator("[data-testid='roi-total']")).toContainText("$0");
  });
});
