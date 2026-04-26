import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/pitch-coach (AI Pitch Coach)", () => {
  test("page renders heading, input, and submit button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await expect(page.locator("[data-testid='pitch-coach']")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Pitch Coach/i);
    await expect(page.locator("[data-testid='pitch-coach-input']")).toBeVisible();
    await expect(page.locator("[data-testid='pitch-coach-submit']")).toBeDisabled();
  });

  test("submit enables once input has text", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
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
    await page.locator("[data-testid='pitch-coach-input']").fill("Critique my 60-second pitch.");
    await page.locator("[data-testid='pitch-coach-submit']").click();

    const transcript = page.locator("[data-testid='pitch-coach-transcript']");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("Critique my 60-second pitch");
    await expect(transcript).toContainText(/Next move/);
  });
});
