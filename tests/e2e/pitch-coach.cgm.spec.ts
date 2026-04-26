import { test, expect } from "@playwright/test";

test.describe("CGM — /hub/pitch-coach (AI Pitch Coach)", () => {
  test("page renders heading, status bar, and start session button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await expect(page.locator("[data-testid='pitch-coach']")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Pitch Coach/i);
    await expect(page.locator("[data-testid='pitch-coach-statusbar']")).toBeVisible();
    await expect(page.locator("[data-testid='pitch-coach-start']")).toBeVisible();
  });

  test("Start session reveals coach opener, input, mic, and end button", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await expect(page.locator("[data-testid='pitch-coach-transcript']")).toContainText(/Pitch coach here/);
    await expect(page.locator("[data-testid='pitch-coach-input']")).toBeEnabled();
    await expect(page.locator("[data-testid='pitch-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-mic']")).toBeVisible();
    await expect(page.locator("[data-testid='pitch-coach-end']")).toBeVisible();
  });

  test("submit enables once input has text", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    const input = page.locator("[data-testid='pitch-coach-input']");
    const submit = page.locator("[data-testid='pitch-coach-submit']");
    await expect(submit).toBeDisabled();
    await input.fill("Lead said pricing is too high.");
    await expect(submit).toBeEnabled();
  });

  test("submitting streams a response into the transcript", async ({ page }) => {
    await page.route("**/api/pitch-coach", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "- Strong: framing the value.\n- Weak: too long.\n\nNext move: trim to 30 seconds.",
      });
    });

    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await page.locator("[data-testid='pitch-coach-input']").fill("Critique my 60-second pitch.");
    await page.locator("[data-testid='pitch-coach-submit']").click();

    const transcript = page.locator("[data-testid='pitch-coach-transcript']");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("Critique my 60-second pitch");
    await expect(transcript).toContainText(/Next move/);
  });

  test("End session locks the input and hides the end and mic buttons", async ({ page }) => {
    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await page.locator("[data-testid='pitch-coach-end']").click();
    await expect(page.locator("[data-testid='pitch-coach-input']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-submit']")).toBeDisabled();
    await expect(page.locator("[data-testid='pitch-coach-end']")).toHaveCount(0);
    await expect(page.locator("[data-testid='pitch-coach-mic']")).toHaveCount(0);
  });

  test("Score this session renders pill metrics + summary after End", async ({ page }) => {
    await page.route("**/api/pitch-coach", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "text/plain; charset=utf-8",
        body: "- Strong: clear hook.\n- Weak: long.\n\nNext move: trim by 20s.",
      });
    });
    await page.route("**/api/score-session", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          metrics: { clarity: 8, relevance: 7, objection_handling: 5, rapport: 6, cta_strength: 6 },
          overall: 7,
          strengths: ["Hook landed early", "Concrete benefit named"],
          improvements: ["Cut filler words", "Add a sharper close"],
          suggested_rewrite: "Want me to send a 30-second Loom showing the exact ROI math?",
          summary: "Good pitch foundations. Final ask needs more bite.",
        }),
      });
    });

    await page.goto("/hub/pitch-coach");
    await page.locator("[data-testid='pitch-coach-start']").click();
    await page.locator("[data-testid='pitch-coach-input']").fill("Critique my 60-second pitch.");
    await page.locator("[data-testid='pitch-coach-submit']").click();
    await expect(page.locator("[data-testid='pitch-coach-transcript']")).toContainText(/Next move/);

    await page.locator("[data-testid='pitch-coach-end']").click();

    const scoreBtn = page.locator("[data-testid='pitch-coach-score']");
    await expect(scoreBtn).toBeVisible();
    await scoreBtn.click();

    const card = page.locator("[data-testid='pitch-coach-scorecard']");
    await expect(card).toBeVisible();
    await expect(page.locator("[data-testid='pitch-coach-scorecard-overall']")).toContainText("7");
    await expect(page.locator("[data-testid='pitch-coach-scorecard-summary']")).toContainText(
      /Final ask needs more bite/,
    );
    await expect(card).toContainText("Cut filler words");
    await expect(card).toContainText("Want me to send a 30-second Loom");
  });
});
