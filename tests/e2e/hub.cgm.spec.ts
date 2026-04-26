import { test, expect } from "@playwright/test";

test.describe("CGM — /hub landing", () => {
  test("renders 6 tool cards linking to flashcards/checklists/scripts/bible/branding/pitch-coach", async ({ page }) => {
    await page.goto("/hub");
    const cards = page.locator("[data-testid='hub-tool-card']");
    await expect(cards).toHaveCount(6);
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/flashcards']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/checklists']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/scripts']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/bible']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/branding']")).toBeVisible();
    await expect(page.locator("[data-testid='hub-tool-card'][href='/hub/pitch-coach']")).toBeVisible();
  });
});
