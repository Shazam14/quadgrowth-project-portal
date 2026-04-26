import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/checklists", () => {
  test("page loads with title", async ({ page }) => {
    await page.goto("/hub/checklists");
    await expect(page.locator("h1")).toContainText("Operational Checklists");
  });

  test("renders 5 group sections", async ({ page }) => {
    await page.goto("/hub/checklists");
    const groups = page.locator("[data-testid='checklist-group']");
    await expect(groups).toHaveCount(5);
  });

  test("renders 33 total checkbox items", async ({ page }) => {
    await page.goto("/hub/checklists");
    const items = page.locator("[data-testid='checklist-item']");
    await expect(items).toHaveCount(33);
  });

  test("clicking a checkbox toggles checked state", async ({ page }) => {
    await page.goto("/hub/checklists");
    const first = page.locator("[data-testid='checklist-item']").first();
    const cb = first.locator("input[type='checkbox']");
    await expect(cb).not.toBeChecked();
    await cb.check();
    await expect(cb).toBeChecked();
  });
});
