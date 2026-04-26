import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/branding (Brand Kit)", () => {
  test("page loads and renders the kit wordmark + 6 nav pills", async ({ page }) => {
    await page.goto("/hub/branding");
    await expect(page.locator("[data-testid='brand-kit']")).toBeVisible();
    await expect(page.locator(".kit-wordmark")).toContainText(/QuadGrowth/);
    const pills = page.locator(".nav-pill");
    await expect(pills).toHaveCount(6);
    const labels = await pills.allTextContents();
    expect(labels.map((s) => s.trim())).toEqual([
      "Logo",
      "Colours",
      "Typography",
      "Social Templates",
      "Email Signature",
      "Voice & Tone",
    ]);
  });

  test("logo section is active by default; switching to Colours hides logo", async ({ page }) => {
    await page.goto("/hub/branding");
    await expect(page.locator("#logo")).toHaveClass(/active/);
    await expect(page.locator("#colour")).not.toHaveClass(/active/);

    await page.locator(".nav-pill", { hasText: "Colours" }).click();
    await expect(page.locator("#colour")).toHaveClass(/active/);
    await expect(page.locator("#logo")).not.toHaveClass(/active/);
  });

  test("email-signature section has at least one copy button", async ({ page }) => {
    await page.goto("/hub/branding");
    await page.locator(".nav-pill", { hasText: "Email Signature" }).click();
    await expect(page.locator("#email .copy-btn").first()).toBeVisible();
  });
});
