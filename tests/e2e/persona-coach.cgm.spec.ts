import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/persona-coach (AI Persona Coach)", () => {
  test("page renders heading, persona picker (3 options), input, and submit button", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await expect(page.locator("[data-testid='persona-coach']")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Persona Coach/i);
    const select = page.locator("[data-testid='persona-coach-select']");
    await expect(select).toBeVisible();
    await expect(select.locator("option")).toHaveCount(3);
    await expect(page.locator("[data-testid='persona-coach-input']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='persona-coach-blurb']")).toBeVisible();
  });

  test("changing persona updates the blurb", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    const select = page.locator("[data-testid='persona-coach-select']");
    const blurb = page.locator("[data-testid='persona-coach-blurb']");
    const cfoBlurb = await blurb.textContent();
    await select.selectOption("smb-owner");
    await expect(blurb).not.toHaveText(cfoBlurb ?? "");
    await expect(blurb).toContainText(/stall|think about it|info/i);
  });

  test("submitting streams a persona response into the transcript", async ({ page }) => {
    await page.route("**/api/persona-coach", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "Walk me through the numbers. What's the all-in cost in year one?",
      });
    });

    await page.goto("/hub/persona-coach");
    await page.locator("[data-testid='persona-coach-input']").fill("Hi, thanks for taking the call. Mind if I share why I reached out?");
    await page.locator("[data-testid='persona-coach-submit']").click();

    const transcript = page.locator("[data-testid='persona-coach-transcript']");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("thanks for taking the call");
    await expect(transcript).toContainText(/Walk me through the numbers/);
  });
});
