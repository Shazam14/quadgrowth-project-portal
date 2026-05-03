import { test, expect } from "@playwright/test";

test.describe("Package & Account — client view (linked to demo-practice)", () => {
  test("client sees their package card with growth tier, monthly value, billing contact, and renewal date", async ({ page }) => {
    await page.goto("/portal/package");
    await expect(page).toHaveURL(/\/portal\/package$/);

    await expect(page.locator("[data-testid='package-page']")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Your Package");

    const card = page.locator("[data-testid='package-card']");
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-tier", "growth");

    await expect(page.locator("[data-testid='package-tier']")).toContainText(
      "Growth",
    );

    // Monthly value (AUD $4500 → "$4,500" in en-AU).
    await expect(page.locator("[data-testid='package-monthly']")).toContainText(
      "$4,500",
    );

    // Renewal date — seeded as 2026-12-15.
    await expect(page.locator("[data-testid='package-renewal']")).toContainText(
      "15 December 2026",
    );

    // Billing contact.
    await expect(page.locator("[data-testid='package-billing']")).toContainText(
      "Dr Aisha Patel",
    );
    await expect(page.locator("[data-testid='package-billing']")).toContainText(
      "billing@demopractice.com.au",
    );

    // Notes.
    await expect(page.locator("[data-testid='package-notes']")).toContainText(
      "12-month locked commitment",
    );

    // RLS: the secondary clinic's package is not visible.
    await expect(page.locator("text=Practice Manager")).toHaveCount(0);
    await expect(page.locator("text=admin@secondclinic.com.au")).toHaveCount(0);
  });
});
