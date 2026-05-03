import { test, expect } from "@playwright/test";

const ROUTES: Array<{ path: string; activeHref: string }> = [
  { path: "/hub", activeHref: "/hub" },
  { path: "/hub/flashcards", activeHref: "/hub/flashcards" },
  { path: "/hub/checklists", activeHref: "/hub/checklists" },
  { path: "/hub/scripts", activeHref: "/hub/scripts" },
  { path: "/hub/bible", activeHref: "/hub/bible" },
  { path: "/hub/branding", activeHref: "/hub/branding" },
];

test.describe("HubNav — sticky nav across /hub/*", () => {
  for (const { path, activeHref } of ROUTES) {
    test(`${path} renders nav with correct active link`, async ({ page }) => {
      await page.goto(path);
      const nav = page.locator("[data-testid='hub-nav']");
      await expect(nav).toBeVisible();
      await expect(nav).toHaveCSS("position", "sticky");
      await expect(nav.locator("a")).toHaveCount(12);
      const active = nav.locator("a[aria-current='page']");
      await expect(active).toHaveCount(1);
      await expect(active).toHaveAttribute("href", activeHref);
    });
  }
});
