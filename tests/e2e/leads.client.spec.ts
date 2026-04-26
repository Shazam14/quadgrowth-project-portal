import { test, expect } from "@playwright/test";

test.describe("Leads — client view (linked to demo-practice)", () => {
  test("client sees only their own clinic's 10 leads", async ({ page }) => {
    await page.goto("/portal/leads");
    await expect(page).toHaveURL(/\/portal\/leads$/);

    await expect(page.locator("[data-testid='leads-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Live Lead Feed");

    const count = page.locator("[data-testid='leads-count']");
    await expect(count).toHaveAttribute("data-count", "10");

    const rows = page.locator("[data-testid='leads-row']");
    await expect(rows).toHaveCount(10);

    // Own-client leads visible
    await expect(page.locator("text=Sarah Mitchell")).toBeVisible();
    await expect(page.locator("text=Charlotte Lee")).toBeVisible();

    // Other clinic's leads are NOT in the DOM at all (RLS isolation canary)
    await expect(page.locator("text=Henry Walsh")).toHaveCount(0);
    await expect(page.locator("text=Ruby Anderson")).toHaveCount(0);
    await expect(page.locator("text=Zara Khan")).toHaveCount(0);
  });

  test("client lands on /portal hero from /portal", async ({ page }) => {
    await page.goto("/portal");
    await expect(page).toHaveURL(/\/portal$/);
    await expect(page.locator("[data-testid='portal-hero']")).toBeVisible();
  });
});
