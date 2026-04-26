import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/bible", () => {
  test("page loads + shows all 6 category labels", async ({ page }) => {
    await page.goto("/hub/bible");
    await expect(page).toHaveURL(/\/hub\/bible/);
    const body = page.locator("body");
    await expect(body).toContainText("📢 Advertising");
    await expect(body).toContainText("🗂 Project Mgmt");
    await expect(body).toContainText("💬 Comms");
    await expect(body).toContainText("⚙️ Infrastructure");
    await expect(body).toContainText("🦷 Client Tools");
    await expect(body).toContainText("💳 Finance");
  });

  test("shows expected tool names from each category", async ({ page }) => {
    await page.goto("/hub/bible");
    const body = page.locator("body");
    await expect(body).toContainText("Google Ads");
    await expect(body).toContainText("Meta Business Suite");
    await expect(body).toContainText("Slack");
    await expect(body).toContainText("Outscraper");
    await expect(body).toContainText("DocuSign / Contract Signing");
  });

  test("renders 16 tool entries", async ({ page }) => {
    await page.goto("/hub/bible");
    const cards = page.locator("[data-testid='bible-entry']");
    await expect(cards).toHaveCount(16);
  });

  test("CGM never sees a rendered password value", async ({ page }) => {
    await page.goto("/hub/bible");
    // The password value element should never render for CGM (RLS hides creds)
    await expect(page.locator(".bible__password")).toHaveCount(0);
    // Every entry shows the redacted placeholder instead
    await expect(page.locator(".bible__redacted")).toHaveCount(16);
  });

  test("access matrix renders 16 tool rows + 5 person columns", async ({ page }) => {
    await page.goto("/hub/bible");
    const matrix = page.locator("[data-testid='bible-access-matrix']");
    await expect(matrix).toBeVisible();
    // 1 header + 16 tool rows
    await expect(matrix.locator("tbody tr")).toHaveCount(16);
    // Header should list 5 people (Jordan, Member 2..5) plus the Tool column
    const headers = matrix.locator("thead th");
    await expect(headers).toHaveCount(6);
    await expect(matrix.locator("thead")).toContainText("Jordan");
    await expect(matrix.locator("thead")).toContainText("Member 2");
  });

  test("Jordan is shown as admin on every tool", async ({ page }) => {
    await page.goto("/hub/bible");
    const adminCells = page.locator("[data-access='admin']");
    await expect(adminCells).toHaveCount(16);
  });

  test("renders 6 security-rule cards", async ({ page }) => {
    await page.goto("/hub/bible");
    const cards = page.locator("[data-testid='security-rule']");
    await expect(cards).toHaveCount(6);
  });
});
