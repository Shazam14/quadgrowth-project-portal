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

test("anon → / loads (public)", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL("http://localhost:3000/");
});
