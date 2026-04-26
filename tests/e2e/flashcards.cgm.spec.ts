import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/flashcards", () => {
  test("page loads with title", async ({ page }) => {
    await page.goto("/hub/flashcards");
    await expect(page.locator("h1")).toContainText("Q&A Flashcards");
  });

  test("renders 5 category filter pills (incl. All)", async ({ page }) => {
    await page.goto("/hub/flashcards");
    const pills = page.locator("[data-testid='qa-filter']");
    // All + 5 cats = 6
    await expect(pills).toHaveCount(6);
  });

  test("shows 24 total Q&A cards in source data", async ({ page }) => {
    await page.goto("/hub/flashcards");
    // Cards are rendered one-at-a-time; total is exposed in progress text
    await expect(page.locator("[data-testid='qa-total']")).toContainText("24");
  });

  test("clicking flashcard flips to show answer", async ({ page }) => {
    await page.goto("/hub/flashcards");
    const card = page.locator("[data-testid='qa-card']");
    await expect(card).not.toHaveClass(/flipped/);
    await card.click();
    await expect(card).toHaveClass(/flipped/);
  });

  test("Next button advances index", async ({ page }) => {
    await page.goto("/hub/flashcards");
    const indicator = page.locator("[data-testid='qa-current']");
    await expect(indicator).toContainText("1");
    await page.locator("[data-testid='qa-next']").click();
    await expect(indicator).toContainText("2");
  });
});
