import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/pitch-coach (AI Pitch Coach)", () => {
  test("page renders heading, status bar, and start session button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await expect(page.locator("[data-testid='pitch-coach']")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Pitch Coach/i);
    await expect(page.locator("[data-testid='pitch-coach-statusbar']")).toBeVisible();
    await expect(page.locator("[data-testid='pitch-coach-start']")).toBeVisible();
  });

  test("Start session reveals coach opener, input, and end button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await expect(page.locator("[data-testid='pitch-coach-transcript']")).toContainText(/Pitch coach here/);
    await expect(page.locator("[data-testid='pitch-coach-input']")).toBeEnabled();
    await expect(page.locator("[data-testid='pitch-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-end']")).toBeVisible();
  });

  test("submit enables once input has text", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    const input = page.locator("[data-testid='pitch-coach-input']");
    const submit = page.locator("[data-testid='pitch-coach-submit']");
    await expect(submit).toBeDisabled();
    await input.fill("Lead said pricing is too high.");
    await expect(submit).toBeEnabled();
  });

  test("submitting streams a response into the transcript", async ({ page }) => {
    await page.route("**/api/pitch-coach", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "- Strong: framing the value.\n- Weak: too long.\n\nNext move: trim to 30 seconds.",
      });
    });

    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await page.locator("[data-testid='pitch-coach-input']").fill("Critique my 60-second pitch.");
    await page.locator("[data-testid='pitch-coach-submit']").click();

    const transcript = page.locator("[data-testid='pitch-coach-transcript']");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("Critique my 60-second pitch");
    await expect(transcript).toContainText(/Next move/);
  });

  test("End session locks the input and hides the end button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await page.locator("[data-testid='pitch-coach-end']").click();
    await expect(page.locator("[data-testid='pitch-coach-input']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-end']")).toHaveCount(0);
  });
});
