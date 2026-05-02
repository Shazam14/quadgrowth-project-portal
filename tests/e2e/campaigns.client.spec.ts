import { test, expect } from "@playwright/test";

test.describe("Campaigns — client view (linked to demo-practice)", () => {
  test("client sees their 4 channel cards with statuses and notes", async ({ page }) => {
    await page.goto("/portal/campaigns");
    await expect(page).toHaveURL(/\/portal\/campaigns$/);

    await expect(page.locator("[data-testid='campaigns-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Campaign Status");

    const cards = page.locator("[data-testid='campaigns-card']");
    await expect(cards).toHaveCount(4);

    // Channels render in canonical order
    const channels = await cards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-channel")),
    );
    expect(channels).toEqual(["google_ads", "meta_ads", "gbp", "landing_page"]);

    // All 4 primary-clinic campaigns are live (per seed data)
    const statuses = page.locator("[data-testid='campaigns-status']");
    await expect(statuses).toHaveCount(4);
    for (let i = 0; i < 4; i++) {
      await expect(statuses.nth(i)).toContainText("Live");
    }

    // Primary client's notes visible; secondary client's notes are not (RLS isolation)
    await expect(
      page.locator("text=Bondi & Eastern Suburbs targeting"),
    ).toBeVisible();
    await expect(page.locator("text=Inner Melbourne")).toHaveCount(0);
    await expect(page.locator("text=creative refresh")).toHaveCount(0);
  });
});
