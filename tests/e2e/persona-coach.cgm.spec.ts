import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/persona-coach (AI Persona Coach)", () => {
  test("page renders 3 persona cards (hardest/medium/easier) with badges and avatars", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await expect(page.locator("[data-testid='persona-coach']")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Persona Coach/i);
    const cards = page.locator("[data-testid='persona-card']");
    await expect(cards).toHaveCount(3);
    await expect(page.locator(".persona-card__badge--hardest")).toBeVisible();
    await expect(page.locator(".persona-card__badge--medium")).toBeVisible();
    await expect(page.locator(".persona-card__badge--easier")).toBeVisible();
  });

  test("clicking a card opens the call shell with selected bar + objections + start button", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await page.locator("[data-testid='persona-card'][data-persona-id='marcus-chen']").click();
    await expect(page.locator("[data-testid='persona-coach-selected']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-selected']")).toContainText("Marcus Chen");
    await expect(page.locator("[data-testid='persona-coach-objections']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-statusbar']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-start']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-change']")).toBeVisible();
  });

  test("Change button returns to the picker grid", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await page.locator("[data-testid='persona-card'][data-persona-id='diana-whitfield']").click();
    await expect(page.locator("[data-testid='persona-coach-selected']")).toBeVisible();
    await page.locator("[data-testid='persona-coach-change']").click();
    await expect(page.locator("[data-testid='persona-coach-grid']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-card']")).toHaveCount(3);
  });

  test("Start session reveals scripted opener and enables input + mic + end button", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await page.locator("[data-testid='persona-card'][data-persona-id='marcus-chen']").click();
    await page.locator("[data-testid='persona-coach-start']").click();
    await expect(page.locator("[data-testid='persona-coach-transcript']")).toContainText(/Marcus speaking/);
    await expect(page.locator("[data-testid='persona-coach-input']")).toBeEnabled();
    await expect(page.locator("[data-testid='persona-coach-mic']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-end']")).toBeVisible();
    await expect(page.locator("[data-testid='persona-coach-change']")).toBeDisabled();
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
    await page.locator("[data-testid='persona-card'][data-persona-id='marcus-chen']").click();
    await page.locator("[data-testid='persona-coach-start']").click();
    await page.locator("[data-testid='persona-coach-input']").fill("Hi Marcus, thanks for taking the call. Mind if I share why I reached out?");
    await page.locator("[data-testid='persona-coach-submit']").click();

    const transcript = page.locator("[data-testid='persona-coach-transcript']");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("thanks for taking the call");
    await expect(transcript).toContainText(/Walk me through the numbers/);
  });

  test("End session locks the input and hides the end and mic buttons", async ({ page }) => {
    await page.goto("/hub/persona-coach");
    await page.locator("[data-testid='persona-card'][data-persona-id='jamie-doyle']").click();
    await page.locator("[data-testid='persona-coach-start']").click();
    await page.locator("[data-testid='persona-coach-end']").click();
    await expect(page.locator("[data-testid='persona-coach-input']")).toBeDisabled();
    await expect(page.locator("[data-testid='persona-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='persona-coach-end']")).toHaveCount(0);
    await expect(page.locator("[data-testid='persona-coach-mic']")).toHaveCount(0);
  });
});
