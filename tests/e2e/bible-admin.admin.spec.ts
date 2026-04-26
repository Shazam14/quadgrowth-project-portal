import { test, expect } from "@playwright/test";

test.describe("Admin — /admin/bible CRUD", () => {
  test("page loads with admin role", async ({ page }) => {
    await page.goto("/admin/bible");
    await expect(page).toHaveURL(/\/admin\/bible/);
    await expect(page.locator("body")).toContainText(/company bible/i);
  });

  test("renders one editable form per entry (16 total)", async ({ page }) => {
    await page.goto("/admin/bible");
    const forms = page.locator("form[data-testid='bible-edit-form']");
    await expect(forms).toHaveCount(16);
  });

  test("each edit form has password + submit", async ({ page }) => {
    await page.goto("/admin/bible");
    const firstForm = page
      .locator("form[data-testid='bible-edit-form']")
      .first();
    await expect(firstForm.locator("input[name='password']")).toBeVisible();
    await expect(firstForm.locator("button[type='submit']")).toBeVisible();
  });

  test("add-new form is present", async ({ page }) => {
    await page.goto("/admin/bible");
    await expect(
      page.locator("form[data-testid='bible-add-form']"),
    ).toBeVisible();
  });

  test("editing Google Ads password persists across reload", async ({ page }) => {
    const testValue = `test-pwd-${Date.now()}`;
    await page.goto("/admin/bible");
    const card = page.locator("[data-entry-name='Google Ads']");
    await card.locator("input[name='password']").fill(testValue);
    const responsePromise = page.waitForResponse(
      (res) =>
        res.request().method() === "POST" && res.url().includes("/admin/bible"),
      { timeout: 15000 },
    );
    await card.locator("button[type='submit']").click();
    const response = await responsePromise;
    console.log("[action] status:", response.status(), response.url());
    if (response.status() >= 400) {
      console.log("[action] body:", await response.text());
    }
    await page.waitForLoadState("networkidle");
    await page.goto("/admin/bible");
    const refreshed = await page
      .locator("[data-entry-name='Google Ads'] input[name='password']")
      .inputValue();
    expect(refreshed).toBe(testValue);
  });
});

test.describe("CGM — /admin/bible blocked", () => {
  test.use({ storageState: "tests/.auth/cgm.json" });
  test("cgm cannot reach /admin/bible → bounced to /hub", async ({ page }) => {
    await page.goto("/admin/bible");
    await expect(page).toHaveURL(/\/hub/);
  });
});
