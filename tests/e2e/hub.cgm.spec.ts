import { test, expect } from "@playwright/test";

test.describe("CGM — /hub landing", () => {
  test("renders 4 tool cards linking to flashcards/checklists/scripts/bible", async ({ page }) => {
    await page.goto("/hub");
    const cards = page.locator("[data-testid='hub-tool-card']");
    await expect(cards).toHaveCount(4);
    await expect(page.locator("a[href='/hub/flashcards']")).toBeVisible();
    await expect(page.locator("a[href='/hub/checklists']")).toBeVisible();
    await expect(page.locator("a[href='/hub/scripts']")).toBeVisible();
    await expect(page.locator("a[href='/hub/bible']")).toBeVisible();
  });
});
