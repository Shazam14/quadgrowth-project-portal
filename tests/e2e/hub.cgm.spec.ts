import { test, expect } from "@playwright/test";

test.describe("CGM — /hub landing", () => {
  test("renders 12 tool cards linking to flashcards/checklists/scripts/bible/branding/pitch-coach/persona-coach/calls/reports/strategy-calls/journey/package", async ({ page }) => {
    await page.goto("/hub");
    const cards = page.locator("[data-testid='hub-tool-card']");
    await expect(cards).toHaveCount(12);
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/flashcards']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/checklists']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/scripts']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/bible']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/branding']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/pitch-coach']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/persona-coach']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/calls']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/reports']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/strategy-calls']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/journey']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/package']")).toBeVisible();
  });
});
