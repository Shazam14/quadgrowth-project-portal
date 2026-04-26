import { test, expect } from "@playwright/test";

test("anon → /admin redirects to /login", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login/);
});

test("anon → /hub redirects to /login", async ({ page }) => {
  await page.goto("/hub");
  await expect(page).toHaveURL(/\/login/);
});

test("anon → /portal redirects to /login", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/login/);
});

test("anon → / loads public landing, NOT roadmap", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("http://localhost:3000/");
  // Public landing visible
  await expect(page.locator("h1")).toContainText("Internal Portal");
  await expect(page.locator("a[href='/login']")).toBeVisible();
  // Roadmap content is NOT exposed publicly (moved to /admin/roadmap)
  const body = page.locator("body");
  await expect(body).not.toContainText("Build Guide");
  await expect(body).not.toContainText("Phase 1 — Foundation");
});

test("anon → /admin/roadmap redirects to /login", async ({ page }) => {
  await page.goto("/admin/roadmap");
  await expect(page).toHaveURL(/\/login/);
});
