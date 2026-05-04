import { test, expect } from "@playwright/test";

const SUB_ROUTES = [
  "/hub/flashcards",
  "/hub/checklists",
  "/hub/scripts",
  "/hub/bible",
  "/hub/branding",
];

test.describe("Hub sub-header — back link on /hub/*", () => {
  test("hub home does not render the sub-header", async ({ page }) => {
    await page.goto("/hub");
    await expect(page.locator("[data-testid='hub-sub-header']")).toHaveCount(0);
  });

  test("hub home shows linked surfaces for portal and roadmap", async ({ page }) => {
    await page.goto("/hub");
    const surfaces = page.locator("[data-testid='hub-linked-surface']");
    await expect(surfaces).toHaveCount(2);
    await expect(surfaces.nth(0)).toHaveAttribute("href", "/portal");
    await expect(surfaces.nth(1)).toHaveAttribute("href", "/roadmap");
  });

  for (const path of SUB_ROUTES) {
    test(`${path} renders sticky sub-header with back-to-hub link`, async ({ page }) => {
      await page.goto(path);
      const header = page.locator("[data-testid='hub-sub-header']");
      await expect(header).toBeVisible();
      await expect(header).toHaveCSS("position", "sticky");
      const back = header.locator("a", { hasText: "Back to Hub" });
      await expect(back).toHaveAttribute("href", "/hub");
    });
  }
});
