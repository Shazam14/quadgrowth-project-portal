import { test, expect } from "@playwright/test";

test("cgm can reach /hub", async ({ page }) => {
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/hub/);
});

test("cgm cannot reach /admin → bounced to /hub", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/hub/);
});

test("cgm can reach /portal (read access for client-facing visibility)", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/portal/);
});
